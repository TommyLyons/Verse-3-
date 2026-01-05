
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DownloadCloud, Music } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

function PurchasedDownloads() {
  const { user } = useUser();
  const firestore = useFirestore();

  const purchasesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'purchasedProducts');
  }, [firestore, user]);

  const { data: purchases, isLoading } = useCollection(purchasesQuery);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Music className="mx-auto h-12 w-12 mb-4" />
        <p>You haven't purchased any digital tracks yet.</p>
        <Button variant="link" asChild>
            <Link href="/store/music">Browse Music</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase: any) => (
        <Card key={purchase.id} className="flex items-center justify-between p-4">
          <div>
            <p className="font-semibold">{purchase.productName}</p>
            <p className="text-sm text-muted-foreground">
              Purchased on {format(purchase.purchasedAt.toDate(), 'PPP')}
            </p>
          </div>
          <Button asChild size="sm">
            <a href={purchase.downloadUrl} target="_blank" rel="noopener noreferrer">
              <DownloadCloud className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </Card>
      ))}
    </div>
  );
}

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
    );
  }

  if (!user) {
    return (
      <div className="container py-12 md:py-24 text-center">
        <h2 className="text-2xl font-bold">Please sign in</h2>
        <p className="text-muted-foreground mt-2">You need to be signed in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="flex flex-col items-center gap-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
              <CardTitle>{user?.displayName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="w-full max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>My Downloads</CardTitle>
                    <CardDescription>Your purchased digital tracks are available here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PurchasedDownloads />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
