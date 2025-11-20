
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { Disc } from 'lucide-react';
import React from 'react';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const musicTracks = [
    { id: 1, title: 'Quiet Steps', artist: 'Lofty, Keith Doyle, Alvin Koumetio', image: getImage('album-art-1'), audioSrc: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Echoes in Rain', artist: 'Synthwave Kid', image: getImage('album-art-2'), audioSrc: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-2.mp3' },
    { id: 3, title: 'City Lights', artist: 'Urban Explorer', image: getImage('album-art-3'), audioSrc: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-3.mp3' },
    { id: 4, title: 'Future Funk', artist: 'Groove Master', image: getImage('album-art-1'), audioSrc: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-4.mp3' },
    { id: 5, title: 'Midnight Drive', artist: 'DJ Lofty', image: getImage('merch-vinyl'), audioSrc: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-5.mp3' },
    { id: 6, title: 'Lost in the Echo', artist: 'Alvin Koumetio', image: getImage('album-art-2'), audioSrc: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-6.mp3' }
];

export default function MusicPage() {
    const [activeAudio, setActiveAudio] = React.useState<HTMLAudioElement | null>(null);

    const handlePlay = (audioElement: HTMLAudioElement) => {
        if (activeAudio && activeAudio !== audioElement) {
            activeAudio.pause();
        }
        setActiveAudio(audioElement);
    };

    return (
        <div className="py-12 md:py-24">
            <BackButton />
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-4">Music</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Listen to the latest tracks from Verse3 Records artists.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {musicTracks.map((track) => (
                    <Card key={track.id} className="group overflow-hidden flex flex-col">
                        <CardContent className="p-0 flex-grow">
                            {track.image && (
                                <div className="aspect-square relative">
                                    <Image
                                        src={track.image.imageUrl}
                                        alt={track.image.description}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        data-ai-hint={track.image.imageHint}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 flex flex-col items-start bg-card space-y-4">
                            <div className='w-full flex justify-between items-center'>
                                <div>
                                    <p className="font-semibold">{track.title}</p>
                                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                                </div>
                                <Disc className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                            </div>
                            {track.audioSrc && (
                                <audio
                                    controls
                                    src={track.audioSrc}
                                    className="w-full"
                                    onPlay={(e) => handlePlay(e.currentTarget)}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
