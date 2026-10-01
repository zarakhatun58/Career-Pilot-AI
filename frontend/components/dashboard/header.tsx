'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  toggleSidebar,
  markAllNotificationsRead,
} from '@/lib/redux/slices/uiSlice';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/lib/utils/score';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const notifications = useAppSelector((s) => s.ui.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, resumes, companies..."
          className="pl-9 bg-secondary/50"
        />
      </div>

      <div className="flex-1 sm:flex-none" />

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col gap-1 rounded-md px-2 py-2 text-sm ${
                n.read ? '' : 'bg-accent/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{n.title}</span>
                {!n.read && <span className="h-2 w-2 rounded-full bg-accent" />}
              </div>
              <p className="text-muted-foreground">{n.message}</p>
              <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-secondary">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent/10 text-accent text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || 'Guest'}</span>
              <span className="text-xs text-muted-foreground">{user?.email || ''}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
            <LogOut className="h-4 w-4" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
