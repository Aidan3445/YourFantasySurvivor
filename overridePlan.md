# Dev Episode Override Feature - Implementation Plan

## Overview
Add a dev testing feature to the Sys sidenav that allows overriding episode states (previous, next, merge) for testing purposes. The overrides are stored in localStorage and persist across refreshes, with a toggle to enable/disable and a reset button to clear.

## Critical Files

### Files to Create
- `/src/components/nav/side/devEpisodeOverride.tsx` - Main modal component (~400 lines)
- `/src/lib/devEpisodeOverride.ts` - localStorage utilities (~50 lines)

### Files to Modify
- `/src/components/nav/side/sys.tsx` - Add the new component below "Prevent Redirects" switch
- `/src/types/episodes.ts` - Add EpisodeOverrideConfig type
- `/src/lib/episodes.ts` - Add calculateKeyEpisodes() function for reuse in frontend and backend
- `/src/services/seasons/query/getKeyEpisodes.ts` - Refactor to use calculateKeyEpisodes() from lib

### Reference Files
- `/src/services/seasons/query/getKeyEpisodes.ts` - Logic to replicate for calculating key episodes
- `/src/hooks/seasons/useKeyEpisodes.ts` - Query key structure for cache updates
- `/src/hooks/seasons/useEpisodes.ts` - Query key structure for cache updates
- `/src/components/leagues/actions/league/join/modal.tsx` - AlertDialog pattern reference

## Data Structures

### Episode Override Config (in /src/types/episodes.ts)
```typescript
export type EpisodeOverrideConfig = {
  seasonId: number;
  previousEpisodeId: number | null;
  nextEpisodeId: number | null;
  mergeEpisodeId: number | null;
  previousAirStatus: 'Aired' | 'Airing';
  enabled: boolean; // Toggle to enable/disable override
};
```

### localStorage Key
```typescript
const STORAGE_KEY = 'dev-episode-override';
```

## Component Structure

### Main Component: DevEpisodeOverride
```tsx
export default function DevEpisodeOverride() {
  // State
  const [open, setOpen] = useState(false);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  // Hooks
  const queryClient = useQueryClient();
  const { data: seasons } = useSeasons(true);
  const { data: episodes } = useEpisodes(selectedSeasonId);

  // Form (React Hook Form)
  const form = useForm<FormSchema>({...});

  // Effects
  useEffect(() => {
    // Load override config from localStorage on mount
    // If enabled, apply the override to cache
  }, []);

  useEffect(() => {
    // When season changes, auto-populate merge episode
  }, [selectedSeasonId, episodes]);

  useEffect(() => {
    // When previous changes, auto-set next to previous + 1
  }, [watchPrevious]);

  useEffect(() => {
    // When next changes, auto-set previous to next - 1
  }, [watchNext]);

  // Handlers
  const handleApply = () => {
    // Save to localStorage
    // Apply to React Query cache
    // Close modal
  };

  const handleReset = () => {
    // Clear localStorage
    // Invalidate React Query cache to refetch
    // Reset form
  };

  const handleToggle = (enabled: boolean) => {
    // Update localStorage enabled flag
    // If enabling: apply override to cache
    // If disabling: invalidate cache to refetch
  };

  return (
    <AlertDialog>
      {/* Modal with form */}
    </AlertDialog>
  );
}
```

### Integration into sys.tsx
```tsx
// Add below the Prevent Redirects switch
<DevEpisodeOverride />
```

## Implementation Steps

### Step 1: Add Types and Utilities

**Update `/src/types/episodes.ts`:**
- Add `EpisodeOverrideConfig` type (with nullable IDs)

**Update `/src/lib/episodes.ts`:**
- Add `calculateKeyEpisodes(episodes: Episode[]): KeyEpisodes` function
- This function replicates the backend logic but can be called from frontend
- Export it for use in both frontend (dev tool) and backend

**Create `/src/lib/devEpisodeOverride.ts`:**
- `loadOverrideConfig()` - Load from localStorage
- `saveOverrideConfig()` - Save to localStorage
- `clearOverrideConfig()` - Remove from localStorage

**Update `/src/services/seasons/query/getKeyEpisodes.ts`:**
- Import and call `calculateKeyEpisodes()` from lib instead of inline logic
- This avoids code duplication

### Step 2: Create Component Shell
Create `/src/components/nav/side/devEpisodeOverride.tsx`:
- Basic AlertDialog structure with controlled open state
- AlertDialogTrigger as SidebarMenuButton
- Add to sys.tsx below Prevent Redirects

### Step 3: Add Season Selection
- Integrate useSeasons(true) hook
- Create Select dropdown for seasons
- OnChange: setSelectedSeasonId and fetch episodes

### Step 4: Add Episode Selections
- Create three Select components with "None" option:
  - Previous Episode (all episodes + "None")
  - Next Episode (all episodes + "None")
  - Merge Episode (all episodes + "None")
- Display format: "Episode {number} - {title}"
- Disable selects until season is selected
- "None" option sets value to null

### Step 5: Add Air Status Selection
- Create Select for previous episode air status
- Options: "Aired", "Airing"
- Default to "Aired"

### Step 6: Implement Auto-Population Logic
**On season change:**
- Find episode where `isMerge === true`
- Set mergeEpisodeId to that episode's ID (or null if not found)

**On previous episode change:**
- If previous is null: Set next to episode 1, merge to real merge or null
- If previous is last episode: Set next to null
- Otherwise: Set next episode to `episodeNumber = previous.episodeNumber + 1`

**On next episode change:**
- If next is null: Set previous to null, merge to null, episodes array to []
- If next is first episode (episode 1): Set previous to null
- Otherwise: Set previous episode to `episodeNumber = next.episodeNumber - 1`

**On merge episode change:**
- If merge is null: Ensure no episode has isMerge flag
- Otherwise: Set isMerge flag only on selected episode
- Note: Merge CAN be the same as previous or next (it's saved to avoid repeated searching)

### Step 7: Implement Cache Update Logic
Create `applyOverride()` function:

```typescript
const applyOverride = (config: EpisodeOverrideConfig) => {
  const episodes = queryClient.getQueryData<Episode[]>(['episodes', config.seasonId]);
  if (!episodes) return;

  // Special case: if next is null, simulate empty episodes response
  if (config.nextEpisodeId === null) {
    queryClient.setQueryData(['episodes', config.seasonId], []);
    queryClient.setQueryData(['episodes', config.seasonId, 'key'], {
      previousEpisode: null,
      nextEpisode: null,
      mergeEpisode: null,
    } as KeyEpisodes);
    return;
  }

  // Find episodes for comparisons
  const previousEp = config.previousEpisodeId
    ? episodes.find(e => e.episodeId === config.previousEpisodeId)
    : null;
  const nextEp = config.nextEpisodeId
    ? episodes.find(e => e.episodeId === config.nextEpisodeId)
    : null;
  const mergeEp = config.mergeEpisodeId
    ? episodes.find(e => e.episodeId === config.mergeEpisodeId)
    : null;

  // Update all episodes
  const updatedEpisodes = episodes.map(ep => {
    const updated = { ...ep };

    // Update air status based on position
    if (previousEp && ep.episodeId === config.previousEpisodeId) {
      updated.airStatus = config.previousAirStatus;
    } else if (nextEp && ep.episodeId === config.nextEpisodeId) {
      updated.airStatus = 'Upcoming';
    } else if (previousEp && ep.episodeNumber < previousEp.episodeNumber) {
      updated.airStatus = 'Aired';
    } else if (nextEp && ep.episodeNumber > nextEp.episodeNumber) {
      updated.airStatus = 'Upcoming';
    } else if (previousEp && nextEp && ep.episodeNumber > previousEp.episodeNumber && ep.episodeNumber < nextEp.episodeNumber) {
      updated.airStatus = 'Upcoming';
    }

    // Update merge flag (only one episode can be merge)
    if (mergeEp) {
      updated.isMerge = ep.episodeId === config.mergeEpisodeId;
      // If episode is now merge, turn off finale flag
      if (updated.isMerge && updated.isFinale) {
        updated.isFinale = false;
      }
    } else {
      // If merge is null, no episode has merge flag
      updated.isMerge = false;
    }

    return updated;
  });

  // Update episodes cache
  queryClient.setQueryData(['episodes', config.seasonId], updatedEpisodes);

  // Recalculate and update key episodes using shared lib function
  const keyEpisodes = calculateKeyEpisodes(updatedEpisodes);
  queryClient.setQueryData(['episodes', config.seasonId, 'key'], keyEpisodes);
};
```

**Note:** `calculateKeyEpisodes()` is now imported from `/src/lib/episodes.ts` (added in Step 1)

### Step 8: Implement localStorage Integration
**On component mount:**
```typescript
useEffect(() => {
  const config = loadOverrideConfig();
  if (config && config.enabled) {
    setOverrideEnabled(true);
    setSelectedSeasonId(config.seasonId);
    // Populate form with saved values
    form.setValue('seasonId', config.seasonId);
    form.setValue('previousEpisodeId', config.previousEpisodeId);
    form.setValue('nextEpisodeId', config.nextEpisodeId);
    form.setValue('mergeEpisodeId', config.mergeEpisodeId);
    form.setValue('previousAirStatus', config.previousAirStatus);
    // Apply override to cache
    applyOverride(config);
  }
}, []);
```

**On apply:**
```typescript
const handleApply = form.handleSubmit((data) => {
  const config: EpisodeOverrideConfig = {
    ...data,
    enabled: true,
  };
  saveOverrideConfig(config);
  setOverrideEnabled(true);
  applyOverride(config);
  setOpen(false);
  alert('Episode override applied and saved to localStorage');
});
```

### Step 9: Implement Toggle Switch
Add a Switch component in the Sys sidenav (separate from the modal):
```tsx
<SidebarMenuButton className='h-10!' asChild size='lg'>
  <div
    className='text-primary! select-none cursor-pointer'
    onClick={() => handleToggle(!overrideEnabled)}>
    Episode Override
    <Switch checked={overrideEnabled} onCheckedChange={handleToggle} className='ml-auto' />
  </div>
</SidebarMenuButton>
```

Toggle handler:
```typescript
const handleToggle = (enabled: boolean) => {
  const config = loadOverrideConfig();
  if (!config) return;

  const updatedConfig = { ...config, enabled };
  saveOverrideConfig(updatedConfig);
  setOverrideEnabled(enabled);

  if (enabled) {
    // Apply override to cache
    applyOverride(updatedConfig);
  } else {
    // Invalidate cache to refetch real data
    queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId] });
    queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId, 'key'] });
  }
};
```

### Step 10: Implement Reset Button
Add reset button in modal footer:
```tsx
<AlertDialogFooter>
  <Button variant="destructive" onClick={handleReset}>
    Reset Override
  </Button>
  <AlertDialogCancel variant="secondary">Cancel</AlertDialogCancel>
  <Button variant="default" onClick={handleApply}>
    Apply Override
  </Button>
</AlertDialogFooter>
```

Reset handler:
```typescript
const handleReset = () => {
  const config = loadOverrideConfig();
  clearOverrideConfig();
  setOverrideEnabled(false);
  form.reset();
  setSelectedSeasonId(null);

  if (config) {
    // Invalidate cache to refetch real data
    queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId] });
    queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId, 'key'] });
  }

  alert('Episode override cleared');
};
```

### Step 11: Add Form Validation
Create Zod schema:
```typescript
const formSchema = z.object({
  seasonId: z.number(),
  previousEpisodeId: z.number().nullable(),
  nextEpisodeId: z.number().nullable(),
  mergeEpisodeId: z.number().nullable(),
  previousAirStatus: z.enum(['Aired', 'Airing']),
}).refine((data) => {
  // If both previous and next are set, validate that previous < next
  if (data.previousEpisodeId === null || data.nextEpisodeId === null) {
    return true; // Allow nulls
  }

  const episodes = queryClient.getQueryData<Episode[]>(['episodes', data.seasonId]);
  if (!episodes) return true;

  const prevEp = episodes.find(e => e.episodeId === data.previousEpisodeId);
  const nextEp = episodes.find(e => e.episodeId === data.nextEpisodeId);

  if (!prevEp || !nextEp) return true;

  return prevEp.episodeNumber < nextEp.episodeNumber;
}, {
  message: "Previous episode must come before next episode",
});
```

### Step 12: Add UI Polish
- Loading states: Disable form while episodes are loading
- Error states: Show error if episodes fail to load
- Visual indicator: Show "(Auto-populated)" text next to auto-calculated fields
- Disable Apply button if form is invalid
- Add helper text explaining this is for testing only

## UI Layout

```
┌─────────────────────────────────────────────┐
│  Dev Episode Override (For Testing Only)    │
├─────────────────────────────────────────────┤
│                                             │
│  Season                                     │
│  [Select Season Dropdown ▼]                 │
│                                             │
│  Previous Episode                           │
│  [Select Episode ▼]                         │
│                                             │
│  Air Status for Previous                    │
│  [Select: Aired | Airing ▼]                 │
│                                             │
│  Next Episode (Auto-populated)              │
│  [Select Episode ▼]                         │
│                                             │
│  Merge Episode (Auto-populated)             │
│  [Select Episode ▼]                         │
│                                             │
├─────────────────────────────────────────────┤
│  [Reset Override] [Cancel] [Apply Override] │
└─────────────────────────────────────────────┘
```

In Sys Sidenav:
```
─────────────────────
 Data Import Page
─────────────────────
 Prevent Redirects      [Toggle]
─────────────────────
 Episode Override       [Toggle]  ← New
 [Configure Override]   ← Opens modal
─────────────────────
```

## Edge Cases & Validation

1. **No Episodes**: If season has no episodes, show message "No episodes found"
2. **No Merge**: If no episode has isMerge=true, merge will be null (user can set any episode as merge)
3. **Previous is Last Episode**: Auto-set next to null
4. **Next is First Episode**: Auto-set previous to null
5. **Previous is Null**: Auto-set next to episode 1, merge to real merge or null
6. **Next is Null**: Clear all - set previous to null, merge to null, episodes array to []
7. **Merge is Null**: Ensure no episode has isMerge flag
8. **Same Episode**: Merge CAN be the same as previous or next (it's saved to avoid searching)
9. **Invalid localStorage**: If localStorage data is corrupt, clear it and show error
10. **Missing Episode IDs**: If saved episode IDs don't exist in current season, reset

## Testing Strategy

### Manual Test Cases
1. Open modal, select season, verify episodes load
2. Select previous episode, verify next auto-populates to next episode
3. Select next episode, verify previous auto-populates to previous episode
4. Verify merge episode auto-populates from isMerge=true episode
5. Change merge episode, verify it updates
6. Apply override, verify localStorage saves
7. Refresh page, verify override persists and cache is updated
8. Toggle switch off, verify cache refetches real data
9. Toggle switch on, verify override reapplies
10. Click reset, verify localStorage clears and cache refetches
11. Verify all episodes' air statuses update correctly based on position

### Edge Case Tests
- First episode as next (previous should be null)
- Last episode as previous (next should be null)
- Set previous to null (next should become episode 1, merge should be real merge or null)
- Set next to null (all fields should become null, episodes array should be [])
- Set merge to null (no episode should have isMerge flag)
- Merge is same as previous episode
- Merge is same as next episode
- Season with no merge episode
- Rapid toggling of enable/disable switch
- Opening modal with override already saved
- Changing seasons while override is active

## Verification

After implementation, test the following end-to-end:

1. **Configure Override**:
   - Open Sys sidenav
   - Click "Configure Override" button
   - Select a season
   - Select previous episode (e.g., Episode 5)
   - Verify next auto-populates to Episode 6
   - Verify merge auto-populates to actual merge episode
   - Select air status "Airing" for previous
   - Click "Apply Override"

2. **Verify Override Applied**:
   - Navigate to a page that uses episodes data
   - Verify previousEpisode is Episode 5 with airStatus "Airing"
   - Verify nextEpisode is Episode 6 with airStatus "Upcoming"
   - Verify all episodes before Episode 5 have airStatus "Aired"
   - Verify all episodes after Episode 6 have airStatus "Upcoming"

3. **Test Persistence**:
   - Refresh the page
   - Verify override is still applied
   - Open DevTools > Application > LocalStorage
   - Verify 'dev-episode-override' key exists with correct data

4. **Test Toggle**:
   - Toggle "Episode Override" switch off
   - Verify real episode data is shown (refetched from API)
   - Toggle switch back on
   - Verify override reapplies without needing to reconfigure

5. **Test Reset**:
   - Open modal
   - Click "Reset Override"
   - Verify localStorage is cleared
   - Verify real episode data is shown
   - Verify toggle switch is off

## Dependencies

All dependencies already exist in the codebase:
- @tanstack/react-query - Cache management
- react-hook-form + zod - Form handling
- shadcn/ui components - UI (AlertDialog, Select, Switch, Button, etc.)
- useSeasons hook - Fetch seasons
- useEpisodes hook - Fetch episodes

## Summary

This implementation provides a robust dev testing tool that:
- ✅ Allows configuring episode state overrides via modal
- ✅ Persists configuration in localStorage across refreshes
- ✅ Provides toggle switch to enable/disable without losing config
- ✅ Provides reset button to clear all overrides
- ✅ Auto-populates related fields intelligently
- ✅ Updates both episodes array and key episodes in cache
- ✅ Updates all episodes' air statuses based on position
- ✅ Enforces only one merge episode
- ✅ Frontend-only (no backend mutations)
- ✅ Always visible (already behind SysAdmin access)

