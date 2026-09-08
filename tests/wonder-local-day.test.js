import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

// Isolated processes set TZ before Date is initialized, including on Windows.
const cases = [
  ['Asia/Dubai', '2026-09-05T21:22:57Z', '2026-09-06', '2026-09-07'],
  ['America/Los_Angeles', '2026-09-06T02:00:00Z', '2026-09-05', '2026-09-06'],
  ['Europe/London', '2026-07-26T23:30:00Z', '2026-07-27', '2026-07-28'],
  ['UTC', '2026-09-06T00:01:00Z', '2026-09-06', '2026-09-07'],
]

for (const [zone, instant, today, tomorrow] of cases) {
  test(`discovery completion respects the child's local day in ${zone}`, () => {
    const moduleUrl = new URL('../src/utils/wonderWhy.js', import.meta.url).href
    const code = `
      import assert from 'node:assert/strict';
      import { completeWonderDiscovery, getFoundationSeasonMapState,
        LEAVES_GREEN_ID, SUNSET_RED_ID } from ${JSON.stringify(moduleUrl)};
      const state = completeWonderDiscovery({}, LEAVES_GREEN_ID, {
        completedAt: Date.parse(${JSON.stringify(instant)}),
      }).state;
      assert.equal(state.lastCompletedDate, ${JSON.stringify(today)});
      assert.equal(state.dailyAssignments[${JSON.stringify(today)}], LEAVES_GREEN_ID);
      const sameDay = getFoundationSeasonMapState({ wonderWhy: state }, ${JSON.stringify(today)});
      assert.equal(sameDay.completedToday, true);
      assert.equal(sameDay.canContinue, false);
      assert.equal(sameDay.currentLesson.id, LEAVES_GREEN_ID);
      const nextDay = getFoundationSeasonMapState({ wonderWhy: state }, ${JSON.stringify(tomorrow)});
      assert.equal(nextDay.canContinue, true);
      assert.equal(nextDay.currentLesson.id, SUNSET_RED_ID);
    `
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
      env: { ...process.env, TZ: zone }, encoding: 'utf8', timeout: 15000,
    })
    assert.equal(result.error, undefined, result.error?.message)
    assert.equal(result.status, 0, result.stderr || result.stdout)
  })
}
