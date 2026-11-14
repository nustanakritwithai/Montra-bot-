import { createHash, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { appendFile, open, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const controls = {
  first: { name: 'บอตทดลอง', role: 'fighter', port: 34781, peer: 34782, log: 'bot.log' },
  second: { name: 'บอตทดลอง 2', role: 'fighter', port: 34782, peer: 34781,
    log: 'instances/bot2/bot.log', profile: 'instances/bot2/runtime.env' },
  merchant: { name: 'บอตพ่อค้า', role: 'merchant', port: 34784,
    log: 'instances/merchant/bot.log', profile: 'instances/merchant/runtime.env' },
};
export async function botRoster(root) {
  const { cityLeaders, professionBots, reserveFighters } = await import(pathToFileURL(resolve(root, 'fighter-role.mjs')).href);
  const map = (bot, group) => ({ id: 'bot-' + bot.port, name: bot.name, role: 'fighter', port: bot.port,
    guild: bot.guild, profession: bot.profession ?? 'phutthaisawan', group, log: join(dirname(bot.profile), 'bot.log') });
  return [
    ...operations,
    ...cityLeaders.map(bot => map(bot, 'commander')),
    ...professionBots.map(bot => map(bot, 'guild')),
    ...reserveFighters.map(bot => map(bot, 'reserve')),
  ];
}
const operations = Object.entries(controls).map(([id, bot]) => ({ id, ...bot, group: 'operations' }));
const categories = {
  guild_war_joined: 'guild', profession_skill_used: 'combat', city_ownership_confirmed: 'guild',
  merchant_level_observed: 'trade', merchant_quality_improved: 'trade',
  joined: 'connection', connection_error: 'connection', stopped: 'connection',
  mission_selected: 'decision', ai_decision: 'decision', goal: 'decision',
  portal_attempt: 'travel', destination: 'travel', destination_arrived: 'travel',
  route_unavailable: 'travel', recovery_exhausted: 'travel', training_camp_blocked: 'travel',
  monster_defeated: 'combat', party_combat_hit: 'combat', sword_skill_used: 'combat',
  forge_hunt_selected: 'equipment', forge_copy_collected: 'equipment', forge_result: 'equipment',
  best_weapon_equipped: 'equipment', potion_used: 'equipment', potion_purchased: 'equipment',
  merchant_crafted: 'trade', merchant_listed: 'trade', merchant_sync_after_timeout: 'trade',
  territory_government_requested: 'guild', territory_entry_requested: 'guild',
  operator_action: 'management',
  party_help_requested: 'combat', party_help_started: 'combat', party_help_finished: 'combat',
  typhoon_plan_selected: 'decision', typhoon_plan_applied: 'decision', typhoon_plan_unavailable: 'decision',
  typhoon_plan_outcome: 'decision', typhoon_tool_result: 'decision', nutrition_result: 'decision',
  typhoon_cycle_reentered: 'decision',
};
const keyPattern = /^[a-f0-9]{64}$/;
const gameId = /^[a-zA-Z0-9_-]{1,80}$/;
const digest = text => createHash('sha256').update(text).digest();
const count = value => Number.isFinite(value) ? value : null;
const label = value => typeof value === 'string' && gameId.test(value) ? value : null;
const toolLabels = value => Array.isArray(value) ? value.slice(0, 40).map(label).filter(Boolean) : [];
const toolResult = result => result ? { tool: label(result.tool), outcome: label(result.outcome), at: count(result.at) } : null;
const text = value => typeof value === 'string' ? value.slice(0, 90) : null;
const loopback = port => 'http://127.0.0.1:' + port;
const runningStates = new Set(['online', 'starting', 'reconnecting', 'stopping', 'failed']);

export function publicBot(entry, raw, state) {
  const { id, name, role, group, guild, profession } = entry;
  const s = raw ?? {};
  const forge = s.forge;
  const merchant = s.merchant;
  return { id, name, role, group, state, guild: text(s.guild?.name), assignedGuild: guild ?? null,
    profession: label(s.profession?.path ?? s.sword?.path ?? profession),
    skill: s.profession ? { id: label(s.profession.lastCast?.id), casts: count(s.profession.casts) } : null,
    campaign: s.cityCampaign ? { city: label(s.cityCampaign.city), state: label(s.cityCampaign.state),
      phase: label(s.cityCampaign.phase), nextAt: count(s.cityCampaign.nextChallengeAt) } : null,
    war: s.guildWar ? { site: label(s.guildWar.site), side: label(s.guildWar.side), state: label(s.guildWar.state),
      hits: count(s.guildWar.hits), joined: count(s.guildWar.joined) } : null,
    owned: toolLabels(s.territory?.owned), controls: Object.hasOwn(controls, id), goal: label(s.goal), map: label(s.map),
    level: count(s.level), experience: count(s.experience), xpToNext: count(s.training?.xpToNext),
    hp: count(s.hp), maxHp: count(s.maxHp), x: count(s.x), z: count(s.z),
    hits: count(s.hits), kills: count(s.kills), retries: count(s.retries),
    target: label(s.huntTargetId), lastEvent: label(s.lastEvent),
    mission: label(s.mission?.mission), reason: label(s.mission?.reason),
    plan: s.plan ? { source: label(s.plan.source), state: label(s.plan.state), tool: label(s.plan.tool),
      reason: typeof s.plan.reason === 'string' ? s.plan.reason.slice(0, 180) : null,
      posture: label(s.plan.posture), tactic: label(s.plan.tactic), appliedAt: count(s.plan.appliedAt),
      step: count(s.plan.step), total: count(s.plan.total),
      queued: Array.isArray(s.plan.queued) ? s.plan.queued.slice(0, 2)
        .map(entry => typeof entry?.option === 'string' ? entry.option.slice(0, 100) : null).filter(Boolean) : [] } : null,
    tools: s.agentTools ? {
      ready: toolLabels(Object.keys(s.agentTools.ready ?? {})),
      automatic: toolLabels(s.agentTools.automatic),
      lastResult: toolResult(s.agentTools.lastResult),
      ...(s.agentTools.lastSideResult ? { lastSideResult: toolResult(s.agentTools.lastSideResult) } : {}),
      ...(s.agentTools.skills ? { skills: { total: count(s.agentTools.skills.total),
        ready: toolLabels(s.agentTools.skills.ready), selected: label(s.agentTools.skills.selected),
        lastSaved: label(s.agentTools.skills.lastSaved) } } : {}),
      ...(s.agentTools.drives ? { drives: { dominant: label(s.agentTools.drives.dominant),
        scores: Object.fromEntries(['kama', 'bhava', 'vibhava'].map(name => [name, count(s.agentTools.drives.scores?.[name])])),
        pressure: toolLabels(s.agentTools.drives.pressure) } } : {}),
      ...(s.agentTools.personality ? { personality: { source: label(s.agentTools.personality.source),
        drive: label(s.agentTools.personality.drive), mood: text(s.agentTools.personality.mood),
        intention: typeof s.agentTools.personality.intention === 'string' ? s.agentTools.personality.intention.slice(0, 150) : null,
        focus: label(s.agentTools.personality.focus), risk: label(s.agentTools.personality.risk) } } : {}),
      ...(s.agentTools.feeling ? { feeling: { kind: label(s.agentTools.feeling.kind),
        state: label(s.agentTools.feeling.state), outcome: label(s.agentTools.feeling.outcome),
        reasons: toolLabels(s.agentTools.feeling.reasons) } } : {}),
      ...(s.agentTools.cycle ? { cycle: { state: label(s.agentTools.cycle.state),
        action: toolResult(s.agentTools.cycle.action), distress: label(s.agentTools.cycle.distress),
        scores: Object.fromEntries(['soka', 'parideva', 'dukkha', 'domanassa', 'upayasa']
          .map(name => [name, count(s.agentTools.cycle.scores?.[name])])),
        reasons: toolLabels(s.agentTools.cycle.reasons), nextDrive: label(s.agentTools.cycle.nextDrive) } } : {}),
    } : null,
    nutrition: s.nutrition ? { food: count(s.nutrition.food), water: count(s.nutrition.water),
      collected: count(s.nutrition.collected), consumed: count(s.nutrition.consumed), cooked: count(s.nutrition.cooked) } : null,
    camp: text(s.training?.camp?.name), gold: count(merchant?.gold ?? s.wealth?.gold ?? forge?.gold),
    freeSlots: count(s.wealth?.freeSlots), party: Boolean(s.party?.partyId),
    following: text(s.partyAssist?.partner), assistState: label(s.partyAssist?.state), assistSource: label(s.partyAssist?.source),
    routeRetryAt: count(s.routeRetryAt), guildRole: label(s.guild?.role),
    chatSent: count(s.chat?.sent), chatReceived: count(s.chat?.received),
    weapon: label(s.sword?.equipped ?? s.weaponSelection?.weaponId),
    forge: forge ? { state: label(forge.state), rank: count(forge.rank), stock: count(forge.stock),
      missing: count(forge.missing), camp: text(forge.camp?.name), nextAt: count(forge.nextAt) } : null,
    potions: s.potions ? { state: label(s.potions.state), used: count(s.potions.used), bought: count(s.potions.bought) } : null,
    merchant: merchant ? { state: label(merchant.state), harvested: count(merchant.harvested),
      crafted: count(merchant.crafted), listed: count(merchant.listed), open: Array.isArray(merchant.listings) ? merchant.listings.length : null } : null,
  };
}

export async function recentEvents(file, bot) {
  let handle;
  try { handle = await open(file, 'r'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  try {
    const { size } = await handle.stat();
    const buffer = Buffer.alloc(Math.min(size, 98_304));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, size - buffer.length);
    const lines = buffer.subarray(0, bytesRead).toString('utf8').replace(/^\uFEFF/, '').split('\n');
    if (size > buffer.length) lines.shift();
    const result = [];
    for (const line of lines.reverse()) {
      if (result.length >= 24) break;
      let row;
      try { row = JSON.parse(line); } catch { continue; }
      if (!row || !Object.hasOwn(categories, row.event) || !Number.isFinite(Date.parse(row.time))) continue;
      const eventBot = bot ?? (typeof row.bot === 'string' && Object.hasOwn(controls, row.bot) ? row.bot : null);
      if (!eventBot) continue;
      result.push({ bot: eventBot, time: row.time, type: row.event, category: categories[row.event],
        map: label(row.map ?? row.mapId), item: label(row.itemId ?? row.item), goal: label(row.goal),
        mission: label(row.mission), reason: row.event === 'mission_selected' ? label(row.reason) : null,
        target: label(row.target), destination: label(row.destination), action: label(row.action),
        site: label(row.site), skill: label(row.skill), side: label(row.side),
        tool: label(row.tool), outcome: label(row.outcome), step: count(row.step),
        rank: count(row.rank), quantity: count(row.quantity ?? row.stock),
        price: count(row.price ?? row.cost), success: typeof row.success === 'boolean' ? row.success : null });
    }
    return result;
  } finally { await handle.close(); }
}

async function statusAt(port) {
  try {
    const response = await fetch(loopback(port) + '/status', { signal: AbortSignal.timeout(2000) });
    if (response.ok) return { raw: await response.json() };
    return { state: 'unavailable' };
  } catch (error) {
    return { state: error.cause?.code === 'ECONNREFUSED' ? 'offline' : 'unavailable' };
  }
}

function failure(status, code) {
  return Object.assign(new Error(code), { status });
}

async function readCommand(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] ?? '')) throw failure(415, 'json_required');
  const chunks = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 2048) { request.resume(); throw failure(413, 'body_too_large'); }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks)); }
  catch { throw failure(400, 'invalid_command'); }
}

export function validateCommand(command) {
  if (!command || typeof command.bot !== 'string' || !Object.hasOwn(controls, command.bot)) return null;
  const { bot, action } = command;
  if (action === 'destination' && controls[bot].role === 'fighter' && Object.keys(command).length === 5 &&
      typeof command.mapId === 'string' && gameId.test(command.mapId) &&
      [command.x, command.z].every(value => Number.isFinite(value) && Math.abs(value) <= 2000)) {
    return { bot, action, mapId: command.mapId, x: command.x, z: command.z };
  }
  if (Object.keys(command).length !== 2) return null;
  if (action === 'restart' || controls[bot].role === 'merchant' && ['start', 'stop'].includes(action)) return { bot, action };
  return null;
}

function runControl(root, bot, action) {
  const args = [...(bot.profile ? ['--env-file=' + bot.profile] : []), 'control.mjs', action];
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root, windowsHide: true, stdio: 'ignore', timeout: 16_000,
      env: { ...process.env, MONTRA_BOT_CONTROL_PORT: String(bot.port),
        ...(bot.peer ? { MONTRA_BOT_TEAM_PEER_PORT: String(bot.peer), MONTRA_BOT_TERRITORY: '0', MONTRA_BOT_SECONDS: '0' } : {}) },
    });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(failure(502, 'bot_control_failed')));
  });
}

async function waitForBot(bot, online) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const result = await statusAt(bot.port);
    if (online ? result.raw?.state === 'online' && result.raw.name === bot.name : result.state === 'offline') return true;
    await delay(500);
  }
  return false;
}

async function execute(root, command) {
  const bot = controls[command.bot];
  if (command.action === 'destination') {
    const { mapId, x, z } = command;
    const response = await fetch(loopback(bot.port) + '/destination', {
      method: 'POST', signal: AbortSignal.timeout(4000),
      headers: { 'Content-Type': 'application/json', 'X-Montra-Control': 'destination' },
      body: JSON.stringify({ mapId, x, z }),
    }).catch(() => { throw failure(502, 'bot_unreachable'); });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      const reasons = ['invalid_destination', 'destination_blocked', 'no_map_route'];
      throw failure(422, reasons.includes(result.error) ? result.error : 'bot_rejected_command');
    }
    return 'travelling';
  }
  if (command.action !== 'start') await runControl(root, bot, 'stop');
  if (command.action === 'stop') {
    if (!await waitForBot(bot, false)) throw failure(504, 'stop_unconfirmed');
    return 'offline';
  }
  const current = await statusAt(bot.port);
  if (!current.raw) {
    // The party supervisor can start its own bot before this command does.
    try { await runControl(root, bot, 'start'); }
    catch (error) { if (!(await statusAt(bot.port)).raw) throw error; }
  }
  if (!await waitForBot(bot, true)) throw failure(504, 'start_unconfirmed');
  return 'online';
}

export function dashboardServer({ root, key, origin, auditLog, run = execute, readStatus = statusAt, readEvents = recentEvents, roster = operations, readBattles = async () => null }) {
  if (!keyPattern.test(key) || !origin || new URL(origin).origin !== origin) throw new Error('invalid_dashboard_config');
  const expected = digest(key);
  let running = false;
  let snapshot;
  let snapshotAt = 0;
  let inFlight;

  async function readDashboard() {
    const [states, team, game, events, wars] = await Promise.all([
      Promise.all(roster.map(async bot => {
        const { raw, state } = await readStatus(bot.port);
        const valid = raw?.service === 'montra-bot-v1' && (!raw.name || raw.name === bot.name);
        return publicBot(bot, valid ? raw : null,
          valid && runningStates.has(raw.state) ? raw.state : (state ?? 'unavailable'));
      })),
      readStatus(34783),
      fetch(loopback(4108) + '/hi', { signal: AbortSignal.timeout(2000) })
        .then(response => response.ok).catch(() => false),
      Promise.all([
        ...roster.map(bot => readEvents(join(root, bot.log), bot.id).then(rows => rows.slice(0, 12)).catch(() => [])),
        ...(auditLog ? [readEvents(auditLog, null).catch(() => [])] : []),
      ]),
      Promise.resolve().then(readBattles).catch(() => null),
    ]);
    return { time: new Date().toISOString(), game, bots: states, wars,
      team: { state: label(team.raw?.state) ?? team.state ?? 'unavailable',
        hunter: text(team.raw?.hunter), support: text(team.raw?.support), targetLevel: count(team.raw?.targetLevel) },
      events: events.flat().sort((a,b) => Date.parse(b.time) - Date.parse(a.time)) };
  }

  async function cachedDashboard() {
    if (snapshot && Date.now() - snapshotAt < 3000) return snapshot;
    inFlight ??= readDashboard().then(value => {
      snapshot = value;
      snapshotAt = Date.now();
      return value;
    }).finally(() => { inFlight = undefined; });
    return inFlight;
  }

  return createServer({ requestTimeout: 12_000, headersTimeout: 8000 }, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(body));
    };
    const from = req.headers.origin;
    if (from && from !== origin) return send(403, { error: 'origin_forbidden' });
    if (from === origin) res.setHeader('Access-Control-Allow-Origin', origin);
    const known = req.url === '/overview' || req.url === '/actions';
    if (!known) return send(404, { error: 'not_found' });
    if (req.method === 'OPTIONS' && from === origin) {
      res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '600' });
      return res.end();
    }
    const supplied = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization ?? '')?.[1];
    if (!supplied || !timingSafeEqual(digest(supplied), expected)) return send(401, { error: 'invalid_key' });
    try {
      if (req.method === 'GET' && req.url === '/overview') return send(200, await cachedDashboard());
      if (req.method !== 'POST' || req.url !== '/actions') return send(405, { error: 'method_not_allowed' });
      const command = validateCommand(await readCommand(req));
      if (!command) return send(400, { error: 'invalid_command' });
      if (running) return send(409, { error: 'action_pending' });
      running = true;
      try {
        const state = await run(root, command);
        snapshotAt = 0;
        const record = JSON.stringify({ time: new Date().toISOString(), event: 'operator_action', bot: command.bot, action: command.action, state });
        if (auditLog) await appendFile(auditLog, record + '\n').catch(error => console.error('Dashboard audit write failed', error.code));
        console.log(record);
        return send(200, { state });
      } finally { running = false; }
    } catch (error) {
      if (!error.status) console.error('Dashboard request failed', error.code ?? error.name);
      return send(error.status ?? 502, { error: error.status ? error.message : 'service_unavailable' });
    }
  });
}

export async function battleReader(file) {
  const { DatabaseSync } = await import('node:sqlite');
  const format = row => ({ site: label(row.site), attacker: text(row.attacker), defender: text(row.defender),
    winner: text(row.winner), started: count(row.started), ended: count(row.ended), progress: count(row.progress) });
  return () => {
    const db = new DatabaseSync(file, { readOnly: true });
    try {
      const select = 'SELECT b.site, a.name attacker, d.name defender, w.name winner, b.started, b.ended, b.progress ' +
        'FROM territory_battles b LEFT JOIN guilds a ON a.id=b.attacker LEFT JOIN guilds d ON d.id=b.defender LEFT JOIN guilds w ON w.id=b.winner';
      return {
        active: db.prepare(select + ' WHERE b.ended IS NULL ORDER BY b.started DESC').all().map(format),
        recent: db.prepare(select + ' WHERE b.ended IS NOT NULL ORDER BY b.ended DESC LIMIT 8').all().map(format),
      };
    } finally { db.close(); }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const configPath = process.argv[2] ?? fileURLToPath(new URL('./dashboard.local.json', import.meta.url));
  const config = JSON.parse((await readFile(configPath, 'utf8')).replace(/^\uFEFF/, ''));
  const roster = await botRoster(config.root);
  const readBattles = await battleReader(config.warDatabase ?? 'C:/Montra/online-server/data/characters/guilds.sqlite');
  dashboardServer({ ...config, roster, readBattles }).listen(34785, '127.0.0.1', () => console.log('Montra bot dashboard listening on 34785'));
}
