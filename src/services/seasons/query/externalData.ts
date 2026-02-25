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

// ── Episode detail parsing (debug) ──

function parseEpisodeDetails($e: cheerio.CheerioAPI) {
  const allRows = $e('table.wikitable tbody tr').toArray();
  const numCols = 9;

  // Build virtual grid resolving all rowspans/colspans
  const grid: (Element | null)[][] = [];
  const rowspanTracker: ({ el: Element; remaining: number } | null)[] =
    new Array(numCols).fill(null) as ({ el: Element; remaining: number } | null)[];

  for (const row of allRows) {
    const tds = $e(row).find('td').toArray();
    if (tds.length === 0) continue; // skip pure header rows

    // Skip notes row (single cell spanning most/all columns)
    if (tds.length === 1 && parseInt($e(tds[0]).attr('colspan') ?? '1') >= 8) continue;

    const gridRow: (Element | null)[] = new Array(numCols).fill(null) as (Element | null)[];
    let tdIdx = 0;

    for (let col = 0; col < numCols; col++) {
      const tracker = rowspanTracker[col];
      if (tracker && tracker.remaining > 0) {
        gridRow[col] = tracker.el;
        tracker.remaining--;
        if (tracker.remaining === 0) rowspanTracker[col] = null;
        continue;
      }

      if (tdIdx >= tds.length) continue;

      const td = tds[tdIdx];
      const colspan = parseInt($e(td).attr('colspan') ?? '1');
      const rowspan = parseInt($e(td).attr('rowspan') ?? '1');

      if (!td) continue;

      gridRow[col] = td;
      if (rowspan > 1) {
        rowspanTracker[col] = { el: td, remaining: rowspan - 1 };
      }

      for (let c = 1; c < colspan; c++) {
        if (col + c < numCols) {
          gridRow[col + c] = td;
          if (rowspan > 1) {
            rowspanTracker[col + c] = { el: td, remaining: rowspan - 1 };
          }
        }
      }

      col += colspan - 1;
      tdIdx++;
    }

    grid.push(gridRow);
  }

  // Helpers
  const cleanText = (el: Element | null) => {
    if (!el) return '';
    const clone = $e(el).clone();
    clone.find('sup').remove();
    clone.find('br').replaceWith(' ');
    return clone.text().trim().replace(/\s+/g, ' ');
  };

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

  // Group rows by episode (rows sharing the same DOM element in col 0)
  type EpisodeGroup = { rows: (Element | null)[][] };
  const episodes: EpisodeGroup[] = [];
  let currentEp: EpisodeGroup | null = null;
  let currentEpEl: Element | null = null;

  for (const gridRow of grid) {
    const epEl = gridRow[0];
    if (epEl !== currentEpEl) {
      currentEp = { rows: [gridRow] };
      episodes.push(currentEp);
      if (epEl) currentEpEl = epEl;
    } else {
      currentEp!.rows.push(gridRow);
    }
  }

  // Print each episode (stop after Sole Survivor)
  let seasonComplete = false;
  for (const ep of episodes) {
    if (seasonComplete) break;

    const firstRow = ep.rows[0];
    if (!firstRow || firstRow.length < 3) continue;
    const epNum = cleanText(firstRow[0]!);
    const title = cleanText(firstRow[1]!);
    const airDate = cleanText(firstRow[2]!);

    if (!epNum || isNaN(parseInt(epNum))) continue;

    // Skip recap episodes
    const firstRowText = ep.rows[0]!.map(el => cleanText(el)).join(' ').toLowerCase();
    if (firstRowText.includes('recap')) {
      console.log(`\n=== Episode ${epNum}: "${title}" (${airDate}) === [RECAP - SKIPPED]`);
      continue;
    }

    console.log(`\n=== Episode ${epNum}: "${title}" (${airDate}) ===`);

    for (let i = 0; i < ep.rows.length; i++) {
      const row = ep.rows[i];
      if (!row || row.length < 7) continue;
      const rewardEl = row[3];
      const immunityEl = row[4];
      const eliminatedEl = row[5];
      const finishEl = row[6];

      if (!rewardEl && !immunityEl && !eliminatedEl) continue;
      const rewardText = cleanText(rewardEl!);

      // Jury Vote row
      if (rewardText.toLowerCase().includes('jury vote')) {
        const elim = parseElimination(eliminatedEl!);
        const finish = cleanText(finishEl!);
        console.log(`  Jury Vote: ${elim.name} ${elim.vote ? `(${elim.vote})` : ''} - ${finish}`);
        if (finish.includes('Sole Survivor')) seasonComplete = true;
        continue;
      }

      // Combined reward + immunity (same DOM element via colspan)
      const isCombined = rewardEl === immunityEl && rewardEl !== null;

      // Only print challenge if it's a new cell (not carried from rowspan)
      if (ep.rows.length < i) continue;
      const prevRewardEl = i > 0 ? ep.rows[i - 1]![3] : null;
      const prevImmunityEl = i > 0 ? ep.rows[i - 1]![4] : null;

      if (isCombined) {
        if (rewardEl !== prevRewardEl) {
          const challenge = parseChallenge(rewardEl!);
          console.log(`  Combined R+I: ${challenge.winner}${challenge.picked?.length ? ` [picked: ${challenge.picked.join(', ')}]` : ''}`);
        }
      } else {
        if (rewardEl !== prevRewardEl) {
          const reward = parseChallenge(rewardEl!);
          console.log(`  Reward: ${reward.winner}${reward.picked?.length ? ` [picked: ${reward.picked.join(', ')}]` : ''}`);
        }
        if (immunityEl !== prevImmunityEl) {
          const immunity = parseChallenge(immunityEl!);
          console.log(`  Immunity: ${immunity.winner}${immunity.picked?.length ? ` [picked: ${immunity.picked.join(', ')}]` : ''}`);
        }
      }

      // Elimination (only if new cell)
      const prevElimEl = i > 0 ? ep.rows[i - 1]![5] : null;
      if (eliminatedEl !== prevElimEl) {
        const elim = parseElimination(eliminatedEl!);
        const finish = cleanText(finishEl!);
        if (elim.name) {
          console.log(`  Eliminated: ${elim.name} ${elim.vote ? `(${elim.vote})` : ''} - ${finish}`);
        }
        if (finish.includes('Sole Survivor')) seasonComplete = true;
      }
    }
  }
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
      return { season, castaways: [], tribes: [], episodes: [] };
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
          shortName: fullName.split(' ')[0] ?? fullName,
          age,
          residence: residence ?? 'Hometown N/A',
          occupation: occupation ?? 'Occupation N/A',
          imageUrl: chosenUrl.startsWith('//') ? `https:${chosenUrl}` : chosenUrl,
          tribe: tribeName,
          previouslyOn,
        });
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

        if (airDate) {
          episodes.push({ episodeNumber, title, airDate });
        }
      }
    });

    // ── Episode details (debug print) ──
    parseEpisodeDetails($e);

    return {
      season,
      castaways,
      tribes: tribeList,
      episodes,
    };
  } catch (error) {
    console.error(`Error fetching data for season ${seasonName}:`, error);
    throw new Error(`Failed to fetch data for season ${seasonName}.`);
  }
}
