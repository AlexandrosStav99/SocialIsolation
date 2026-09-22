# TalkPoint MVP Demo Video Instructions

## Purpose

Record a short university-demo video that proves the implemented MVP journey without overstating what has been validated or deployed.

Recommended duration: **4–6 minutes**.

The video should demonstrate:

1. what TalkPoint is;
2. the anonymous 18+ check-in;
3. an exact-match service-discovery journey;
4. factual matching explanations;
5. the Sharing Preview and controlled assisted-handoff path;
6. an honest no-match recovery path;
7. optional proof that the directory is coming from Payload/PostgreSQL;
8. the key privacy/safety boundaries.

Do not present TalkPoint as a live support service, therapist, diagnostic tool, emergency service or production-ready platform.

---

# 1. Pre-recording setup

## Recommended full database-backed demo

Use Node 24 and PostgreSQL 16.

```sh
nvm use
npm ci
cp .env.example .env.local
```

If PostgreSQL is not already running locally, one simple Docker option is:

```sh
docker run --name talkpoint-postgres \
  -e POSTGRES_USER=talkpoint \
  -e POSTGRES_PASSWORD=change-me \
  -e POSTGRES_DB=talkpoint \
  -p 5432:5432 \
  -d postgres:16
```

Ensure `.env.local` includes server-side values equivalent to:

```env
DATABASE_URL=postgresql://talkpoint:change-me@localhost:5432/talkpoint
PAYLOAD_SECRET=local-demo-only-change-me
TALKPOINT_ENABLE_DEMO_DASHBOARD=false
NEXT_PUBLIC_MAPBOX_TOKEN=
OPENAI_API_KEY=
OPENAI_CONVERSATION_MODEL=gpt-5.4-mini
```

Then run:

```sh
npm run payload -- migrate
npm run seed:demo
npm run dev
```

Open:

```text
http://localhost:3000
```

## Confirm the DB-backed directory before recording

Open:

```text
http://localhost:3000/api/directory
```

For the preferred full demo, confirm the response contains:

```json
"label": "Demonstration Data",
"source": "payload_postgres"
```

If it reports `synthetic_fallback`, the UI is still usable for a demo, but do not claim the current run is reading the directory from PostgreSQL.

---

# 2. Recording checklist

Before pressing Record:

- use a clean browser window;
- close personal tabs, notifications, password managers and email;
- use fictional data only;
- zoom the browser so text is comfortably readable in the recording;
- keep the cursor movements slow and deliberate;
- use English for the main walkthrough unless the assessment specifically requires Greek;
- optionally show the Greek switch briefly to prove bilingual support;
- do not enter a real phone number, email address, name or sensitive story;
- do not claim real provider partnerships;
- do not say that AI chooses the provider;
- do not say the product is WCAG compliant, GDPR compliant, clinically validated or production ready.

Recommended recording resolution: **1920×1080** or **2560×1440**, 16:9.

---

# 3. Main demo script

## 0:00–0:25 - Introduce TalkPoint

### Show

Homepage / landing page.

### Say

> TalkPoint is a support-navigation and user-directed referral MVP for adults aged 18 to 30. It helps a user describe the type of support they are looking for, discover relevant services through deterministic routing, and optionally request contact from a selected service after an explicit Sharing Preview and consent step.

Add one short boundary statement:

> It does not diagnose, provide therapy, choose treatment or replace emergency or professional services.

Do not spend too long on the homepage.

---

## 0:25–0:50 - Enter the anonymous check-in

### Show

- Start / check-in CTA.
- Explicit 18+ confirmation.

### Say

> The journey is anonymous-first. There is no user account and the system asks only for an 18-plus confirmation rather than collecting date of birth.

Mention that contact information is not requested during this stage.

---

## 0:50–2:00 - Exact-match journey

Use a scenario that the synthetic directory genuinely supports.

### Recommended scenario

- **Primary topic:** Loneliness & Social Connection
- **Related topic:** Family & Relationships, optional
- **Optional private context:** Skip, or enter a short fictional non-identifying sentence
- **Area:** Nicosia

This path should surface the fictional **Demonstration Community Service** because its synthetic service metadata supports the relevant topic and broad Cyprus/online coverage.

### Narration points

While progressing through the questions, say:

> The interface is conversational, but the routing underneath is deterministic and testable.

At the review screen:

> Before matching, the user can review the structured routing inputs and edit the main topic, related topics or area without restarting the full journey.

If you entered optional free text:

> Optional private context is not used as the sole routing signal and is not shared with providers by default.

---

## 2:00–2:45 - Explainable service discovery

### Show

The exact-match service card.

Pause on:

- provider identity;
- service name;
- `Why this may fit`;
- supported topics;
- coverage;
- delivery modes;
- languages;
- eligibility / access;
- availability;
- demonstration-data disclosure.

### Say

> TalkPoint does not use an LLM to choose providers. Matching is based on structured service metadata and deterministic rules.

Then:

> The explanation is factual. It shows why the service appeared based on the user's selected criteria. It does not display a score, percentage, Best Match label or clinical recommendation.

---

## 2:45–3:40 - Sharing Preview and controlled handoff

### Show

Choose the integrated fictional service and start the assisted-contact path.

Pause on the Sharing Preview.

### Say

> If the user chooses assisted contact, TalkPoint changes from anonymous exploration to an identifiable request only at this point.

Then:

> Before consent, the Sharing Preview shows exactly what would be shared, with which provider, why it is needed, and what is not being shared.

Highlight that the provider does not receive the full conversation, browsing history, AI reasoning or unconsented optional text.

Proceed through the controlled demo consent/handoff using only fictional data.

### Important wording

Say:

> In this university MVP, the handoff is deliberately controlled and fictional. It uses `.invalid` contact data and does not send a real request to a provider.

Do not say a real provider has received the request.

---

## 3:40–4:30 - No-match recovery

Restart the journey.

### Recommended no-match scenario

- **Primary topic:** Financial & Basic Needs
- **Area:** Nicosia

With the deliberately small synthetic directory, this should produce no exact demonstration match.

### Show

- `No exact demonstration match found`;
- change main topic;
- change area;
- browse broader demonstration directory;
- broader service cards labelled as not exact matches.

### Say

> A key design rule is that TalkPoint never forces or fabricates a match. When the current directory cannot satisfy the structured choices, the system says so clearly and offers recovery options while preserving the user's selections.

This is an important MVP behaviour. Do not skip it.

---

# 4. Optional proof sections

Use these only if the video can be slightly longer.

## A. Bilingual support - 15–20 seconds

Switch the journey to Greek and show one or two critical screens.

Say:

> The critical journey is implemented in both English and Greek, including matching, safety, consent and error states.

Do not replay the whole journey in both languages.

## B. PostgreSQL / Payload proof - 15–25 seconds

Open:

```text
http://localhost:3000/api/directory
```

Show:

```json
"source": "payload_postgres"
```

Say:

> The public directory used by the check-in is backed by Payload CMS and PostgreSQL. The synthetic provider and service records are seeded into the database. The static directory is retained only as an explicit resilience fallback.

This is preferable to showing source code during the main product walkthrough.

## C. Synthetic provider dashboard - 20–30 seconds

Only if useful for the assessment.

Set in `.env.local`:

```env
TALKPOINT_ENABLE_DEMO_DASHBOARD=true
```

Restart the app and open `/dashboard`.

State clearly:

> This is a synthetic controlled dashboard preview, not a live provider workspace. The flag enables a demonstration view and is not authentication.

Do not present synthetic metrics as live demand.

---

# 5. Suggested final 20-second conclusion

Use wording close to:

> The implemented TalkPoint MVP demonstrates an anonymous-first support-navigation journey, deterministic and explainable service discovery, honest no-match recovery, a controlled consented handoff boundary, and a Payload/PostgreSQL-backed synthetic directory. The product implementation is technically complete for the controlled university demonstration. Real-user validation, safeguarding review, legal/privacy review and real-provider deployment remain separate evidence and operational steps.

---

# 6. What NOT to say in the video

Avoid these statements unless future evidence genuinely changes the project status:

- “TalkPoint diagnoses what support you need.”
- “AI recommends the best provider.”
- “This is the best match for the user.”
- “TalkPoint is GDPR compliant.”
- “TalkPoint is WCAG 2.2 AA compliant.”
- “The providers shown are partners.”
- “These are live provider requests.”
- “This dashboard shows real demand.”
- “TalkPoint is production ready.”
- “The safety flow has been clinically validated.”
- “The directory covers all support services in Cyprus.”

Prefer precise claims such as:

- “deterministic service discovery”;
- “controlled university demonstration”;
- “synthetic demonstration data”;
- “CI-verified technical implementation”;
- “target WCAG 2.2 AA, with manual validation still open”;
- “Payload/PostgreSQL-backed demonstration directory”.

---

# 7. Recommended editing style

Keep the video calm and product-led.

- Use direct screen capture rather than flashy transitions.
- Cut loading/dead time.
- Use light zoom-ins only when a key UI detail would otherwise be unreadable.
- Add minimal chapter labels such as `Anonymous Check-in`, `Service Discovery`, `Sharing Preview`, `No-match Recovery`, `Database-backed Directory`.
- Keep background music off or extremely low if narration is used.
- Do not cover the UI with large captions.
- Avoid marketing claims not supported by the repository evidence.

---

# 8. Final pre-submission checklist

- [ ] Video uses fictional information only.
- [ ] 18+ gate is visible.
- [ ] Exact-match journey is shown.
- [ ] `Why this may fit` is shown.
- [ ] Sharing Preview is shown.
- [ ] Controlled fictional handoff is described accurately.
- [ ] No-match recovery is shown.
- [ ] No fake provider partnership is implied.
- [ ] No unsupported compliance or production-readiness claim is made.
- [ ] If DB-backed operation is claimed, `/api/directory` shows `payload_postgres` during the recorded run.
- [ ] Audio is understandable and UI text is readable at normal playback size.

For the authoritative product boundary, use `TALKPOINT-MVP-SPEC.md` and `FINAL-MVP-READINESS.md` rather than improvising claims during narration.
