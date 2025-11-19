import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, Disc, CheckCircle, ShoppingCart } from 'lucide-react';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const heroImage = getImage('hero-studio');

const latestReleases = [
  { id: 1, title: 'Quiet Steps', artist: 'Lofty, Keith Doyle, Alvin Koumetio', image: getImage('album-art-1') },
  { id: 2, title: 'Echoes in Rain', artist: 'Synthwave Kid', image: getImage('album-art-2') },
  { id: 3, title: 'City Lights', artist: 'Urban Explorer', image: getImage('album-art-3') },
];

const featuredMerch = [
  { id: 1, name: 'Verse3 Logo Hoodie', price: '$59.99', image: getImage('merch-hoodie') },
  { id: 2, name: 'DJ Lofty - Midnight Drive Vinyl', price: '$29.99', image: getImage('merch-vinyl') },
];

const features = [
  {
    icon: CheckCircle,
    title: 'Champion Talent',
    description: 'Championing emerging and established talent across the electronic spectrum.',
  },
  {
    icon: CheckCircle,
    title: 'Deliver Powerful Records',
    description: 'Delivering emotionally powerful records shaped by authenticity.',
  },
  {
    icon: CheckCircle,
    title: 'Build Community',
    description: 'Building a community-driven platform grounded in creativity, friendship, and shared passion.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center text-center text-white">
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
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
             <span className="text-primary">Verse3 Records</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            A UK-based independent electronic label championing emotionally driven, forward-thinking music. Founded on friendship, powered by passion.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/booking">Book a Session</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
              <Link href="/music">Explore Music</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
       <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4 text-chart-2">Our Story</h2>
            <p className="text-muted-foreground md:text-lg">
             Verse Three Records is a UK-based independent electronic label founded by three lifelong friends — Keith Doyle, Steve Liddle (Lofty), and Alvin Koumetio. United by more than 15 years of friendship and a deep-rooted passion for music, the trio created Verse Three Records to champion emotionally driven, forward-thinking electronic music. From their roots as childhood friends to their evolution into founders of a forward-thinking label, Verse Three Records stands as a testament to collaboration, emotional expression, and the belief that music is most powerful when crafted from real stories.
            </p>
        </div>
       </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-7xl">
         <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-chart-3">The Verse Three Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Releases Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-7xl">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-chart-4">Latest Releases</h2>
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
                    <p className="font-semibold text-lg">{release.title}</p>
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
      <section className="py-16 md:py-24 bg-black/50">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary">Featured Merch</h2>
             <Button variant="link" asChild className="mt-2 text-base">
                <Link href="/store">
                    Shop All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
            {featuredMerch.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-background group border-2 border-primary/20 hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30">
                <CardContent className="p-0 relative">
                  {item.image && (
                    <div className="aspect-square relative">
                      <Image
                        src={item.image.imageUrl}
                        alt={item.image.description}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        data-ai-hint={item.image.imageHint}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-6 flex justify-between items-center">
                  <div>
                    <p className="font-headline text-2xl font-bold">{item.name}</p>
                    <p className="text-lg text-primary">{item.price}</p>
                  </div>
                  <Button className="group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
