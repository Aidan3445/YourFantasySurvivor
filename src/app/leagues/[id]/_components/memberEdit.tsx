'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Check, Crown, LogOut, Palette, Pencil, Shield, SlidersHorizontal, Trash2, UserCog, UserPlus, UserX } from 'lucide-react';
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
import { twentyColors } from '~/lib/colors';
import { type Member } from '~/app/api/leagues/query';

interface MemberEditProps {
  leagueId: number;
  color: string;
  isOwner: boolean;
}

export default function MemberEdit({ leagueId, color, isOwner }: MemberEditProps) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  return (
    <HoverCard openDelay={150} open={open} onOpenChange={setOpen}>
      <HoverCardTrigger onTouchStart={toggleOpen}>
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
                      colors={twentyColors}
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
        router.refresh();
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
            <h4 className='text-sm'> You can do that by promoting
              <UserPlus className='inline-flex mx-1' size={16} fill='black' />
              an admin
              <Shield className='inline-flex mx-1' size={16} fill='black' />
              to owner
              <Crown className='inline-flex mx-1' size={16} fill='black' />
            </h4>
          </div>
        ) : (
          <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
            <h3>Are you sure you want to leave this league?</h3>
            <Button type='submit' variant='destructive'>Leave League</Button>
          </form>
        )}
      </Popup>
    </Popover >
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
  member: Member;
}

export function ManageMember({ leagueId, color, member }: ManageMemberProps) {
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger>
        <UserCog size={14} color={color} />
      </HoverCardTrigger>
      <HoverCardContent className='text-xs p-0.5 w-min text-center border-black shadow-md bg-b2 shadow-zinc-700 flex gap-2' sideOffset={10} side='top'>
        <HoverCardArrow className='absolute -translate-x-1' />
        <PromoteMember leagueId={leagueId} {...member} />
        <DemoteMember leagueId={leagueId} {...member} />
      </HoverCardContent>
    </HoverCard >
  );
}

interface ManageProps {
  leagueId: number;
  displayName: string;
  isAdmin: boolean;
  color: string;
}

function PromoteMember({ leagueId, displayName, isAdmin, color }: ManageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [roleOpen, setRoleOpen] = useState(false);

  const catchUpdate = () => {
    const promote = promoteMember.bind(null, leagueId, displayName);
    promote()
      .then(() => {
        setRoleOpen(false);
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

  const cColor = getContrastingColor(color);

  return (
    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
      <PopoverTrigger>
        <UserPlus size={16} />
      </PopoverTrigger>
      <Popup>
        <form className='flex flex-col gap-1 justify-center' action={catchUpdate}>
          <section>
            <h3 className='items-center inline-flex gap-1'> Promote
              <span
                className='px-0.5 inline-flex rounded-md w-min h-min whitespace-nowrap'
                style={{ background: color, color: cColor }}>
                {displayName}
              </span> to {isAdmin ? (
                <h3>owner <Crown className='inline-flex' size={12} fill='black' /></h3>
              ) : (
                <h3>admin <Shield className='inline-flex' size={16} fill='black' /></h3>)}?
            </h3> {isAdmin ?
              <h4 className='text-xs text-red-700'>
                Warning: This will remove your owner privileges which only the current owner can restore.
              </h4> :
              <h4 className='text-xs'>
                Admin privilages can be revoked at any time by the owner.
              </h4>}
          </section>
          <Button type='submit'>Promote Member</Button>
        </form>
      </Popup>
    </Popover>
  );
}

function DemoteMember({ leagueId, displayName, isAdmin, color }: ManageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [removeOpen, setRemoveOpen] = useState(false);

  const catchUpdate = () => {
    const removeL = demoteMember.bind(null, leagueId, displayName);
    removeL()
      .then(() => {
        setRemoveOpen(false);
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

  const cColor = getContrastingColor(color);

  return (
    <Popover open={removeOpen} onOpenChange={setRemoveOpen}>
      <PopoverTrigger>
        <UserX size={16} />
      </PopoverTrigger>
      <Popup>
        <form className='flex flex-col gap-1 justify-center' action={catchUpdate}>
          <section>
            {isAdmin ?
              <h3 className='items-center inline-flex gap-1'> Revoke
                <span className='flex gap-1 items-center'>
                  admin <Shield className='inline-flex' size={16} fill='black' />
                </span> from
                <span
                  className='px-0.5 inline-flex rounded-md w-min h-min whitespace-nowrap'
                  style={{ background: color, color: cColor }}>
                  {displayName}
                </span>?
              </h3> :
              <h3>
                <h3 className='flex gap-1'> Boot
                  <span
                    className='px-0.5 inline-flex rounded-md w-min h-min whitespace-nowrap'
                    style={{ background: color, color: cColor }}>
                    {displayName}
                  </span> from the league?
                </h3>
                <br />
                <h4 className='text-xs text-red-700'>
                  This will delete their data and cannot be undone.
                </h4>
              </h3>}
          </section>
          <Button type='submit' variant='destructive'>{isAdmin ? 'Demote' : 'Boot'} Member</Button>
        </form>
      </Popup>
    </Popover >
  );
}

