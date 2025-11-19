import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const newsArticles = [
    {
        title: "Verse3 Records Launches with Debut Single 'Quiet Steps'",
        date: "October 26, 2023",
        excerpt: "The label’s debut release, “Quiet Steps,” produced by Liddle and written by Doyle and Koumetio, sets the tone for what Verse Three Records represents — heartfelt storytelling, expressive electronic sound, and innovative collaboration.",
        image: getImage('news-debut'),
        slug: "/news/debut-release"
    },
    {
        title: "Studio Showcase: The Gear Behind The Sound",
        date: "October 15, 2023",
        excerpt: "A sneak peek into the state-of-the-art equipment at Verse3 Studios that helps artists craft their unique sound.",
        image: getImage('hero-studio'),
        slug: "/news/studio-showcase"
    }
]

export default function NewsPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-24">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-3">News & Events</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Stay up to date with the latest from Verse3.</p>
      </div>
      <div className="space-y-12">
        {newsArticles.map((article) => (
             <Card key={article.title} className="overflow-hidden md:flex md:flex-row">
                {article.image && (
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                        <Image
                            src={article.image.imageUrl}
                            alt={article.image.description}
                            fill
                            className="object-cover"
                            data-ai-hint={article.image.imageHint}
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                )}
                <div className="md:w-2/3">
                    <CardHeader>
                        <CardTitle className="text-2xl">{article.title}</CardTitle>
                        <CardDescription>{article.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                        <Button variant="link" asChild className="p-0 h-auto text-primary">
                           <Link href={article.slug}>
                                Read More <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                        </Button>
                    </CardContent>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
