

'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Disc, Eye, Instagram } from 'lucide-react';
import { products } from '@/lib/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const hotDrop = { id: 5, title: 'Midnight Drive', artist: 'DJ Lofty', videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.19.29.mp4?alt=media&token=fdad85e4-48e2-4911-b762-ce1a44bcd192' };

const spotifyProfiles = [
    { name: 'Verse3', url: 'https://open.spotify.com/artist/4EVUQ7kHLkDjq92K6H3GNZ?si=4I1DDMvoSEOE_5J4wS4yJg', image: getImage('artist-lofty') },
    { name: 'Lofty', url: '#', image: getImage('artist-lofty') },
    { name: 'Artist Three', url: '#', image: getImage('artist-alvin') }
];

const merchProducts = products.filter(p => p.type === 'merch').slice(0, 4);
const musicProducts = products.filter(p => p.type === 'music').slice(0, 4);
const instagramImages = [
  getImage('hero-studio'),
  getImage('album-art-2'),
  getImage('merch-hoodie'),
  getImage('artist-lofty'),
].filter(Boolean);


export default function Home() {
  const [isHotDropOpen, setIsHotDropOpen] = useState(false);

  useEffect(() => {
    const hasSeenHotDrop = localStorage.getItem('hotDropShown');

    if (!hasSeenHotDrop) {
      const timer = setTimeout(() => {
        setIsHotDropOpen(true);
        localStorage.setItem('hotDropShown', 'true');
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, []);
  

  return (
    <div className="flex flex-col">

      <Dialog open={isHotDropOpen} onOpenChange={setIsHotDropOpen}>
        <DialogContent className="max-w-xs bg-card border-primary/50">
          <DialogHeader>
            <DialogTitle className='font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl'>Hot Drop</DialogTitle>
            <DialogDescription>
              Check out the latest exclusive track from Verse3 Records.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full">
            <Card className="group overflow-hidden h-full flex flex-col border-none">
                <CardContent className="p-0 flex-grow">
                    {hotDrop.videoSrc && (
                    <div className="aspect-square relative">
                       <video
                          src={hotDrop.videoSrc}
                          controls
                          className="w-full h-full object-cover"
                        />
                    </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 flex flex-col items-start bg-card/80 space-y-4">
                    <div className='w-full flex justify-between items-center'>
                    <div>
                        <p className="font-semibold">{hotDrop.title}</p>
                        <p className="text-sm text-muted-foreground">{hotDrop.artist}</p>
                    </div>
                    <Disc className="h-6 w-6 text-primary" />
                    </div>
                </CardFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>


      {/* Hero Section */}
      <section className="relative h-[80vh] w-full flex items-end justify-center text-center text-white overflow-hidden pb-12">
        <video
          src="https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.15.08.mp4?alt=media&token=c2aaa55b-f264-4ef6-a86c-13e63d82cb85"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0"
        />
        <div className="relative z-20 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/store">Shop Merch</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/music">Explore Music</Link>
          </Button>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-16 md:py-24 bg-card">
          <div className="container max-w-4xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Our Vision</h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                  Our mission is to champion emerging talent and deliver emotionally powerful records that resonate. We believe that music is most powerful when crafted from real stories, and we are committed to fostering a community where artists can be vulnerable and authentic. At Verse Three, we are more than just a label; we are a creative hub where artists are encouraged to push boundaries, innovate their sound, and explore the depths of their artistic expression. We stand as a testament to the power of collaboration and artistic integrity, creating an environment where authentic storytelling and groundbreaking electronic music thrive.
              </p>
          </div>
      </section>

       {/* Merchandise Section */}
       <section className="py-16 md:py-24">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Featured Merch</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">Rep the label with our latest gear.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {merchProducts.map((item) => (
                    <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                        <CardContent className="p-0 flex-grow">
                            <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                                <Image
                                    src={item.image.imageUrl}
                                    alt={item.image.description}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={item.image.imageHint}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </Link>
                        </CardContent>
                        <CardFooter className="p-4 flex justify-between items-center bg-card">
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-primary">{item.price}</p>
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                <Eye className="mr-2 h-4 w-4"/>
                                View
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild>
                        <Link href="/store">View All Merch</Link>
                    </Button>
                </div>
            </div>
       </section>

       {/* Music Section */}
       <section className="py-16 md:py-24 bg-card">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Latest Music</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">Vinyl, posters, and more from our artists.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {musicProducts.map((item) => (
                     <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                        <CardContent className="p-0 flex-grow">
                            <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                                <Image
                                    src={item.image.imageUrl}
                                    alt={item.image.description}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={item.image.imageHint}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </Link>
                        </CardContent>
                        <CardFooter className="p-4 flex justify-between items-center bg-card">
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-primary">{item.price}</p>
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                <Eye className="mr-2 h-4 w-4"/>
                                View
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild>
                        <Link href="/store/music">View All Music</Link>
                    </Button>
                </div>
            </div>
       </section>


      {/* Spotify Section */}
       <section className="py-16 md:py-24 bg-background">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">Find Us On Spotify</h2>
                <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">Follow our artists and playlists on Spotify.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {spotifyProfiles.map((profile) => (
                    <Link href={profile.url} key={profile.name} target="_blank" rel="noopener noreferrer" className="block group">
                        <Card className="overflow-hidden">
                            {profile.image && (
                                <div className="aspect-square relative">
                                    <Image
                                        src={profile.image.imageUrl}
                                        alt={`Spotify profile for ${profile.name}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, 33vw"
                                        data-ai-hint={profile.image.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                </div>
                            )}
                            <CardFooter className="p-4 bg-card">
                                <h3 className="font-semibold text-lg text-center w-full">{profile.name}</h3>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
          </div>
       </section>

       {/* Instagram Section */}
       <section className="py-16 md:py-24 bg-card">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">Follow Us On Instagram</h2>
                <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">Get a behind-the-scenes look at the label and our artists.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {instagramImages.map((image) => (
                    <Link href="https://www.instagram.com/verse3records?igsh=YWtpdGd3eWl5c2g1&utm_source=qr" key={image!.id} target="_blank" rel="noopener noreferrer" className="block group aspect-square">
                        <Card className="overflow-hidden h-full">
                            {image && (
                                <div className="aspect-square relative h-full">
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        data-ai-hint={image.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                       <Instagram className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Link>
                ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild size="lg">
                    <a href="https://www.instagram.com/verse3records?igsh=YWtpdGd3eWl5c2g1&utm_source=qr" target="_blank" rel="noopener noreferrer">
                       <Instagram className="mr-2 h-5 w-5" />
                       Follow @verse3records
                    </a>
                </Button>
            </div>
          </div>
       </section>

    </div>
  );
}
