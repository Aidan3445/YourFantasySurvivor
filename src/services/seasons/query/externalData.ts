import 'server-only';

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { type CastawayInsert } from '~/types/castaways';
import { type TribeInsert } from '~/types/tribes';
import { type EpisodeInsert } from '~/types/episodes';
import { setToNY8PM } from '~/lib/utils';

/**
  * Fetch external data for a given season from Survivor Wiki
  * @param seasonName The name of the season to fetch data for
  * @throws an error if the fetch fails
  * @returns An object containing castaways, tribes, episodes, and premiere info
  * @returnObj `castaways: CastawayInsert[]
  * tribes: TribeInsert[]
  * episodes: Episode[]`
  */
export default async function getExternalData(seasonName: string) {
  const url = 'https://survivor.fandom.com/api.php';
  const cleanSeason = seasonName.replace(' ', '_');

  try {
    const sectionRes = await axios.get(url, {
      params: {
        action: 'parse',
        page: cleanSeason,
        format: 'json'
      }
    });

    const sectionData = sectionRes.data as {
      parse: {
        sections: {
          index: string,
          line: string,
        }[]
      }
    };

    const castawaysSection = sectionData.parse.sections
      .find(sec => sec.line.toLowerCase() === 'castaways')?.index;
    const episodesSection = sectionData.parse.sections
      .find(sec => sec.line.toLowerCase() === 'season summary')?.index;

    if (castawaysSection === undefined || episodesSection === undefined) {
      console.error(`Could not find required sections for season ${seasonName}`);
      return { castaways: [], tribes: [] };
    }

    const castawaysRes = await axios.get(url, {
      params: {
        action: 'parse',
        page: cleanSeason,
        section: castawaysSection,
        format: 'json'
      }
    });
    const episodeRes = await axios.get(url, {
      params: {
        action: 'parse',
        page: cleanSeason,
        section: episodesSection,
        format: 'json'
      }
    });

    const castawayData = castawaysRes.data as {
      parse: {
        text: {
          '*': string
        }
      }
    };

    const catawaysHtml: string = castawayData.parse.text['*'];
    const $c = cheerio.load(catawaysHtml);
    const castaways: CastawayInsert[] = [];
    const tribes: Record<string, string> = {};

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

        // if there are previous seasons they are links like the full name
        // so we can compare the lengths to determine if there are previous seasons
        // if there are previous seasons then the occupation will not be displayed
        let occupation = '';
        const links: string = $c(columns[1]).find('a').text().trim();
        const hasPreviousSeasons = links.length !== fullName.length;
        const previouslyOn: string[] = [];
        if (hasPreviousSeasons) {
          const castaway = await axios.get(url, {
            params: {
              action: 'parse',
              page: fullName.replace(' ', '_'),
              section: 0,
              format: 'json'
            }
          });
          const castawayData = castaway.data as {
            parse: {
              text: {
                '*': string
              }
            }
          };
          const $ca = cheerio.load(castawayData.parse.text['*']);
          const sectionText = $ca('div[data-source=occupation] div').text();
          occupation = sectionText.trim();
          console.log(`Fetched occupation for ${fullName}: ${occupation}`);

          const previousSeasons = rest.substring(residenceEnd).trim();
          // split by commans and may have ", &" before last one
          previousSeasons.split(',').forEach(season => {
            const cleanSeason = season.replace('&', '').trim();
            if (cleanSeason) previouslyOn.push(cleanSeason);
          });
        } else {
          occupation = rest.substring(residenceEnd).trim();
        }

        const imageUrl: string = $c(columns[0]).find('img').attr('src') ?? '';
        const backupUrl: string = $c(columns[0]).find('img').attr('data-src') ?? '';
        const chosenUrl = imageUrl.startsWith('data') ? backupUrl : imageUrl;

        const tribeName = $c(columns[2]).text().trim();
        const tribeColor = $c(columns[2]).attr('style')?.substring(11, 18) ?? '';
        tribes[tribeName] = tribeColor;

        castaways.push({
          fullName,
          shortName: fullName.split(' ')[0] ?? fullName,
          age,
          residence: residence ?? 'Hometown N/A',
          occupation: occupation ?? 'Occupation N/A',
          imageUrl: chosenUrl.startsWith('//') ? `https:${chosenUrl}` : chosenUrl,
          tribe: tribeName,
          previouslyOn: previouslyOn
        });

        console.log(`Fetched castaway: ${fullName}`, castaways[castaways.length - 1]);
      }
    }

    const tribeList: TribeInsert[] = Object.entries(tribes)
      .map(([tribeName, tribeColor]) => ({ tribeName, tribeColor }));

    const episodeData = episodeRes.data as {
      parse: {
        text: {
          '*': string
        }
      }
    };

    const episodesHtml: string = episodeData.parse.text['*'];
    const $e = cheerio.load(episodesHtml);
    const episodes: EpisodeInsert[] = [];
    $e('table.wikitable tbody tr').each((_, row) => {
      const columns = $e(row).find('td');
      if (columns.length > 1) {
        const episodeNumber = +$e(columns[0]).text().trim();
        const title = $e(columns[1]).text().trim();
        const dateStr = $e(columns[2]).text().trim();
        episodes.push({
          episodeNumber,
          title,
          airDate: setToNY8PM(dateStr)
        });
      }
    });

    return {
      castaways,
      tribes: tribeList,
      episodes,
    };
  } catch (error) {
    console.error(`Error fetching data for season ${seasonName}:`, error);
    throw new Error(`Failed to fetch data for season ${seasonName}.`);
  }
}
