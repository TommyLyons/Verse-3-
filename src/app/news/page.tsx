
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
        title: "Northamptonshire's Own Verse Three Records Launches",
        date: "November 20, 2023",
        excerpt: "Verse Three Records, a new independent electronic label founded in Northamptonshire, has officially launched. The label aims to champion emotionally driven, forward-thinking music from emerging artists.",
        image: getImage('hero-studio'),
        slug: "/news/northants-telegraph-feature",
        externalLink: "https://www.northantstelegraph.co.uk/whats-on/arts-and-entertainment/northamptonshire-founded-record-label-verse-three-records-ltd-launches-with-debut-single-quiet-steps-5410222"
    }
]

export default function NewsPage() {
  return (
    <div className="container py-12 md:py-24">
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
                           <Link href={article.externalLink || article.slug} target={article.externalLink ? "_blank" : "_self"}>
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
