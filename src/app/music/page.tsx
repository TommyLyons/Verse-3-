'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { Disc, Headset, Library, Headphones, RefreshCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAllProducts, type Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';

const hotLinks = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/4EVUQ7kHLkDjq92K6H3GNZ?si=4I1DDMvoSEOE_5J4wS4yJg', icon: Disc },
    { name: 'Beatport', url: '#', icon: Headset },
    { name: 'WAV Files', url: '/store?type=music', icon: Library }
];

export default function MusicPage() {
    const [tracks, setTracks] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        async function fetchTracks() {
            setIsLoading(true);
            try {
                const products = await getAllProducts();
                // Filter for downloadable (digital) music
                const musicOnly = products.filter(p => p.type === 'music' && p.digital);
                setTracks(musicOnly);
            } catch (err) {
                console.error("Failed to fetch music catalog:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTracks();
    }, []);

    const handlePlay = (audioElement: HTMLAudioElement) => {
        if (activeAudio && activeAudio !== audioElement) {
            activeAudio.pause();
        }
        setActiveAudio(audioElement);
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24">
            <BackButton />
            <div className="text-center mb-12">
                <h1 className="font-headline text-5xl md:text-7xl font-bold text-black uppercase italic tracking-tighter">Music <span className="text-chart-1">Catalog</span></h1>
                <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-xs">Authorized Digital Audio Masters</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-none" />
                    ))}
                </div>
            ) : tracks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-none">
                    <p className="text-muted-foreground uppercase font-bold tracking-widest text-sm">No digital tracks found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tracks.map((track) => {
                        const previewUrl = track.isAlbum ? track.tracks?.[0]?.audioUrl : track.downloadUrl;
                        return (
                            <Card key={track.id} className="group overflow-hidden flex flex-col border-none shadow-xl bg-white rounded-none border-t-4 border-black/5">
                                <CardContent className="p-0 flex-grow">
                                    <Link href={`/store/music/${track.slug}`} className="block aspect-square relative bg-secondary/20 overflow-hidden">
                                        <Image
                                            src={track.imageUrl || ''}
                                            alt={track.name}
                                            fill
                                            className="object-contain p-14 transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </Link>
                                </CardContent>
                                <CardFooter className="p-6 flex flex-col items-start space-y-4">
                                    <div className='w-full flex justify-between items-start'>
                                        <div>
                                            <p className="font-headline text-2xl uppercase italic leading-none mb-1">{track.name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{track.brand || 'Verse3 Records'}</p>
                                        </div>
                                        <Disc className="h-6 w-6 text-chart-1 animate-spin" style={{ animationDuration: '4s' }} />
                                    </div>
                                    
                                    {previewUrl && (
                                        <div className="w-full space-y-2">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-chart-1">Preview</p>
                                            <audio
                                                controls
                                                src={previewUrl}
                                                className="w-full h-8"
                                                onPlay={(e) => handlePlay(e.currentTarget)}
                                            >
                                                Your browser does not support audio.
                                            </audio>
                                        </div>
                                    )}

                                    <Button asChild variant="outline" className="w-full border-2 border-black rounded-none font-bold uppercase italic text-xs hover:bg-black hover:text-chart-1 transition-all">
                                        <Link href={`/store/music/${track.slug}`}>View & Purchase</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Hot Links Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-headline text-4xl font-bold uppercase italic tracking-tighter">Hot <span className="text-chart-1">Links</span></h2>
                        <div className="h-1 w-20 bg-chart-1 mx-auto mt-2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {hotLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Button key={link.name} size="lg" variant="outline" asChild className="h-20 border-2 border-black rounded-none text-xl font-headline uppercase italic hover:bg-black hover:text-chart-1">
                                    <Link href={link.url} target={link.url.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer">
                                        <Icon className="mr-4 h-6 w-6" />
                                        {link.name}
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
