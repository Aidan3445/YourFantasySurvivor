import 'server-only';

import axios from 'axios';
import * as cheerio from 'cheerio';
import { type NewCastaway } from '~/server/db/defs/castaways';
import type { TribeName, TribeColor, NewTribe } from '~/server/db/defs/tribes';

export async function fetchSeasonInfo(seasonName: string) {
  const url = 'https://survivor.fandom.com/api.php';

  try {
    const castawaysRes = await axios.get(url, {
      params: {
        action: 'parse',
        page: seasonName.replace(' ', '_'),
        section: 3, // Section containing the contestant table
        format: 'json'
      }
    });
    const episodeRes = await axios.get(url, {
      params: {
        action: 'parse',
        page: seasonName.replace(' ', '_'),
        section: 4, // Section containing the episode table
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
    const castaways: NewCastaway[] = [];
    const tribes: Record<TribeName, TribeColor> = {};

    $c('table.wikitable tbody tr').each((_, row) => {
      const columns = $c(row).find('td');

      if (columns.length > 1) {
        const fullName: string = $c(columns[1]).find('a').text().trim();

        const details: string = $c(columns[1]).find('small').text().trim();
        const age = parseInt(details);
        const residenceStart = details.indexOf(' ') + 1;
        const rest = details.substring(residenceStart);
        const residenceEnd = (rest.indexOf(',') ?? -3) + 4;
        const residence = rest.substring(0, residenceEnd);
        const occupation = rest.substring(residenceEnd).trim();

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
          tribe: tribeName
        });

      }
    });

    const tribeList: NewTribe[] = Object.entries(tribes)
      .map(([tribeName, color]) => ({ tribeName, color }));

    const episodeData = episodeRes.data as {
      parse: {
        text: {
          '*': string
        }
      }
    };
    const episodeHtml: string = episodeData.parse.text['*'];
    const $e = cheerio.load(episodeHtml);
    const episodeTitle = $e($e('table.wikitable tbody tr')
      .find('td')[1]).text().trim();
    const premiereDate = $e($e('table.wikitable tbody tr')
      .find('td')[2]).text().trim();

    return {
      castaways,
      tribes: tribeList,
      episode: episodeTitle,
      premiere: new Date(`${premiereDate} 20:00:00`)
    };
  } catch (error) {
    console.error('Error fetching Survivor 48 data:', error);
    return { castaways: [], tribes: [] };
  }
}

