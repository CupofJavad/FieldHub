# @tgnd/ai

TGND AI layer: rule-based routing (zip, radius, skills), scheduling suggestions, anomaly alerts, document extraction.

## M3.1 – Rule-based routing / recommend top N

- **Zip:** Filter techs by same zip or allow any (config: `sameZipOnly`).
- **Radius:** Filter by distance in miles when `ship_to` and tech have `latitude`/`longitude` (Haversine); config: `maxRadiusMiles`.
- **Skills:** WO can specify `required_skills`; config can add `serviceTypeSkills[service_type]`. Tech must have all required skills when `requireAllSkills` is true.
- **Recommend top N:** `recommendTopN(workOrder, candidates, { topN: 5, ...config })` returns scored, sorted list (closer + same zip + skills match = higher score).

### Usage

```js
const { recommendTopN } = require('@tgnd/ai');

const workOrder = {
  id: 'wo-1',
  ship_to: { zip: '95834' },
  service_type: 'osr',
  required_skills: ['tv_repair'],
};
const candidates = [
  { id: 't1', zip: '95834', skills: ['tv_repair'] },
  { id: 't2', zip: '95814', skills: ['tv_repair'] },
];

const top = recommendTopN(workOrder, candidates, { topN: 2 });
// => [{ candidate: t1, score: 1150, skillsMatch: true }, ...]
```

Optional for radius: set `ship_to.latitude`, `ship_to.longitude` and tech `latitude`/`longitude`; use `maxRadiusMiles` in config.

## Future (M3.2–M3.5)

- M3.2: Scheduling suggestions; anomaly alerts (TAT, rejection, stuck WOs).
- M3.3: Document/notes extraction (LLM) for WO fields.
- M3.4: Optional conversational dispatch.
- M3.5: Integration with AI-led agents (parts, claims, outbound comms).
