
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (isUserLoading) {
    return (
        <div className="container py-12 md:py-24">
            <Skeleton className="h-10 w-24 mb-8" />
             <div className="flex justify-center items-center h-64">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="container py-12 md:py-24 text-center">
            <h2 className="text-2xl font-bold">Please sign in</h2>
            <p className="text-muted-foreground mt-2">You need to be signed in to view your profile.</p>
            <Button asChild className='mt-4'>
                <Link href="/">Sign In</Link>
            </Button>
        </div>
    )
  }


  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="items-center text-center">
              {isUserLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
              )}
              <CardTitle>
                {isUserLoading ? <Skeleton className="h-6 w-32" /> : user?.displayName}
              </CardTitle>
              <CardDescription>
                {isUserLoading ? <Skeleton className="h-4 w-40" /> : user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Welcome to your profile. More features coming soon!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
