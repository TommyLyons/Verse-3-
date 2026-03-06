'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { DownloadCloud, Music, FileImage, Headphones } from 'lucide-react';
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
      <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
        <Headphones className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
        <p className="font-bold uppercase tracking-widest text-xs">No digital tracks owned yet.</p>
        <Button variant="link" asChild className="text-chart-1 uppercase font-headline italic mt-2">
            <Link href="/store?brand=v3">Browse Music Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {purchases.map((purchase: any) => (
        <Card key={purchase.id} className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 bg-black/5 border-none rounded-none">
          <div className="flex items-center gap-4 w-full">
             {purchase.imageUrl && (
                <div className="relative h-16 w-16 bg-white rounded overflow-hidden flex-shrink-0 border border-black/5">
                    <Image src={purchase.imageUrl} alt="" fill className="object-contain p-1" sizes="64px" />
                </div>
             )}
             <div>
                <p className="font-bold uppercase text-sm italic">{purchase.productName}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Purchased {purchase.purchasedAt?.toDate ? format(purchase.purchasedAt.toDate(), 'PPP') : 'N/A'}
                </p>
             </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
              <Button asChild size="sm" className="flex-1 sm:flex-none bg-black text-chart-1 hover:bg-black/90 rounded-none font-bold uppercase italic text-[10px] h-10 px-4">
                <a href={purchase.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <DownloadCloud className="mr-2 h-3 w-3" />
                  Track
                </a>
              </Button>
              {purchase.imageUrl && (
                  <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none border-2 border-black hover:bg-black/5 rounded-none font-bold uppercase italic text-[10px] h-10 px-4">
                    <a href={purchase.imageUrl} target="_blank" rel="noopener noreferrer">
                      <FileImage className="mr-2 h-3 w-3" />
                      Art
                    </a>
                  </Button>
              )}
          </div>
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
      <div className="container py-24 text-center">
        <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-chart-1" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12 md:py-24 text-center">
        <h2 className="font-headline text-4xl uppercase italic mb-4">Please sign in</h2>
        <p className="text-muted-foreground mb-6">You need to be signed in to view your profile and downloads.</p>
        <Button asChild className="bg-black text-chart-1 font-bold">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-24 max-w-5xl mx-auto">
      <BackButton />
      
      <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-12 items-start">
        <Card className="w-full border-none shadow-xl bg-white rounded-none border-t-4 border-chart-1">
          <CardHeader className="items-center text-center p-8">
            <Avatar className="h-32 w-32 mb-6 border-4 border-black/5">
              <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
              <AvatarFallback className="bg-black text-chart-1 text-2xl font-bold">{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-3xl uppercase italic">{user?.displayName}</CardTitle>
            <CardDescription className="font-bold text-xs uppercase tracking-widest text-chart-1 mt-1">{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
             <div className="bg-black/5 p-4 text-center space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">V3 Member Since</p>
                <p className="font-bold text-xs">{user.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'MMM yyyy') : 'Recently'}</p>
             </div>
          </CardContent>
        </Card>

        <div className="w-full space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="font-headline text-5xl font-bold uppercase italic tracking-tighter leading-none">MY <span className="text-chart-1">LIBRARY</span></h2>
                <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Your purchased tracks & digital content</p>
            </div>
            
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <PurchasedDownloads />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
