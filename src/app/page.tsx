
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, Disc } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const heroImage = getImage('hero-studio');

const latestReleases = [
  { id: 1, title: 'Quiet Steps', artist: 'Lofty, Keith Doyle, Alvin Koumetio', image: getImage('album-art-1') },
  { id: 2, title: 'Echoes in Rain', artist: 'Synthwave Kid', image: getImage('album-art-2') },
  { id: 3, title: 'City Lights', artist: 'Urban Explorer', image: getImage('album-art-3') },
  { id: 4, title: 'Future Funk', artist: 'Groove Master', image: getImage('album-art-1') },
];

const featuredMerch = [
    { id: 1, name: 'Verse3 Logo Hoodie', price: '$59.99', image: getImage('merch-hoodie') },
    { id: 2, name: 'DJ Lofty - Midnight Drive Vinyl', price: '$29.99', image: getImage('merch-vinyl') },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center text-white">
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
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-primary">
            Verse3 Records
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            A UK-based independent electronic label championing emotionally driven, forward-thinking music. Founded on friendship, powered by passion.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/booking">Book a Session</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/music">Explore Music</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-16 md:py-24 bg-card">
          <div className="container max-w-4xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Our Vision</h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                  Our mission is to champion emerging talent and deliver emotionally powerful records that resonate. We believe that music is most powerful when crafted from real stories, and we stand as a testament to the power of collaboration and artistic integrity.
              </p>
          </div>
      </section>

      {/* Latest Releases Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-7xl">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">Latest Releases</h2>
            <Link href="/music" className="flex items-center gap-2 text-sm text-primary hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {latestReleases.map((release) => (
                   <CarouselItem key={release.id} className="sm:basis-1/2 lg:basis-1/4">
                      <Card className="group overflow-hidden h-full flex flex-col">
                        <CardContent className="p-0 flex-grow">
                          {release.image && (
                            <div className="aspect-square relative">
                              <Image
                                src={release.image.imageUrl}
                                alt={release.image.description}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                data-ai-hint={release.image.imageHint}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                   </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:inline-flex" />
              <CarouselNext className="hidden lg:inline-flex" />
            </Carousel>
        </div>
      </section>

      {/* Who Are The 3 Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-4xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Who Are The 3</h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Verse Three Records is a UK-based independent electronic label founded by three lifelong friends — Keith Doyle, Steve Liddle (Lofty), and Alvin Koumetio. United by more than 15 years of friendship and a deep-rooted passion for music, the trio created Verse Three to build a community grounded in creativity and shared passion.
            </p>
        </div>
      </section>

      {/* Featured Merch Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">Featured Merch</h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">Rep the label with our exclusive gear.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {featuredMerch.map((item) => (
              <Card key={item.id} className="overflow-hidden group relative">
                <CardContent className="p-0">
                  {item.image && (
                    <div className="aspect-video relative">
                      <Image
                        src={item.image.imageUrl}
                        alt={item.image.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={item.image.imageHint}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center bg-card/80 backdrop-blur-sm absolute bottom-0 w-full">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-primary">{item.price}</p>
                  </div>
                  <Button className="group-hover:scale-110 transition-transform">
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
                <Link href="/store">Shop All Merch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
