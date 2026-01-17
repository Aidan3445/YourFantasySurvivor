'use client';

import { Button } from '~/components/common/button';
import { Switch } from '~/components/common/switch';
import { Input } from '~/components/common/input';
import { SidebarMenuButton } from '~/components/common/sidebar';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '~/components/common/alertDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/common/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/common/form';
import { useDevEpisodeOverride } from '~/hooks/helpers/useDevEpisodeOverride';

export default function DevEpisodeOverride() {
  const {
    open,
    setOpen,
    overrideEnabled,
    handleToggle,
    seasons,
    episodes,
    episodesLoading,
    selectedSeasonId,
    setSelectedSeasonId,
    form,
    handleApply,
    handleReset,
    watchPrevious,
  } = useDevEpisodeOverride();

  return (
    <>
      <SidebarMenuButton className='h-10!' asChild size='lg'>
        <div
          className='text-primary! select-none cursor-pointer'
          onClick={() => handleToggle(!overrideEnabled)}>
          Episode Override
          <Switch checked={overrideEnabled} onCheckedChange={handleToggle} className='ml-auto' />
        </div>
      </SidebarMenuButton>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton className='h-10! text-primary' size='lg'>
            Configure Override
          </SidebarMenuButton>
        </AlertDialogTrigger>
        <AlertDialogContent className='max-w-2xl border-primary/30'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Dev Episode Override
            </AlertDialogTitle>
            <AlertDialogDescription className='text-base'>
              Override episode states for testing purposes. Changes are stored in localStorage and only affect the frontend.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <form className='space-y-4 pt-4'>
              {/* Season Selection */}
              <FormField
                control={form.control}
                name='seasonId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Season
                    </FormLabel>
                    <Select
                      value={field.value?.toString() ?? ''}
                      onValueChange={(value) => {
                        const seasonId = Number(value);
                        field.onChange(seasonId);
                        setSelectedSeasonId(seasonId);
                      }}>
                      <FormControl>
                        <SelectTrigger className='border-2 border-primary/20'>
                          <SelectValue placeholder='Select a season' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {seasons?.map((season) => (
                          <SelectItem key={season.seasonId} value={season.seasonId.toString()}>
                            {season.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Previous Episode */}
              <FormField
                control={form.control}
                name='previousEpisodeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Previous Episode
                    </FormLabel>
                    <Select
                      value={field.value?.toString() ?? 'null'}
                      onValueChange={(value) => {
                        field.onChange(value === 'null' ? null : Number(value));
                      }}
                      disabled={!selectedSeasonId || episodesLoading}>
                      <FormControl>
                        <SelectTrigger className='border-2 border-primary/20'>
                          <SelectValue placeholder='Select previous episode' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='null'>None</SelectItem>
                        {episodes?.map((episode) => (
                          <SelectItem key={episode.episodeId} value={episode.episodeId.toString()}>
                            Episode {episode.episodeNumber} - {episode.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Air Status for Previous */}
              <FormField
                control={form.control}
                name='previousAirStatus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Air Status for Previous
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedSeasonId || watchPrevious === null}>
                      <FormControl>
                        <SelectTrigger className='border-2 border-primary/20'>
                          <SelectValue placeholder='Select air status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Aired'>Aired</SelectItem>
                        <SelectItem value='Airing'>Airing</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Next Episode */}
              <FormField
                control={form.control}
                name='nextEpisodeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Next Episode <span className='text-xs normal-case text-muted-foreground/60'>(Auto-populated)</span>
                    </FormLabel>
                    <Select
                      value={field.value?.toString() ?? 'null'}
                      onValueChange={(value) => {
                        field.onChange(value === 'null' ? null : Number(value));
                      }}
                      disabled={!selectedSeasonId || episodesLoading}>
                      <FormControl>
                        <SelectTrigger className='border-2 border-primary/20'>
                          <SelectValue placeholder='Select next episode' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='null'>None</SelectItem>
                        {episodes?.map((episode) => (
                          <SelectItem key={episode.episodeId} value={episode.episodeId.toString()}>
                            Episode {episode.episodeNumber} - {episode.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Merge Episode */}
              <FormField
                control={form.control}
                name='mergeEpisodeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Merge Episode <span className='text-xs normal-case text-muted-foreground/60'>(Auto-populated)</span>
                    </FormLabel>
                    <Select
                      value={field.value?.toString() ?? 'null'}
                      onValueChange={(value) => {
                        field.onChange(value === 'null' ? null : Number(value));
                      }}
                      disabled={!selectedSeasonId || episodesLoading}>
                      <FormControl>
                        <SelectTrigger className='border-2 border-primary/20'>
                          <SelectValue placeholder='Select merge episode' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='null'>None</SelectItem>
                        {episodes?.map((episode) => (
                          <SelectItem key={episode.episodeId} value={episode.episodeId.toString()}>
                            Episode {episode.episodeNumber} - {episode.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* League Status */}
              <FormField
                control={form.control}
                name='leagueStatus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      League Status
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='border-2 border-primary/20'>
                          <SelectValue placeholder='Select league status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Predraft'>Predraft</SelectItem>
                        <SelectItem value='Draft'>Draft</SelectItem>
                        <SelectItem value='Active'>Active</SelectItem>
                        <SelectItem value='Inactive'>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Start Week */}
              <FormField
                control={form.control}
                name='startWeek'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Start Week
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='1'
                        className='border-2 border-primary/20'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <AlertDialogFooter>
            <Button variant='destructive' onClick={handleReset}>
              Reset Override
            </Button>
            <AlertDialogCancel variant='secondary'>Cancel</AlertDialogCancel>
            <Button variant='default' onClick={handleApply}>
              Apply Override
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
