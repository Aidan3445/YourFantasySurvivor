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

/**
 * Fetch external data for a given season from Survivor Wiki
 * @param seasonName The name of the season to fetch data for
 * @throws an error if the fetch fails
 */
export default async function getExternalData(seasonName: string) {
  const cleanSeason = seasonName.replace(' ', '_');

  try {
    // Fetch page sections and season infobox
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

    // ── Tribes from infobox (comprehensive — includes merge tribes) ──
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

    // Fetch castaways and episodes in parallel
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

        // Castaway table tribe — merge color into existing tribes map
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
