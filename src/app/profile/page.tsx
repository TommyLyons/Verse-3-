'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { DownloadCloud, Music, FileImage, Headphones, RefreshCcw, Disc } from 'lucide-react';
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
            <Skeleton className="h-16 w-16" />
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
      <div className="text-center text-muted-foreground py-16 border-2 border-dashed border-black/10 rounded-none bg-black/[0.02]">
        <Headphones className="mx-auto h-12 w-12 mb-4 text-black/10" />
        <p className="font-bold uppercase tracking-widest text-[10px]">Your library is empty.</p>
        <Button variant="link" asChild className="text-chart-1 uppercase font-headline italic mt-2 text-lg">
            <Link href="/store">Find Your Sound</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {purchases.map((purchase: any) => (
        <Card key={purchase.id} className="border-none bg-white shadow-xl rounded-none border-l-4 border-chart-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch">
            <div className="relative h-48 sm:h-auto sm:w-48 bg-black/5 flex-shrink-0">
                {purchase.imageUrl ? (
                    <Image src={purchase.imageUrl} alt="" fill className="object-contain p-4" sizes="(max-width: 640px) 100vw, 192px" />
                ) : (
                    <div className="flex items-center justify-center h-full text-black/20">
                        <Disc className="h-16 w-16 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                )}
            </div>
            
            <div className="flex-grow p-6 flex flex-col justify-between">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-black text-chart-1 font-bold uppercase italic text-[8px] rounded-none px-2">V3 MASTER</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Purchased {purchase.purchasedAt?.toDate ? format(purchase.purchasedAt.toDate(), 'PPP') : 'N/A'}</span>
                    </div>
                    <h3 className="font-headline text-3xl uppercase italic leading-none">{purchase.productName}</h3>
                </div>

                <div className="space-y-3">
                    {purchase.tracks && purchase.tracks.length > 0 ? (
                        <div className="bg-black/5 p-4 rounded-none space-y-2">
                             <p className="text-[9px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Music className="h-3 w-3 text-chart-1" /> Tracklist
                             </p>
                             {purchase.tracks.map((track: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                                    <span className="text-xs font-bold uppercase italic">{track.title}</span>
                                    <div className="flex gap-2">
                                        <Button asChild size="sm" variant="ghost" className="h-8 rounded-none text-chart-1 font-bold">
                                            <a href={track.downloadUrl} download={track.title} target="_blank" rel="noopener noreferrer">
                                                <DownloadCloud className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                             ))}
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            {purchase.downloadUrl && (
                                <Button asChild className="flex-1 bg-black text-chart-1 hover:bg-black/90 rounded-none font-bold uppercase italic h-12">
                                    <a href={purchase.downloadUrl} download={purchase.productName} target="_blank" rel="noopener noreferrer">
                                        <DownloadCloud className="mr-2 h-4 w-4" />
                                        Download Track
                                    </a>
                                </Button>
                            )}
                            {purchase.imageUrl && (
                                <Button asChild variant="outline" className="flex-1 border-2 border-black hover:bg-black/5 rounded-none font-bold uppercase italic h-12">
                                    <a href={purchase.imageUrl} download={`${purchase.productName}-Artwork`} target="_blank" rel="noopener noreferrer">
                                        <FileImage className="mr-2 h-4 w-4" />
                                        Download Artwork
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
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
        <h2 className="font-headline text-4xl uppercase italic mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please sign in to access your digital library and downloads.</p>
        <Button asChild className="bg-black text-chart-1 font-bold h-12 px-12">
          <Link href="/">Sign In Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-24 max-w-6xl mx-auto">
      <BackButton />
      
      <div className="flex flex-col lg:grid lg:grid-cols-[340px_1fr] gap-12 items-start">
        <Card className="w-full border-none shadow-2xl bg-white rounded-none border-t-8 border-chart-1">
          <CardHeader className="items-center text-center p-10">
            <Avatar className="h-40 w-40 mb-8 border-8 border-black/5 ring-4 ring-chart-1/10">
              <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
              <AvatarFallback className="bg-white/10 text-white font-bold">{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-4xl uppercase italic tracking-tighter">{user?.displayName}</CardTitle>
            <CardDescription className="font-bold text-xs uppercase tracking-widest text-chart-1 mt-2">{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-4">
             <div className="bg-black/5 p-5 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">V3 Status</p>
                <p className="font-bold text-sm text-black">AUTHENTICATED MEMBER</p>
             </div>
             <div className="bg-black/5 p-5 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member Since</p>
                <p className="font-bold text-sm">{user.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'MMMM yyyy') : 'Recently'}</p>
             </div>
          </CardContent>
        </Card>

        <div className="w-full space-y-10">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Disc className="h-10 w-10 text-chart-1 animate-spin" style={{ animationDuration: '6s' }} />
                    <h2 className="font-headline text-6xl md:text-8xl font-bold uppercase italic tracking-tighter leading-none">MY <span className="text-chart-1">COLLECTION</span></h2>
                </div>
                <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] pl-1">Authorized Digital Audio Masters</p>
            </div>
            
            <PurchasedDownloads />
        </div>
      </div>
    </div>
  );
}
