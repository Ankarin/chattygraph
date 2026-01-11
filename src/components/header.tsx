'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { SidebarTrigger } from './ui/sidebar';
import { Icons } from '@/components/ui/icons';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className='z-10 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b bg-background px-4'>
      <div className='flex items-center gap-4'>
        <SidebarTrigger />
        <Link
          href='/'
          className='flex items-center gap-x-4'
        >
          <span className='font-semibold'>Chattygraph</span>
        </Link>
      </div>
      <div className='flex items-center gap-x-4'>
        <SignedOut>
          <SignInButton>
            <Button variant='ghost'>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title='Toggle theme'
          >
            <Icons.Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Icons.Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
