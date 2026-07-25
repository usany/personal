import { expect, test } from '@playwright/test';
import { HEALTH_PATH } from './helpers';

// Contract: 01_planner.md §7.1 — GET /api/health -> 200 { status: "ok" }.
// Purpose: liveness + browser-init smoke check. If this fails, every other
// integration test is expected to fail too, so it acts as the canary.
test.describe('GET /api/health', () => {
  test('returns 200 with { status: "ok" }', async ({ request }) => {
    const res = await request.get(HEALTH_PATH);

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
