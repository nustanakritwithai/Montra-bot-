import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { battleReader, botRoster, dashboardServer, recentEvents, validateCommand } from './dashboard.mjs';

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
      { event: 'typhoon_plan_outcome', time: '2026-11-14T01:00:03Z', tool: 'use_potion', outcome: 'potion_used', payload: 'private' },
    ].map(value => JSON.stringify(value)).join('\n'));
    const result = await recentEvents(file, 'first');
    assert.deepEqual(result.map(event => event.type), ['typhoon_plan_outcome', 'forge_result', 'ai_decision']);
    assert.equal(result[0].tool, 'use_potion');
    assert.equal(result[0].outcome, 'potion_used');
    assert.equal(result[1].price, 33);
    assert(!JSON.stringify(result).includes('private'));
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('merchant feed retains map evidence even when decision events fill the recent feed', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'montra-dashboard-route-'));
  const file = join(directory, 'merchant.log');
  try {
    const time = seconds => new Date(Date.UTC(2026, 10, 14, 18, 0, seconds)).toISOString();
    const maps = Array.from({ length: 6 }, (_, i) => ({
      event: 'merchant_map_entered', time: time(i), map: i % 2 ? 'moon_cemetery' : 'bound_temple',
    }));
    const activity = Array.from({ length: 26 }, (_, i) => ({ event: 'ai_decision', time: time(i + 6) }));
    activity.push({ event: 'merchant_portal_attempt', time: time(33),
      from: 'bound_temple', to: 'moon_cemetery', destination: 'moon_cemetery', sessionId: 'private' });
    await writeFile(file, [...maps, ...activity].map(row => JSON.stringify(row)).join('\n'));
    const results = await recentEvents(file, 'merchant');
    assert.equal(results.filter(row => row.type === 'merchant_map_entered').length, 6);
    assert.equal(results[0].from, 'bound_temple');
    assert.equal(results[0].to, 'moon_cemetery');
    assert(!JSON.stringify(results).includes('private'));
  } finally { await rm(directory, { recursive: true, force: true }); }
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
      ? { raw: { service: 'montra-bot-v1', state: 'online', level: 61, sessionId: 'private',
        authentication: { token: 'private' }, plan: { tool: 'hunt_camp' },
        agentTools: { ready: { hunt_camp: 2, 'private/': 1 }, automatic: ['navigate_rrt'],
          lastResult: { tool: 'use_potion', outcome: 'potion_used', at: 10, payload: 'private' },
          cycle: { state: 'reentered', action: { tool: 'hunt_camp', option: 'private', outcome: 'unavailable', at: 20 },
            distress: 'dukkha', nextDrive: 'vibhava', scores: { soka: 58, parideva: 0, dukkha: 92, domanassa: 62, upayasa: 0 },
            reasons: ['critical_hp', 'private/'] } } } }
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
    assert.equal(snapshot.bots[0].plan.tool, 'hunt_camp');
    assert.deepEqual(snapshot.bots[0].tools, { ready: ['hunt_camp'], automatic: ['navigate_rrt'],
      lastResult: { tool: 'use_potion', outcome: 'potion_used', at: 10 },
      cycle: { state: 'reentered', action: { tool: 'hunt_camp', outcome: 'unavailable', at: 20 },
        distress: 'dukkha', nextDrive: 'vibhava', scores: { soka: 58, parideva: 0, dukkha: 92, domanassa: 62, upayasa: 0 },
        reasons: ['critical_hp'] } });
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

test('fleet and war snapshots extend the authenticated dashboard without creating remote controls', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'montra-dashboard-fleet-'));
  const key = randomBytes(32).toString('hex');
  const origin = 'https://example.test';
  let service;
  try {
    await writeFile(join(temp, 'fighter-role.mjs'), [
      "export const cityLeaders = [{name:'leader',guild:'guild',profession:'phutthaisawan',port:34786,profile:'instances/leader/runtime.env'}];",
      "export const professionBots = [{name:'mage',guild:'guild',profession:'seer',port:34807,profile:'instances/mage/runtime.env'}];",
      "export const reserveFighters = [{name:'reserve',guild:'guild',port:34791,profile:'instances/reserve/runtime.env'}];",
    ].join('\n'));
    const roster = await botRoster(temp);
    assert.equal(roster.length, 6);
    assert.deepEqual(roster.slice(3).map(bot => bot.group), ['commander', 'guild', 'reserve']);
    const { DatabaseSync } = await import('node:sqlite');
    const dbPath = join(temp, 'guilds.sqlite');
    const db = new DatabaseSync(dbPath);
    db.exec("CREATE TABLE guilds(id TEXT,name TEXT); CREATE TABLE territory_battles(site TEXT,attacker TEXT,defender TEXT,winner TEXT,started INTEGER,ended INTEGER,progress INTEGER);");
    db.exec("INSERT INTO guilds VALUES ('private-id','guild'),('opponent-id','opponent'); INSERT INTO territory_battles VALUES('moon_pass','private-id','opponent-id',NULL,10,NULL,4),('river_watch','opponent-id',NULL,'opponent-id',1,5,9);");
    db.close();
    const readBattles = await battleReader(dbPath);
    service = dashboardServer({ root: temp, key, origin, roster, readBattles, readEvents: async () => [],
      readStatus: async port => port === 34807
        ? { raw: { service: 'montra-bot-v1', name: 'mage', guild: { id: 'private-id', name: 'guild' },
          sessionId: 'private-session', state: 'online', profession: { path: 'seer', casts: 2, lastCast: { id: 'seer_buffalo' } },
          guildWar: { side: 'attack', site: 'moon_pass', state: 'fighting' } } }
        : { state: 'offline' } });
    await new Promise(resolve => service.listen(0, '127.0.0.1', resolve));
    const url = 'http://127.0.0.1:' + service.address().port;
    assert.equal((await fetch(url + '/overview')).status, 401);
    const response = await fetch(url + '/overview', { headers: { Authorization: 'Bearer ' + key, Origin: origin } });
    const payload = await response.json();
    assert.equal(payload.wars.active[0].attacker, 'guild');
    assert.equal(payload.wars.recent[0].winner, 'opponent');
    const mage = payload.bots.find(bot => bot.id === 'bot-34807');
    assert.deepEqual(mage.skill, { casts: 2, id: 'seer_buffalo' });
    assert.equal(mage.war.side, 'attack');
    assert.equal(mage.controls, false);
    assert.equal(validateCommand({ bot: 'bot-34807', action: 'restart' }), null);
    assert(!JSON.stringify(payload).includes('private'));
  } finally {
    if (service?.listening) await new Promise(resolve => service.close(resolve));
    await rm(temp, { recursive: true, force: true });
  }
});
