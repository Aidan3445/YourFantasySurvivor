import { type EpisodeOverrideConfig } from '~/types/episodes';

const STORAGE_KEY = 'dev-episode-override';

/**
 * Load episode override configuration from localStorage
 * @returns The stored configuration or null if not found or invalid
 */
export function loadOverrideConfig(): EpisodeOverrideConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const config = JSON.parse(stored) as EpisodeOverrideConfig;

    // Validate that the config has the required fields
    if (
      typeof config.seasonId !== 'number' ||
      typeof config.enabled !== 'boolean' ||
      !['Aired', 'Airing'].includes(config.previousAirStatus) ||
      !['Predraft', 'Draft', 'Active', 'Inactive'].includes(config.leagueStatus) ||
      typeof config.startWeek !== 'number'
    ) {
      console.warn('Invalid override config found, clearing...');
      clearOverrideConfig();
      return null;
    }

    return config;
  } catch (error) {
    console.error('Failed to load override config:', error);
    clearOverrideConfig();
    return null;
  }
}

/**
 * Save episode override configuration to localStorage
 * @param config The configuration to save
 */
export function saveOverrideConfig(config: EpisodeOverrideConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save override config:', error);
  }
}

/**
 * Clear episode override configuration from localStorage
 */
export function clearOverrideConfig(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear override config:', error);
  }
}
