
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { campaignTargets, observedRouteLoop, selectGuilds, summarizeFleet } from '../docs/fleet.mjs';
import { publicBot } from './dashboard.mjs';

const leader = { id: 'leader', name: 'แม่ทัพอรุณ', group: 'commander',
  state: 'online', guild: 'ธงอรุณ', assignedGuild: 'ธงอรุณ', profession: 'phutthaisawan',
  missionTarget: 'moon_cemetery', campaign: { state: 'campaign', city: 'moon_cemetery', side: 'attack' } };
const fighter = { id: 'mage', name: 'เวทอรุณ', group: 'guild',
  state: 'reconnecting', guild: 'ธงอรุณ', assignedGuild: 'ธงอรุณ', profession: 'seer' };
const merchant = { id: 'merchant', name: 'บอตพ่อค้า', group: 'operations', state: 'online', map: 'bound_temple' };

test('fleet readiness includes operations, excludes reserves and flags wrong guilds', () => {
  const other = { ...fighter, id: 'other', state: 'online', guild: 'ธงศิลา' };
  assert.deepEqual(summarizeFleet([leader, fighter, merchant, other, { group: 'reserve', state: 'offline' }]),
    { online: 3, total: 4, combatReady: 1, field: 3, needsAttention: 2 });
  const guilds = new Map([[leader.guild, [leader, fighter, other]]]);
  const [match] = selectGuilds(guilds, { search: 'อรุณ', profession: 'seer', state: 'attention' });
  assert.deepEqual(match.matched, [fighter, other]);
  assert.equal(match.members.length, 3);
  assert.deepEqual(selectGuilds(guilds, { search: 'ไร้ชื่อ' }), []);
});

test('active assignments take precedence and pending campaigns group by their chosen city', () => {
  const ally = { ...leader, id: 'ally', guild: 'ธงศิลา', assignedGuild: 'ธงศิลา',
    war: { site: 'moon_cemetery', side: 'defend' } };
  assert.deepEqual(campaignTargets([leader, ally, { ...leader, state: 'offline' },
    { ...leader, campaign: { state: 'secured', city: 'moon_cemetery' } }, fighter]),
  [{ site: 'moon_cemetery', groups: [
    { id: 'leader', guild: 'ธงอรุณ', side: 'attack' },
    { id: 'ally', guild: 'ธงศิลา', side: 'defend' },
  ] }]);
});

test('merchant loop requires two round trips with a recent matching observation', () => {
  const now = Date.parse('2026-11-14T17:10:00Z');
  const event = (map, minutes) => ({
    bot: merchant.id, type: 'merchant_map_entered', map, time: new Date(now - minutes * 60_000).toISOString(),
  });
  const a = 'bound_temple', b = 'moon_cemetery';
  const travel = [event(a, 8), event(b, 6), event(a, 4), event(b, 2), event(a, 1)];
  const duplicate = event(b, 5);
  const time = new Date(now).toISOString();
  assert.deepEqual(observedRouteLoop([...travel, duplicate], merchant, time),
    { maps: [b, a], since: travel[0].time });
  assert.equal(observedRouteLoop(travel.slice(1), merchant, time), null);
  assert.equal(observedRouteLoop([...travel, event('ritual_village', .5)], merchant, time), null);
  assert.equal(observedRouteLoop(travel, { ...merchant, state: 'reconnecting' }, time), null);
  assert.equal(observedRouteLoop(travel, merchant, new Date(now + 8 * 60_000).toISOString()), null);
});

test('merchant overview keeps route and production counters without private payloads', () => {
  const view = publicBot(merchant, {
    boat: { state: 'rowing', origin: 'bound_temple', destination: 'moon_cemetery', gatesCrossed: 0, lastReject: 'invalid/detail', sessionId: 'private' },
    merchant: { state: 'sailing', itemId: 'helmet', crafted: 0, listed: 0, listings: [], refined: 5,
      lastError: 'portal_cooldown', progression: { destination: 'ritual_village' },
      production: { improved: 2, qualityListed: 1 }, credentials: 'private' },
  }, 'online');
  assert.deepEqual(view.boat, { state: 'rowing', origin: 'bound_temple', destination: 'moon_cemetery', gates: 0, error: null });
  assert.equal(view.merchant.destination, 'ritual_village');
  assert.equal(view.merchant.refined, 5);
  assert.equal(view.merchant.crafted, 0);
  assert.equal(view.merchant.qualityListed, 1);
  assert(!JSON.stringify(view).includes('private'));
});
