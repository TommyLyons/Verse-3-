import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const artists = [
    {
        name: "Keith Doyle",
        role: "Director/Founder & Head of A&R",
        description: "A seasoned music professional with roots in artist management and promotions, notably working with UK rapper Jevon. Keith brings strategic insight, a finely tuned ear for talent, and a strong understanding of what makes a record connect.",
        image: getImage('artist-keith')
    },
    {
        name: "Steve Liddle (Lofty)",
        role: "Director/Founder & Producer",
        description: "An accomplished producer whose sonic craft forms the backbone of the label’s output. Steve’s studio expertise and emotive production style define the musical direction of Verse Three Records.",
        image: getImage('artist-lofty')
    },
    {
        name: "Alvin Koumetio",
        role: "Director/Founder & Songwriter",
        description: "A songwriter with a natural ability to translate emotion into melody and narrative. Alvin provides the lyrical and conceptual depth that drives the label’s creative identity.",
        image: getImage('artist-alvin')
    }
];

export default function ArtistsPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-5">Meet The Team</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Meet the talent and visionaries behind Verse3 Records.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <Card key={artist.name} className="flex flex-col">
            <CardHeader className="items-center">
              {artist.image && (
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary/50 mb-4 bg-black">
                  <Image
                    src={artist.image.imageUrl}
                    alt={`Portrait of ${artist.name}`}
                    fill
                    className="object-cover"
                    data-ai-hint={artist.image.imageHint}
                     sizes="(max-width: 640px) 128px, 160px"
                  />
                </div>
              )}
              <CardTitle className="text-center text-2xl">{artist.name}</CardTitle>
              <CardDescription className="text-center text-primary">{artist.role}</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground flex-grow">
              <p>{artist.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
