import type { ActorScope } from "../security/access-scope.ts";
import { assertValidActorScope } from "@/lib/security/access-scope";

export type AuthenticatedActor=ActorScope & { authenticated:true };
export function requireAuthenticatedActor(actor:ActorScope|undefined):AuthenticatedActor{
  if(!actor) throw new Error("Authentication required");
  assertValidActorScope(actor);
  return {...actor,authenticated:true};
}
