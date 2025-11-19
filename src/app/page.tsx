import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, Calendar, Disc, Mic } from 'lucide-react';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const heroImage = getImage('hero-studio');

const latestReleases = [
  { id: 1, title: 'Midnight Drive', artist: 'DJ Lofty', image: getImage('album-art-1') },
  { id: 2, title: 'Echoes in Rain', artist: 'Synthwave Kid', image: getImage('album-art-2') },
  { id: 3, title: 'City Lights', artist: 'Urban Explorer', image: getImage('album-art-3') },
];

const featuredMerch = [
  { id: 1, name: 'Verse3 Logo Hoodie', price: '$59.99', image: getImage('merch-hoodie') },
  { id: 2, name: 'DJ Lofty - Midnight Drive Vinyl', price: '$29.99', image: getImage('merch-vinyl') },
  { id: 3, name: 'Verse3 Embroidered Cap', price: '$24.99', image: getImage('merch-cap') },
];

const features = [
  {
    icon: Mic,
    title: 'Pro-Level Recording',
    description: 'Our studio is equipped with state-of-the-art gear to capture your sound perfectly.',
  },
  {
    icon: Disc,
    title: 'Music Production',
    description: 'From beat making to final mastering, our in-house producers are here to help.',
  },
  {
    icon: Calendar,
    title: 'Flexible Booking',
    description: 'Book studio time that fits your schedule with our easy-to-use online calendar.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
            Craft Your Sound at <span className="text-primary">Verse3 Records</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            A professional recording studio and independent record label dedicated to bringing your musical vision to life.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/booking">Book a Session</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Explore Music
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Releases Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-7xl">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Latest Releases</h2>
            <Link href="/music" className="flex items-center gap-2 text-sm text-primary hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestReleases.map((release) => (
              <Card key={release.id} className="group overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-0">
                  {release.image && (
                    <div className="aspect-square relative">
                      <Image
                        src={release.image.imageUrl}
                        alt={release.image.description}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={release.image.imageHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center bg-card">
                  <div>
                    <p className="font-semibold">{release.title}</p>
                    <p className="text-sm text-muted-foreground">{release.artist}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary"><Disc className="h-6 w-6" /></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Merch Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-7xl">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Merch</h2>
            <Link href="/store" className="flex items-center gap-2 text-sm text-primary hover:underline">
              Shop All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredMerch.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-card">
                <CardContent className="p-0">
                  {item.image && (
                    <div className="aspect-square relative">
                      <Image
                        src={item.image.imageUrl}
                        alt={item.image.description}
                        fill
                        className="object-cover"
                        data-ai-hint={item.image.imageHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.price}</p>
                  </div>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
