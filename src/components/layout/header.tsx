
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User as UserIcon } from 'lucide-react';
import React from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const navLinks = [
  { href: '/booking', label: 'Booking' },
  { href: '/store', label: 'Store' },
  { href: '/music', label: 'Music' },
  { href: '/artists', label: 'Artists' },
  { href: '/news', label: 'News' },
  { href: '/submit-music', label: 'Submit Music' },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        isActive ? 'text-primary' : 'text-foreground/80'
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleGoogleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleSignOut = () => {
    if (!auth) return;
    signOut(auth);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-primary" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-6 p-6">
                  <Logo />
                  {[{ href: '/', label: 'Home' }, ...navLinks].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSheetOpen(false)}
                      className="text-lg font-medium text-foreground/80 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:block">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="md:hidden">
            <Logo />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/store#cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {isUserLoading ? (
             <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/profile">
                     <UserIcon className="mr-2 h-4 w-4" />
                     <span>Profile</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleGoogleSignIn} className="hidden sm:inline-flex">Sign In</Button>
          )}

          <Button asChild className="hidden sm:inline-flex">
            <Link href="/booking">Book Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
