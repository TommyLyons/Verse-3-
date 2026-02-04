
'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, User as UserIcon, Shield, X } from 'lucide-react';
import React from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { AuthDialog } from '@/components/auth-dialog';
import { useCart } from '@/context/cart-context';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/store', label: 'Store' },
  { href: '/music', label: 'Music' },
  { href: '/artists', label: 'Artists' },
  { href: '/news', label: 'News' },
  { href: '/submit-music', label: 'Submit Music' },
];

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { cart } = useCart();
  const isAdmin = user?.email === 'verse3records@gmail.com';

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleGoogleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
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
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="container flex h-20 items-center">
          <div className="grid w-full grid-cols-3 items-center">
            
            {/* Left: Singular Menu Button */}
            <div className="flex justify-start">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:text-chart-1">
                    <Menu className="h-8 w-8" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="top" 
                  className="w-full h-screen bg-black border-none text-white flex flex-col items-center justify-center p-0 transition-all duration-500 ease-in-out overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-20 flex items-center px-4 md:px-8 border-b border-white/10">
                    <div className="grid w-full grid-cols-3 items-center">
                      <div className="flex justify-start">
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon" className="text-white hover:text-chart-1">
                            <X className="h-8 w-8" />
                          </Button>
                        </SheetClose>
                      </div>
                      <div className="flex justify-center">
                        <Logo />
                      </div>
                      <div className="flex justify-end">
                        {/* Empty spacer to maintain centering */}
                      </div>
                    </div>
                  </div>

                  <nav className="flex flex-col items-center gap-2 md:gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsSheetOpen(false)}
                        className="text-xl md:text-2xl font-headline tracking-tighter text-white hover:text-chart-1 transition-all duration-300 hover:scale-110"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-6 flex items-center gap-8">
                    {!user && (
                      <Button 
                        onClick={() => {
                          setIsSheetOpen(false);
                          setIsAuthDialogOpen(true);
                        }}
                        size="sm"
                        className="bg-chart-1 text-black hover:bg-chart-1/90 font-bold px-6"
                      >
                        Sign In / Register
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Logo />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-2 md:space-x-4">
              <Button variant="ghost" size="icon" asChild className="text-white hover:text-chart-1">
                <Link href="/cart" className="relative">
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-chart-1 text-[10px] font-bold text-black">
                      {cartItemCount}
                    </span>
                  )}
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>

              {isUserLoading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                        <AvatarFallback className="bg-white/10 text-white font-bold">{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile"><UserIcon className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                    {isAdmin && <DropdownMenuItem asChild><Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setIsAuthDialogOpen(true)} 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:text-chart-1"
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} onGoogleSignIn={handleGoogleSignIn} />
    </>
  );
}
