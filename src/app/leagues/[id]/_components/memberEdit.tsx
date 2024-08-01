'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Check, Crown, LogOut, Palette, Pencil, SlidersHorizontal, Trash2, UserCog, UserPlus, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/app/_components/commonUI/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { Input } from '~/app/_components/commonUI/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { deleteLeague, demoteMember, leaveLeague, promoteMember, updateColor, updateDisplayName } from '~/app/api/leagues/actions';
import Swatch from '@uiw/react-color-swatch';
import { hsvaToHex, getContrastingColor, } from '@uiw/color-convert';
import { useToast } from '~/app/_components/commonUI/use-toast';

interface MemberEditProps {
  leagueId: number;
  color: string;
  isOwner: boolean;
}

export default function MemberEdit({ leagueId, color, isOwner }: MemberEditProps) {
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger>
        <SlidersHorizontal size={14} color={color} />
      </HoverCardTrigger>
      <HoverCardContent className='text-xs p-0.5 w-min text-center border-black shadow-md bg-b2 shadow-zinc-700 flex gap-2' sideOffset={10} side='top'>
        <HoverCardArrow className='absolute -translate-x-1' />
        <EditName leagueId={leagueId} />
        <EditColor leagueId={leagueId} />
        <LeaveLeague leagueId={leagueId} isOwner={isOwner} />
      </HoverCardContent>
    </HoverCard >
  );
}

interface PopupProps {
  children: ReactNode;
}

function Popup({ children }: PopupProps) {
  return (
    <PopoverContent>
      <CardContainer className='p-5 max-w-80'>
        {children}
      </CardContainer >
    </PopoverContent>
  );
}

interface UpdateProps {
  leagueId: number;
}

const editNameSchema = z.object({
  newName: z.string().min(1).max(64)
});

function EditName({ leagueId }: UpdateProps) {
  const form = useForm<z.infer<typeof editNameSchema>>({
    resolver: zodResolver(editNameSchema),
  });
  const router = useRouter();

  const [nameOpen, setNameOpen] = useState(false);

  const catchUpdate = () => {
    const update = updateDisplayName.bind(null, leagueId, form.getValues('newName'));
    update()
      .then(() => {
        setNameOpen(false);
        router.refresh();
      })
      .catch((e: Error) => {
        form.setError('newName', { type: 'manual', message: e.message });
      });
  };

  return (
    <Popover open={nameOpen} onOpenChange={setNameOpen}>
      <PopoverTrigger>
        <Pencil size={16} />
      </PopoverTrigger>
      <Popup>
        <Form {...form}>
          <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
            <FormField
              control={form.control}
              name='newName'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className='w-48'
                      type='text'
                      placeholder='Change Display Name'
                      maxLength={16}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <Button type='submit'>Change</Button>
          </form>
        </Form >
      </Popup>
    </Popover>
  );
}

const editColorSchema = z.object({
  newColor: z.string().length(7)
});

function EditColor({ leagueId }: UpdateProps) {
  const form = useForm<z.infer<typeof editColorSchema>>({
    resolver: zodResolver(editColorSchema),
  });
  const router = useRouter();

  const [colorOpen, setColorOpen] = useState(false);

  const catchUpdate = () => {
    const update = updateColor.bind(null, leagueId, form.getValues('newColor'));
    update()
      .then(() => {
        setColorOpen(false);
        router.refresh();
      })
      .catch((e: Error) => {
        form.setError('newColor', { type: 'manual', message: e.message });
      });
  };

  return (
    <Popover defaultOpen open={colorOpen} onOpenChange={setColorOpen}>
      <PopoverTrigger>
        <Palette size={16} />
      </PopoverTrigger>
      <Popup>
        <Form {...form}>
          <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
            <FormField
              control={form.control}
              name='newColor'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Swatch
                      className='justify-center w-28 gap-1 m-2'
                      colors={[
                        '#fc0509', '#fc7805', '#fce305', '#80fc05', '#2fc405',
                        '#ed4954', '#db9b34', '#d6c955', '#97e256', '#52ad39',
                        '#05bafc', '#050afc', '#7a05fc', '#cd04f9', '#fc05f9',
                        '#5c94a8', '#496ced', '#9b49ed', '#b44cd3', '#d157c2',
                      ]}
                      color={field.value}
                      rectProps={{
                        children: <Point />,
                        style: {
                          width: '18px',
                          height: '18px',
                          margin: '0px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      }}
                      onChange={(color) => field.onChange(hsvaToHex(color))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <Button type='submit'>Change</Button>
          </form>
        </Form >
      </Popup>
    </Popover>
  );
}

interface SwatchProps {
  color?: string;
  checked?: boolean;
}

function Point({ color, checked }: SwatchProps) {
  if (!checked) return null;

  return (
    <Check size={12} color={getContrastingColor(color!)} />
  );
}

interface LeaveProps extends UpdateProps {
  isOwner: boolean;
}

function LeaveLeague({ leagueId, isOwner }: LeaveProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [leaveOpen, setLeaveOpen] = useState(false);

  const catchUpdate = () => {
    const leave = leaveLeague.bind(null, leagueId);
    leave()
      .then(() => {
        router.push('/leagues');
      })
      .catch((e: Error) => {
        toast({
          title: 'Error leaving league',
          description: e.message,
          variant: 'error',
        });
      });
  };

  return (
    <Popover open={leaveOpen} onOpenChange={setLeaveOpen}>
      <PopoverTrigger>
        <LogOut size={16} />
      </PopoverTrigger>
      <Popup>
        {isOwner ? (
          <div className='max-w-60'>
            <h3>Before Leaving the league you must select a new owner.</h3>
            <h3> You can do that by clicking on the new owner&apos;s name and selecting
              <Crown size={16} fill='black' />
            </h3>
          </div>
        ) : (
          <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
            <h3>Are you sure you want to leave this league?</h3>
            <Button type='submit' variant='destructive'>Leave League</Button>
          </form>
        )}
      </Popup>
    </Popover>
  );
}


export function DeleteLeague({ leagueId }: UpdateProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const catchUpdate = () => {
    const deleteL = deleteLeague.bind(null, leagueId);
    deleteL()
      .then(() => {
        router.push('/leagues');
      })
      .catch((e: Error) => {
        toast({
          title: 'Error leaving league',
          description: e.message,
          variant: 'error',
        });
      });
  };

  return (
    <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
      <PopoverTrigger>
        <Trash2 size={16} />
      </PopoverTrigger>
      <Popup>
        <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
          <h3>Are you sure you want to delete this league, this cannot be undone?</h3>
          <Button type='submit' variant='destructive'>Delete League</Button>
        </form>
      </Popup>
    </Popover>
  );
}

interface ManageMemberProps {
  leagueId: number;
  color: string;
  displayName: string;
}

export function ManageMember({ leagueId, color, displayName }: ManageMemberProps) {
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger>
        <UserCog size={14} color={color} />
      </HoverCardTrigger>
      <HoverCardContent className='text-xs p-0.5 w-min text-center border-black shadow-md bg-b2 shadow-zinc-700 flex gap-2' sideOffset={10} side='top'>
        <HoverCardArrow className='absolute -translate-x-1' />
        <PromoteMember leagueId={leagueId} displayName={displayName} />
        <DemoteMember leagueId={leagueId} displayName={displayName} />
      </HoverCardContent>
    </HoverCard >
  );
}

interface ManageProps {
  leagueId: number;
  displayName: string;
}

function PromoteMember({ leagueId, displayName }: ManageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [roleOpen, setRoleOpen] = useState(false);

  const catchUpdate = () => {
    const promote = promoteMember.bind(null, leagueId, displayName);
    promote()
      .then(() => {
        router.refresh();
      })
      .catch((e: Error) => {
        toast({
          title: 'Error promoting member',
          description: e.message,
          variant: 'error',
        });
      });
  };

  return (
    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
      <PopoverTrigger>
        <UserPlus size={16} />
      </PopoverTrigger>
      <Popup>
        <form className='flex flex-col gap-1 justify-center' action={catchUpdate}>
          <h3>Are you sure you want to promote this member?
            <ul className='list-disc text-xs'>
              <li>Make Admin: They will be given admin privileges.</li>
              <li>Make Owner: They will be given owner privileges.
                This will also remove your owner privileges which only
                the current owner can restore.</li>
            </ul>

          </h3>
          <Button type='submit'>Promote Member</Button>
        </form>
      </Popup>
    </Popover>
  );
}

function DemoteMember({ leagueId, displayName }: ManageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [removeOpen, setRemoveOpen] = useState(false);

  const catchUpdate = () => {
    const removeL = demoteMember.bind(null, leagueId, displayName);
    removeL()
      .then(() => {
        router.refresh();
      })
      .catch((e: Error) => {
        toast({
          title: 'Error demoting member',
          description: e.message,
          variant: 'error',
        });
      });
  };

  return (
    <Popover open={removeOpen} onOpenChange={setRemoveOpen}>
      <PopoverTrigger>
        <UserX size={16} />
      </PopoverTrigger>
      <Popup>
        <form className='flex flex-col gap-1 justify-center' action={catchUpdate}>
          <h3>
            Are you sure you want to demote this member?
            <ul className='list-disc text-xs'>
              <li>Revoke Admin: They will be demoted to a regular member.
                You will be able to premote them later if you wish.</li>
              <li>Boot Member: They will be removed from the league.
                This cannot be undone</li>
            </ul>
          </h3>
          <Button type='submit' variant='destructive'>Demote Member</Button>
        </form>
      </Popup>
    </Popover>
  );
}

