export const needsAttention = bot => bot.state !== 'online' ||
  Boolean(bot.assignedGuild && bot.guild !== bot.assignedGuild);

export function summarizeFleet(bots) {
  const main = bots.filter(bot => bot.group !== 'reserve');
  const field = main.filter(bot => bot.group === 'commander' || bot.group === 'guild');
  return {
    online: main.filter(bot => bot.state === 'online').length,
    total: main.length,
    combatReady: field.filter(bot => !needsAttention(bot)).length,
    field: field.length,
    needsAttention: main.filter(needsAttention).length,
  };
}

export function selectGuilds(guilds, { selectedGuild = '', profession = '', state = '', search = '' } = {}) {
  const query = search.trim().normalize('NFC').toLocaleLowerCase('th');
  return [...guilds].flatMap(([name, members]) => {
    if (selectedGuild && name !== selectedGuild) return [];
    const matched = members.filter(bot => {
      if (profession && bot.profession !== profession) return false;
      if (state && (state === 'attention' ? !needsAttention(bot) : bot.state !== state)) return false;
      return !query || [bot.name, name].some(value => value.normalize('NFC').toLocaleLowerCase('th').includes(query));
    });
    return matched.length ? [{ name, members, matched }] : [];
  });
}

export function campaignTargets(bots) {
  const sites = new Map();
  for (const bot of bots) {
    if (bot.group !== 'commander' || needsAttention(bot)) continue;
    const war = bot.war;
    const campaign = bot.campaign;
    const site = war?.site ?? (campaign?.state === 'campaign' ? bot.missionTarget ?? campaign.city : null);
    if (!site) continue;
    if (!sites.has(site)) sites.set(site, { site, groups: [] });
    sites.get(site).groups.push({ id: bot.id, guild: bot.assignedGuild, side: war?.site ? war.side : campaign.side });
  }
  const byCount = (first, second) => second.groups.length - first.groups.length;
  return [...sites.values()].sort((a, b) => byCount(a, b) || a.site.localeCompare(b.site));
}

export function observedRouteLoop(events, bot, snapshotTime) {
  if (bot?.state !== 'online' || !bot.map) return null;
  const now = Date.parse(snapshotTime);
  const recent = events.filter(row => {
    const age = now - Date.parse(row.time);
    return row.bot === bot.id && row.type === 'merchant_map_entered' && row.map && age >= 0 && age <= 12 * 60_000;
  }).sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  const maps = recent.filter((row, index) => row.map !== recent[index - 1]?.map).slice(0, 5);
  if (maps.length !== 5 || maps[0].map !== bot.map || now - Date.parse(maps[0].time) > 4 * 60_000) return null;
  if (maps[0].map === maps[1].map || !maps.every((row, index) => row.map === maps[index % 2].map)) return null;
  return { maps: [maps[1].map, maps[0].map], since: maps.at(-1).time };
}
