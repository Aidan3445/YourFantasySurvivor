import 'server-only';

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { type CastawayInsert } from '~/types/castaways';
import { type TribeInsert } from '~/types/tribes';
import { type EpisodeInsert } from '~/types/episodes';
import { type SeasonInsert } from '~/types/seasons';
import { setToNY8PM } from '~/lib/utils';

const WIKI_API = 'https://survivor.fandom.com/api.php';

async function wikiGet(params: Record<string, string | number>) {
  const res = await axios.get(WIKI_API, {
    params: { action: 'parse', format: 'json', ...params }
  });
  return res.data as {
    parse: {
      text: { '*': string };
      sections: { index: string; line: string }[];
    };
  };
}

// ── Shared types ──

export type ParsedEvent = {
  eventName: string;
  label: string | null;
  notes: string[];
  references: { type: 'Castaway' | 'Tribe'; name: string }[];
};

export type ParsedEpisodeDetails = {
  episodeNumber: number;
  events: ParsedEvent[];
};

export type ParsedTribeSwap = {
  type: 'swap' | 'merge';
  episodeNumber: number; // best guess, 0 if unknown
  events: ParsedEvent[];
};

// ── Virtual grid builder ──

function buildVirtualGrid(
  $: cheerio.CheerioAPI,
  tableSelector: string,
): { grid: (Element | null)[][]; totalCols: number } {
  const allRows = $(tableSelector + ' tbody tr').toArray();

  // Count total columns from first header row
  let totalCols = 0;
  $(allRows[0]).find('th').each((_, th) => {
    totalCols += parseInt($(th).attr('colspan') ?? '1');
  });
  if (totalCols === 0) totalCols = 9; // fallback

  const grid: (Element | null)[][] = [];
  const tracker: ({ el: Element; remaining: number } | null)[] =
    new Array(totalCols).fill(null) as ({ el: Element; remaining: number } | null)[];

  for (const row of allRows) {
    const tds = $(row).find('td').toArray();
    if (tds.length === 0) continue;
    // Skip notes rows
    if (tds.length === 1 && parseInt($(tds[0]).attr('colspan') ?? '1') >= totalCols - 2) continue;

    const gridRow: (Element | null)[] = new Array(totalCols).fill(null) as (Element | null)[];
    let tdIdx = 0;

    for (let col = 0; col < totalCols; col++) {
      const t = tracker[col];
      if (t && t.remaining > 0) {
        gridRow[col] = t.el;
        t.remaining--;
        if (t.remaining === 0) tracker[col] = null;
        continue;
      }
      if (tdIdx >= tds.length) continue;
      const td = tds[tdIdx];
      if (!td) { tdIdx++; continue; }

      const colspan = parseInt($(td).attr('colspan') ?? '1');
      const rowspan = parseInt($(td).attr('rowspan') ?? '1');

      gridRow[col] = td;
      if (rowspan > 1) tracker[col] = { el: td, remaining: rowspan - 1 };

      for (let c = 1; c < colspan; c++) {
        if (col + c < totalCols) {
          gridRow[col + c] = td;
          if (rowspan > 1) tracker[col + c] = { el: td, remaining: rowspan - 1 };
        }
      }
      col += colspan - 1;
      tdIdx++;
    }
    grid.push(gridRow);
  }

  return { grid, totalCols };
}

function cleanTextFrom($: cheerio.CheerioAPI, el: Element | null): string {
  if (!el) return '';
  const clone = $(el).clone();
  clone.find('sup').remove();
  clone.find('br').replaceWith(' ');
  return clone.text().trim().replace(/\s+/g, ' ');
}

// ── Tribe swap/merge parsing from castaway table ──

function parseTribeSwaps(
  $c: cheerio.CheerioAPI,
  episodeDetails: ParsedEpisodeDetails[],
): ParsedTribeSwap[] {
  // Count tribe columns from header
  let numTribeCols = 0;
  $c('table.wikitable tbody tr').first().find('th').each((_, th) => {
    const text = $c(th).text().trim().toLowerCase();
    if (text.includes('tribe')) {
      const colspan = parseInt($c(th).attr('colspan') ?? '1');
      if (colspan > numTribeCols) numTribeCols = colspan;
    }
  });

  if (numTribeCols <= 1) return []; // No swaps or merge

  const { grid } = buildVirtualGrid($c, 'table.wikitable');
  // Columns: 0=image, 1=name, 2=original tribe, 3...(2+numTribeCols-1)=swap/merge, then finish, votes
  const results: ParsedTribeSwap[] = [];

  for (let swapCol = 3; swapCol < 2 + numTribeCols; swapCol++) {
    const isLastCol = swapCol === 2 + numTribeCols - 1;
    const tribeAssignments: Record<string, string[]> = {};
    let firstEliminatedShortName = '';

    for (const row of grid) {
      const cell = row[swapCol];
      if (!cell) continue;

      const style = $c(cell).attr('style') ?? '';
      if (style.includes('#a6a6a6') || style.includes('border:none') ||
        style.includes('border: none')) continue;

      const tribeName = cleanTextFrom($c, cell);
      if (!tribeName) continue;

      const nameCell = row[1];
      if (!nameCell) continue;
      const fullName = $c(nameCell).find('b').text().trim();
      if (!fullName) continue;

      tribeAssignments[tribeName] ??= [];
      tribeAssignments[tribeName].push(fullName);

      if (!firstEliminatedShortName) {
        firstEliminatedShortName = fullName.split(' ')[0] ?? '';
      }
    }

    if (Object.keys(tribeAssignments).length === 0) continue;

    // Find episode number by matching first eliminated player
    let episodeNumber = 0;
    if (firstEliminatedShortName) {
      for (const ep of episodeDetails) {
        const hasPlayer = ep.events.some(e =>
          (e.eventName === 'elim' || e.eventName === 'noVoteExit') &&
          e.references.some(r => r.name === firstEliminatedShortName));
        if (hasPlayer) {
          episodeNumber = ep.episodeNumber;
          break;
        }
      }
    }

    const events: ParsedEvent[] = Object.entries(tribeAssignments).map(
      ([tribeName, castawayNames]) => ({
        eventName: 'tribeUpdate',
        label: isLastCol ? 'Merge' : 'Tribe Swap',
        notes: [],
        references: [
          { type: 'Tribe' as const, name: tribeName },
          ...castawayNames.map(name => ({ type: 'Castaway' as const, name })),
        ],
      }));

    results.push({ type: isLastCol ? 'merge' : 'swap', episodeNumber, events });
  }

  return results;
}

// ── Episode detail parsing ──

function parseEpisodeDetails(
  $e: cheerio.CheerioAPI,
  tribeNames: Set<string>,
): ParsedEpisodeDetails[] {
  const { grid } = buildVirtualGrid($e, 'table.wikitable');

  const cleanText = (el: Element | null) => cleanTextFrom($e, el);

  const parseChallenge = (el: Element | null) => {
    if (!el) return { winner: '', picked: [] as string[] };
    const text = cleanText(el);
    if (text.toLowerCase() === 'none') return { winner: 'None', picked: [] as string[] };
    const bracketMatch = /\[([^\]]+)\]/.exec(text);
    const picked = bracketMatch
      ? bracketMatch[1]?.split(',').map(s => s.trim())
      : [];
    const winner = text.replace(/\[.*?\]/, '').trim();
    return { winner, picked };
  };

  const parseElimination = (el: Element | null) => {
    if (!el) return { name: '', vote: '' };
    const text = cleanText(el);
    const voteMatch = /\(([^)]+)\)/.exec(text);
    const vote = voteMatch ? voteMatch[1] : '';
    const name = text.replace(/\([^)]+\)/, '').trim();
    return { name, vote };
  };

  const isTribe = (name: string) => tribeNames.has(name);

  const makeChallengeEvents = (
    type: 'reward' | 'immunity' | 'combined',
    winner: string,
    picked: string[],
  ): ParsedEvent[] => {
    if (winner === 'None' || !winner) return [];
    const events: ParsedEvent[] = [];
    const label = type === 'combined' ? 'Immunity and Reward'
      : type === 'reward' ? 'Reward' : 'Immunity';

    if (isTribe(winner)) {
      events.push({
        eventName: 'tribe1st',
        label,
        notes: [],
        references: [{ type: 'Tribe', name: winner }],
      });
    } else {
      const winners = winner.split(',').map(w => w.trim()).filter(Boolean);
      const eventName = type === 'reward' ? 'indivReward' : 'indivWin';
      const notes: string[] = [];
      if (picked.length > 0) notes.push(`Picked: ${picked.join(', ')}`);
      events.push({
        eventName,
        label,
        notes,
        references: winners.map(w => ({ type: 'Castaway' as const, name: w })),
      });
    }
    return events;
  };

  // Group rows by episode
  type EpisodeGroup = { rows: (Element | null)[][] };
  const episodeGroups: EpisodeGroup[] = [];
  let currentEp: EpisodeGroup | null = null;
  let currentEpEl: Element | null = null;

  for (const gridRow of grid) {
    const epEl = gridRow[0];
    if (epEl !== currentEpEl) {
      currentEp = { rows: [gridRow] };
      episodeGroups.push(currentEp);
      if (epEl) currentEpEl = epEl;
    } else {
      currentEp!.rows.push(gridRow);
    }
  }

  const results: ParsedEpisodeDetails[] = [];
  let seasonComplete = false;

  for (const ep of episodeGroups) {
    if (seasonComplete) break;
    const firstRow = ep.rows[0];
    if (!firstRow || firstRow.length < 3) continue;
    const epNum = cleanText(firstRow[0]!);
    if (!epNum || isNaN(parseInt(epNum))) continue;

    const firstRowText = ep.rows[0]!.map(el => cleanText(el)).join(' ').toLowerCase();
    if (firstRowText.includes('recap')) continue;

    const episodeNumber = parseInt(epNum);
    const events: ParsedEvent[] = [];
    const finalists: { name: string; vote?: string; finish: string }[] = [];

    for (let i = 0; i < ep.rows.length; i++) {
      const row = ep.rows[i];
      if (!row || row.length < 7) continue;
      const rewardEl = row[3];
      const immunityEl = row[4];
      const eliminatedEl = row[5];
      const finishEl = row[6];

      if (!rewardEl && !immunityEl && !eliminatedEl) continue;
      const rewardText = cleanText(rewardEl!);

      if (rewardText.toLowerCase().includes('jury vote')) {
        const elim = parseElimination(eliminatedEl!);
        const finish = cleanText(finishEl!);
        finalists.push({ name: elim.name, vote: elim.vote, finish });

        if (finish.includes('Sole Survivor')) {
          // Emit single finalists event with all references
          events.push({
            eventName: 'finalists',
            label: null,
            notes: finalists.map(f => `${f.name}: ${f.finish}${f.vote ? ` (${f.vote})` : ''}`),
            references: finalists.map(f => ({ type: 'Castaway' as const, name: f.name })),
          });
          events.push({
            eventName: 'soleSurvivor',
            label: null,
            notes: elim.vote ? [elim.vote] : [],
            references: [{ type: 'Castaway', name: elim.name }],
          });
          seasonComplete = true;
        }
        continue;
      }

      const isCombined = rewardEl === immunityEl && rewardEl !== null;
      const prevRewardEl = i > 0 ? ep.rows[i - 1]![3] : null;
      const prevImmunityEl = i > 0 ? ep.rows[i - 1]![4] : null;

      if (isCombined) {
        if (rewardEl !== prevRewardEl) {
          const c = parseChallenge(rewardEl!);
          events.push(...makeChallengeEvents('combined', c.winner, c.picked ?? []));
        }
      } else {
        if (rewardEl !== prevRewardEl) {
          const r = parseChallenge(rewardEl!);
          events.push(...makeChallengeEvents('reward', r.winner, r.picked ?? []));
        }
        if (immunityEl !== prevImmunityEl) {
          const im = parseChallenge(immunityEl!);
          events.push(...makeChallengeEvents('immunity', im.winner, im.picked ?? []));
        }
      }

      const prevElimEl = i > 0 ? ep.rows[i - 1]![5] : null;
      if (eliminatedEl !== prevElimEl) {
        const elim = parseElimination(eliminatedEl!);
        const finish = cleanText(finishEl!);
        if (elim.name) {
          const isNoVote = elim.vote?.toLowerCase() === 'no vote'
            || finish.toLowerCase().includes('evacuated')
            || finish.toLowerCase().includes('quit')
            || finish.toLowerCase().includes('removed');
          events.push({
            eventName: isNoVote ? 'noVoteExit' : 'elim',
            label: isNoVote ? finish : null,
            notes: elim.vote && !isNoVote ? [elim.vote] : [],
            references: [{ type: 'Castaway', name: elim.name }],
          });
          if (finish.includes('Sole Survivor')) seasonComplete = true;
        }
      }
    }

    results.push({ episodeNumber, events });
  }

  return results;
}

// ── Main fetch function ──

export default async function getExternalData(seasonName: string) {
  const cleanSeason = seasonName.replace(' ', '_');

  try {
    const [sectionData, seasonData] = await Promise.all([
      wikiGet({ page: cleanSeason }),
      wikiGet({ page: cleanSeason, section: 0 }),
    ]);

    const $s = cheerio.load(seasonData.parse.text['*']);

    // ── Season dates ──
    const airingInfo = $s('div[data-source=seasonrun] div').text().trim();
    const [premiereStr, finaleStr] = airingInfo.split(' - ').map(s => s.trim());
    const premiereDate = setToNY8PM(premiereStr!);
    const finaleDate = finaleStr ? setToNY8PM(finaleStr) : null;

    const season: SeasonInsert = {
      name: seasonName,
      premiereDate: premiereDate ?? new Date(),
      finaleDate,
    };

    // ── Tribes from infobox ──
    const tribes: Record<string, string> = {};
    $s('div[data-source=tribes] div a font').each((_, el) => {
      const tribeName = $s(el).text().trim();
      const style = $s(el).attr('style') ?? '';
      const colorMatch = /background:(#[0-9a-fA-F]{6})/.exec(style);
      const tribeColor = colorMatch?.[1] ?? '';
      if (tribeName) tribes[tribeName] = tribeColor;
    });

    // ── Find required sections ──
    const castawaysSection = sectionData.parse.sections
      .find(sec => sec.line.toLowerCase() === 'castaways')?.index;
    const episodesSection = sectionData.parse.sections
      .find(sec => sec.line.toLowerCase() === 'season summary')?.index;

    if (castawaysSection === undefined || episodesSection === undefined) {
      console.error(`Could not find required sections for season ${seasonName}`);
      return { season, castaways: [], tribes: [], episodes: [], episodeDetails: [], tribeSwaps: [] };
    }

    const [castawaysRes, episodeRes] = await Promise.all([
      wikiGet({ page: cleanSeason, section: castawaysSection }),
      wikiGet({ page: cleanSeason, section: episodesSection }),
    ]);

    // ── Castaways ──
    const $c = cheerio.load(castawaysRes.parse.text['*']);
    const castaways: CastawayInsert[] = [];

    const rows: cheerio.Cheerio<Element>[] = [];
    $c('table.wikitable tbody tr').map((_, row) => {
      const columns = $c(row).find('td');
      if (columns.length > 1) rows.push(columns);
    });

    for (const columns of rows) {
      if (columns.length > 1) {
        const fullName: string = $c(columns[1]).find('b').text().trim();
        const details: string = $c(columns[1]).find('small').text().trim();
        const age = parseInt(details);
        const residenceStart = details.indexOf(' ') + 1;
        const rest = details.substring(residenceStart);
        const residenceEnd = (rest.indexOf(',') ?? -3) + 4;
        const residence = rest.substring(0, residenceEnd);

        let occupation = '';
        const links: string = $c(columns[1]).find('a').text().trim();
        const hasPreviousSeasons = links.length !== fullName.length;
        const previouslyOn: string[] = [];
        if (hasPreviousSeasons) {
          const castawayPage = await wikiGet({
            page: fullName.replace(' ', '_'),
            section: 0,
          });
          const $ca = cheerio.load(castawayPage.parse.text['*']);
          occupation = $ca('div[data-source=occupation] div').text().trim();
          const previousSeasons = rest.substring(residenceEnd).trim();
          previousSeasons.split(',').forEach(s => {
            const clean = s.replace('&', '').trim();
            if (clean) previouslyOn.push(clean);
          });
        } else {
          occupation = rest.substring(residenceEnd).trim();
        }

        const imageUrl: string = $c(columns[0]).find('img').attr('src') ?? '';
        const backupUrl: string = $c(columns[0]).find('img').attr('data-src') ?? '';
        const chosenUrl = imageUrl.startsWith('data') ? backupUrl : imageUrl;

        const tribeName = $c(columns[2]).text().trim();
        const tribeColor = $c(columns[2]).attr('style')?.substring(11, 18) ?? '';
        if (tribeName && !tribes[tribeName]) {
          tribes[tribeName] = tribeColor;
        }

        castaways.push({
          fullName,
          shortName: fullName.split(' ')[0] ?? fullName, // disambiguated below
          age,
          residence: residence ?? 'Hometown N/A',
          occupation: occupation ?? 'Occupation N/A',
          imageUrl: chosenUrl.startsWith('//') ? `https:${chosenUrl}` : chosenUrl,
          tribe: tribeName,
          previouslyOn,
        });
      }
    }

    // Disambiguate duplicate short names (e.g. "Kim Powers" → "Kim P")
    const shortNameCounts = new Map<string, number>();
    for (const c of castaways) {
      shortNameCounts.set(c.shortName, (shortNameCounts.get(c.shortName) ?? 0) + 1);
    }
    for (const c of castaways) {
      if ((shortNameCounts.get(c.shortName) ?? 0) > 1) {
        const lastInitial = c.fullName.split(' ')[1]?.[0];
        if (lastInitial) c.shortName = `${c.shortName} ${lastInitial}`;
      }
    }

    const tribeList: TribeInsert[] = Object.entries(tribes)
      .map(([tribeName, tribeColor]) => ({ tribeName, tribeColor }));

    // ── Episodes ──
    const $e = cheerio.load(episodeRes.parse.text['*']);
    const episodes: EpisodeInsert[] = [];
    $e('table.wikitable tbody tr').each((_, row) => {
      const columns = $e(row).find('td');
      if (columns.length > 1) {
        const episodeNumber = +$e(columns[0]).text().trim();
        const title = $e(columns[1]).text().trim();
        const dateStr = $e(columns[2]).text().trim();
        let airDate = setToNY8PM(dateStr);
        if (!airDate) {
          const prevEpisode = episodes[episodes.length - 1];
          if (prevEpisode) {
            const nextWeek = new Date(prevEpisode.airDate);
            nextWeek.setDate(nextWeek.getDate() + 7);
            airDate = nextWeek;
          }
        }
        if (airDate) episodes.push({ episodeNumber, title, airDate });
      }
    });

    // ── Episode details with structured events ──
    const tribeNameSet = new Set(Object.keys(tribes));
    const episodeDetails = parseEpisodeDetails($e, tribeNameSet);

    // ── Tribe swaps/merges ──
    const tribeSwaps = parseTribeSwaps($c, episodeDetails);

    // Filter recap episodes and renumber
    const recapEpisode = episodes.find(ep =>
      ep.title.includes('The First 2')
      || ep.title.toLowerCase() === '"a closer look"'
      || ep.title.toLowerCase() === '"amazon redux"'
    )?.episodeNumber;
    console.log(`Identified recap episode: ${recapEpisode}`);

    return {
      season,
      castaways,
      tribes: tribeList,
      episodes: episodes
        .filter(ep => ep.episodeNumber !== recapEpisode)
        .map(ep => ({ ...ep, episodeNumber: ep.episodeNumber > (recapEpisode ?? 100) ? ep.episodeNumber - 1 : ep.episodeNumber })),
      episodeDetails: episodeDetails
        .filter(ed => ed.episodeNumber !== recapEpisode)
        .map(ed => ({ ...ed, episodeNumber: ed.episodeNumber > (recapEpisode ?? 100) ? ed.episodeNumber - 1 : ed.episodeNumber })),
      tribeSwaps,
    };
  } catch (error) {
    console.error(`Error fetching data for season ${seasonName}:`, error);
    throw new Error(`Failed to fetch data for season ${seasonName}.`);
  }
}
