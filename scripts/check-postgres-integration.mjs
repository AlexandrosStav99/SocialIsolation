import { getPayload } from "payload";
import config from "../payload.config.ts";

const payload = await getPayload({ config });
const marker = `CI PostgreSQL ${Date.now()}`;
let organisationId;
let exitCode = 0;

try {
  const organisation = await payload.create({
    collection: "provider-organisations",
    data: { name: marker },
    overrideAccess: true,
  });
  organisationId = organisation.id;

  const found = await payload.find({
    collection: "provider-organisations",
    where: { name: { equals: marker } },
    limit: 1,
    overrideAccess: true,
  });
  if (found.docs.length !== 1) throw new Error("PostgreSQL create/read round trip failed");

  const sessionId = `ci-${crypto.randomUUID()}`;
  await payload.create({
    collection: "ephemeral-sessions",
    data: {
      sessionId,
      stage: "primary_topic",
      secondarySupportTopics: [],
      preferences: [],
      candidateSignals: [],
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    },
    overrideAccess: true,
  });

  const expired = await payload.find({
    collection: "ephemeral-sessions",
    where: { sessionId: { equals: sessionId } },
    limit: 1,
    overrideAccess: true,
  });
  if (expired.docs.length !== 1) throw new Error("Ephemeral session did not persist");

  await payload.delete({
    collection: "ephemeral-sessions",
    where: { sessionId: { equals: sessionId } },
    overrideAccess: true,
  });

  const removed = await payload.find({
    collection: "ephemeral-sessions",
    where: { sessionId: { equals: sessionId } },
    limit: 1,
    overrideAccess: true,
  });
  if (removed.docs.length !== 0) throw new Error("Ephemeral session deletion failed");

  console.log("Live PostgreSQL Payload round-trip passed.");
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  try {
    if (organisationId) {
      await payload.delete({
        collection: "provider-organisations",
        id: organisationId,
        overrideAccess: true,
      });
    }
  } catch (cleanupError) {
    exitCode = 1;
    console.error("PostgreSQL integration cleanup failed:", cleanupError);
  }

  // Payload 3.90.1's Postgres adapter leaks the bootstrap client checked out
  // during connect(), so payload.destroy()/pool.end() cannot drain and hangs.
  // Upstream fixed this in payloadcms/payload#17831, but that fix is not in
  // the v3.90.1 release branch. Force termination only in this one-shot CI
  // proof after all CRUD assertions and cleanup have completed.
  process.exit(exitCode);
}
