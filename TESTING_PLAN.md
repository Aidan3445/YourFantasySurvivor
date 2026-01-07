# Testing Plan: Complex Functions with Business Logic

This document tracks testing progress for functions with significant business logic, excluding simple database queries and data fetching.

## ✅ Completed Testing (src/lib/)
- ✓ `camelToTitle()` - 7 tests
- ✓ `cn()` - 6 tests (in utils.test.ts, not listed separately)
- ✓ `findTribeCastaways()` - 5 tests
- ✓ `getTribeTimeline()` - 5 tests
- ✓ `basePredictionRulesSchemaToObject()` - 5 tests
- ✓ `basePredictionRulesObjectToSchema()` - 4 tests
- ✓ `getHslIndex()` - 6 tests
- ✓ `setToNY8PM()` - 6 tests
- ✓ `getAirStatus()` - 7 tests
- ✓ `getAirStatusPollingInterval()` - 10 tests
- ✓ `compileScores()` - 10 tests (IMPORTANT - core scoring logic)

**Total: 70 tests for src/lib/**

---

## ✅ Completed Testing (src/services/)

### Query Services

#### ✓ `src/services/leagues/query/selectionTimeline.ts`
**Function:** `processSelectionTimeline()`
**Tests:** 10 tests in `src/services/tests/leagues/query/selectionTimeline.test.ts`
**Coverage:**
- ✓ Single member with one selection
- ✓ Member keeping same castaway (fills gaps between updates)
- ✓ Member going back to previous castaway (ignores duplicate)
- ✓ Multiple members selecting different castaways
- ✓ Castaway being traded between members
- ✓ Draft vs non-draft selection behavior
- ✓ Complex multi-member swaps
- ✓ Empty selection updates

#### ✓ `src/services/seasons/query/getKeyEpisodes.ts`
**Function:** `getKeyEpisodes()`
**Tests:** 12 tests in `src/services/tests/seasons/query/getKeyEpisodes.test.ts`
**Coverage:**
- ✓ Identifying previous episode (last Aired/Airing)
- ✓ Identifying next episode (first Upcoming)
- ✓ Identifying merge episode
- ✓ Various episode status combinations
- ✓ Edge cases (no episodes, only aired, only upcoming)

#### ✓ `src/services/seasons/query/eliminations.ts`
**Function:** `getEliminations()`
**Tests:** 9 tests in `src/services/tests/seasons/query/eliminations.test.ts`
**Coverage:**
- ✓ Grouping eliminations by episode number
- ✓ Skipping rows with null castawayId or eventId
- ✓ Multiple eliminations per episode
- ✓ Double elimination scenarios
- ✓ Empty result handling

#### ✓ `src/services/seasons/query/tribesTimeline.ts`
**Function:** `getTribesTimeline()`
**Tests:** 10 tests in `src/services/tests/seasons/query/tribesTimeline.test.ts`
**Coverage:**
- ✓ Grouping castaways by tribe and episode
- ✓ Multiple episodes tracking
- ✓ Tribe swaps
- ✓ Merge episodes (one tribe)
- ✓ Multiple castaways in same tribe
- ✓ Three-tribe configurations
- ✓ Order preservation

### Mutation Services

#### ✓ `src/services/leagues/mutation/makePrediction.ts`
**Function:** `getMemberBetBalance()`
**Tests:** 7 tests in `src/services/tests/leagues/mutation/getMemberBetBalance.test.ts`
**Coverage:**
- ✓ Positive score with no bets
- ✓ Score with existing bets
- ✓ Insufficient balance (rejects bet)
- ✓ Zero score
- ✓ Ignoring bets from other members
- ✓ Ignoring predictions without bets
- ✓ Member with no score history

---

## ✅ Completed Testing (src/hooks/)

### Enrichment Hooks

#### ✓ `src/hooks/seasons/enrich/useEnrichPredictions.ts`
**Tests:** 8 tests in `src/hooks/tests/seasons/enrich/useEnrichPredictions.test.ts`
**Complexity:** High (187 lines)
**Coverage:**
- ✓ Empty state when dependencies not loaded
- ✓ Enriching castaway predictions with tribe info
- ✓ Separating hits from misses
- ✓ Handling tribe predictions
- ✓ Skipping predictions with null hit values
- ✓ Skipping predictions without matching events
- ✓ Including elimination episode information

#### ✓ `src/hooks/leagues/enrich/usePredictionsMade.ts`
**Tests:** 12 tests in `src/hooks/tests/leagues/enrich/usePredictionsMade.test.ts`
**Complexity:** Medium (88 lines)
**Coverage:**
- ✓ Empty state when dependencies not loaded
- ✓ Filtering base predictions by logged-in member
- ✓ Filtering by selectedMemberId parameter
- ✓ Grouping base predictions by episode
- ✓ Collecting multiple predictions from same episode
- ✓ Handling empty prediction arrays
- ✓ Filtering custom event predictions
- ✓ Grouping custom predictions by episode
- ✓ Handling both base and custom predictions together
- ✓ Passing overrideHash to dependent hooks

#### ✓ `src/hooks/leagues/enrich/useActionDetails.ts`
**Tests:** 11 tests in `src/hooks/tests/leagues/enrich/useActionDetails.test.ts`
**Complexity:** Very High (266 lines - largest hook)
**Coverage:**
- ✓ Undefined state when dependencies not loaded
- ✓ Building elimination lookup map
- ✓ Identifying onTheClock member (draft order)
- ✓ Identifying onDeck member
- ✓ Counting enabled prediction rules
- ✓ Combining base and custom predictions for next episode
- ✓ Filtering rules based on prediction timing
- ✓ Handling null eliminations
- ✓ Handling all members with selections (edge case)
- ✓ Building actionDetails with tribe grouping

---

## 📊 Final Test Summary

**Total Test Files:** 20
**Total Tests:** 156 tests
**Status:** ✅ All passing

### Breakdown by Category:
- **src/lib/:** 70 tests (utilities, scoring, episodes)
- **src/services/query/:** 41 tests (data fetching with logic)
- **src/services/mutation/:** 7 tests (bet balance calculation)
- **src/hooks/:** 31 tests (enrichment hooks)
- **src/services/query/ (simple):** 12 tests (colors, name, settings)

---

## 🔄 Not Tested (Out of Scope)

### Simple CRUD Operations (Skipped as Planned)
- `src/services/leagues/query/league.ts` - Simple SELECT query
- `src/services/leagues/query/leagueMembers.ts` - Simple SELECT with JOIN
- Most files in `src/services/leagues/mutation/` that are pure database operations
- Simple data hooks like `useLeagues.ts`, `useLeague.ts`, etc.

### Complex Functions Not Yet Tested
- `src/services/leagues/mutation/chooseCastaway.ts` - `chooseCastawayLogic()` (48-hour priority window, draft validation)
  - Requires extensive mocking of database transactions and complex business rules
  - Recommended for future testing if priority increases

---

### Medium Priority

#### 4. `src/services/leagues/mutation/updateDraftOrder.ts`
If it has validation logic for ensuring unique draft orders

#### 5. `src/services/seasons/query/` - Any query with data transformation
Check for functions that aggregate or transform data beyond simple SELECT queries

---

## 🎯 Priority: Hooks with Complex Logic

### High Priority

#### 1. `src/hooks/seasons/enrich/useEnrichPredictions.ts`
**Complexity:** High (187 lines)
**Logic:**
- Creates lookup maps (tribes, castaways, members, events, elimination episodes)
- `findTribe()` function - searches tribes timeline backwards to find castaway's tribe
- Groups predictions by event name
- Combines multiple events with same name
- Enriches predictions with member, castaway, and tribe information
- Separates hits and misses

**Test Coverage Needed:**
- Building lookup maps from data
- findTribe() logic with multiple tribe changes
- Grouping predictions with same event name
- Combining references from multiple events
- Enriching castaway predictions with tribe
- Enriching tribe predictions
- Edge case: prediction with no matching event
- Edge case: prediction with no matching member
- Edge case: castaway not found in tribes timeline

---

#### 2. `src/hooks/leagues/enrich/usePredictionsMade.ts`
**Complexity:** Medium (88 lines)
**Logic:**
- Filters base predictions by logged-in member
- Filters custom predictions by logged-in member
- Groups filtered predictions by episode number
- Returns structured object with both types

**Test Coverage Needed:**
- Member with predictions in multiple episodes
- Member with no predictions
- Mixed base and custom predictions
- Edge case: member ID not found
- Optional selectedMemberId override

---

#### 3. `src/hooks/leagues/enrich/useActionDetails.ts`
**Complexity:** High (266 lines - largest hook)
**Logic:** (from partial read)
- Creates elimination lookup map
- Builds membersWithPicks with current selections
- Handles members with no picks ("out" status)
- Complex derived state from multiple data sources

**Test Coverage Needed:** (need to read full file)
- TBD after full analysis

---

### Medium Priority

#### 4. `src/hooks/seasons/enrich/useEnrichEvents.ts`
**Complexity:** Medium (179 lines)
**Logic:** TBD - likely similar enrichment patterns to useEnrichPredictions

#### 5. `src/hooks/leagues/enrich/useLeagueData.ts`
**Complexity:** Medium (101 lines)
**Logic:** TBD - likely aggregates league data

---

## 📋 Testing Strategy

### For Services:
1. **Mock Drizzle queries** - Use existing `src/services/__mocks__/db.ts`
2. **Mock external dependencies** - Use vi.mock for imported services
3. **Test business logic in isolation** - Focus on the data transformation, not DB operations
4. **Test error cases** - Inactive leagues, missing data, validation failures

### For Hooks:
1. **Mock React hooks** - Use `@testing-library/react-hooks` or similar
2. **Mock custom hooks** - Mock data fetching hooks to return test data
3. **Test useMemo/useEffect logic** - Verify derived state calculations
4. **Test edge cases** - Null data, empty arrays, missing fields

---

## 🎯 Immediate Next Steps

1. ✅ Create this testing plan
2. **Write tests for `processSelectionTimeline()`** - Pure function, easy to test
3. **Write tests for `getMemberBetBalance()`** - Helper function, needs mocking
4. **Write tests for `useEnrichPredictions` logic** - Extract testable pure functions if needed
5. Continue with remaining high-priority items

---

## 📊 Coverage Goals

- **Services with complex logic:** >90% coverage on business logic functions
- **Hooks with complex logic:** >80% coverage on derived state calculations
- **Simple CRUD operations:** Can be skipped (already validated by TypeScript and Drizzle)
- **UI components:** Not included in this plan (separate testing strategy needed)

---

## ✂️ Files to SKIP

### Services to Skip (simple queries):
- `src/services/leagues/query/name.ts` - Simple SELECT
- `src/services/leagues/query/settings.ts` - Simple SELECT
- `src/services/leagues/query/colors.ts` - Simple SELECT with map
- `src/services/leagues/query/league.ts` - Simple JOIN
- Most mutation files that are just INSERT/UPDATE/DELETE without logic

### Hooks to Skip (simple data fetching):
- `src/hooks/user/useLeagues.ts` - Just wraps API call
- `src/hooks/seasons/useTribes.ts` - Just fetches and returns
- `src/hooks/seasons/useEliminations.ts` - Simple data fetch
- `src/hooks/leagues/useLeague.ts` - Simple data fetch
- Any hook that's just `const { data } = useQuery(...)` with no transformation
