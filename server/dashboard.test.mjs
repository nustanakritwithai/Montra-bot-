import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { dashboardServer, recentEvents, validateCommand } from './dashboard.mjs';

test('only supported operators and destinations can become commands', () => {
  for (const command of [
    { bot: 'first', action: 'stop' }, { bot: 'merchant', action: 'destination', mapId: 'village', x: 0, z: 0 },
    { bot: 'constructor', action: 'restart' }, { bot: ['first'], action: 'restart' },
    { bot: 'first', action: 'restart', shell: 'x' }, { bot: 'first', action: 'destination', mapId: 'x/y', x: 0, z: 0 },
    { bot: 'second', action: 'destination', mapId: 'village', x: '0', z: 0 },
  ]) assert.equal(validateCommand(command), null);
  const destination = { bot: 'second', action: 'destination', mapId: 'naga_cavern', x: 1.2, z: 0 };
  assert.deepEqual(validateCommand(destination), destination);
});

test('event feed exposes only approved structured fields', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'montra-dashboard-'));
  const file = join(temp, 'bot.log');
  try {
    await writeFile(file, 'x'.repeat(101000) + '\n' + [
      { event: 'ai_decision', time: '2026-11-14T01:00:00Z', goal: 'HUNT', prompt: 'private' },
      { event: 'chat', time: '2026-11-14T01:00:01Z', message: 'private' },
      { event: 'forge_result', time: '2026-11-14T01:00:02Z', itemId: 'wp_twins_5', rank: 2, cost: 33, requestId: 'private' },
    ].map(value => JSON.stringify(value)).join('\n'));
    const result = await recentEvents(file, 'first');
    assert.deepEqual(result.map(event => event.type), ['forge_result', 'ai_decision']);
    assert.equal(result[0].price, 33);
    assert(!JSON.stringify(result).includes('private'));
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('overview, CORS and commands are authenticated, filtered and serialized', async () => {
  const origin = 'https://example.test';
  const key = randomBytes(32).toString('hex');
  const headers = { Origin: origin, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const calls = [];
  let allowFinish;
  const hold = new Promise(resolve => { allowFinish = resolve; });
  const server = dashboardServer({ root: '.', key, origin, readEvents: async () => [],
    readStatus: async port => port === 34781
      ? { raw: { service: 'montra-bot-v1', state: 'online', level: 61, sessionId: 'private', authentication: { token: 'private' } } }
      : { state: 'offline' },
    run: async (_root, command) => { calls.push(command); await hold; return 'online'; },
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = 'http://127.0.0.1:' + server.address().port;
  const post = command => fetch(root + '/actions', { method: 'POST', headers, body: JSON.stringify(command) });
  try {
    assert.equal((await fetch(root + '/overview')).status, 401);
    assert.equal((await fetch(root + '/overview', { headers: { ...headers, Origin: 'https://other.test' } })).status, 403);
    const preflight = await fetch(root + '/actions', { method: 'OPTIONS', headers: { Origin: origin } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    const response = await fetch(root + '/overview', { headers });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const snapshot = await response.json();
    assert.equal(snapshot.bots.length, 3);
    assert.equal(snapshot.bots[0].level, 61);
    assert(!JSON.stringify(snapshot).includes('private'));
    assert.equal((await post({ bot: 'first', action: 'stop' })).status, 400);
    const pending = post({ bot: 'first', action: 'restart' });
    while (calls.length === 0) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal((await post({ bot: 'merchant', action: 'start' })).status, 409);
    allowFinish();
    assert.equal((await pending).status, 200);
    assert.deepEqual(calls, [{ bot: 'first', action: 'restart' }]);
  } finally { allowFinish(); await new Promise(resolve => server.close(resolve)); }
});
