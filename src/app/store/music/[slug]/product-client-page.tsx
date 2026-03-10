'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, Play, Pause, CreditCard, Music, Headphones } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};

export function ProductClientPage({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const { addToCart, clearCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  const tracks = product.tracks || [];
  const currentAudioUrl = product.isAlbum ? tracks[currentTrackIndex]?.audioUrl : product.downloadUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const duration = 30;
      if (audio.duration && audio.currentTime >= duration) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
      } else {
        setProgress((audio.currentTime / duration) * 100);
      }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [product, currentTrackIndex]);

  const togglePlayPause = (index?: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (index !== undefined && index !== currentTrackIndex) {
        setCurrentTrackIndex(index);
        audio.load();
        setTimeout(() => {
            audio.play().catch(console.error);
            setIsPlaying(true);
        }, 100);
        return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart(product);
    router.push('/checkout');
  };

  const imageUrl = product.imageUrl || '';
  const imageDescription = product.description || '';

  const relatedProducts = getRelatedProducts(product, allProducts);

  return (
    <div className="container py-12 md:py-24 bg-background">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="relative aspect-square rounded-none overflow-hidden border-2 border-black/5 bg-black/5 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-contain p-4 transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <Badge className="absolute top-6 left-6 bg-black text-chart-1 font-bold uppercase italic rounded-none px-4 py-1 text-xs">
            {product.isAlbum ? 'Album / EP' : 'Single'}
          </Badge>
        </div>
        
        <div className="flex flex-col h-full">
          <div className="space-y-4">
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground leading-none uppercase italic tracking-tighter">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-chart-1 bg-black px-4 py-1 italic">{product.price}</p>
              {product.digital && (
                 <Badge variant="outline" className="border-black/20 text-muted-foreground font-bold uppercase italic">Digital Release</Badge>
              )}
            </div>
          </div>
          
          <div className="mt-8 border-t-2 border-black/10 pt-6">
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">{product.description}</p>
          </div>
          
          <div className="mt-8 flex-grow">
               <audio ref={audioRef} src={currentAudioUrl} className="hidden" preload="none" />
               
               {product.digital && (
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Headphones className="h-4 w-4 text-chart-1" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">30-Second Previews</span>
                    </div>
                    
                    {product.isAlbum && tracks.length > 0 ? (
                        <div className="space-y-2 border-2 border-black/5 bg-black/[0.02]">
                            {tracks.map((track, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 border-b last:border-0 hover:bg-black/5 transition-colors ${currentTrackIndex === index && isPlaying ? 'bg-black/5' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            onClick={() => togglePlayPause(index)} 
                                            size="icon" 
                                            variant="ghost" 
                                            className={`h-8 w-8 rounded-none border border-black/10 ${currentTrackIndex === index && isPlaying ? 'bg-chart-1 text-black border-transparent' : ''}`}
                                        >
                                            {currentTrackIndex === index && isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                        </Button>
                                        <span className="text-sm font-bold uppercase italic">{track.title}</span>
                                    </div>
                                    {currentTrackIndex === index && isPlaying && (
                                        <div className="w-20 bg-muted h-1 overflow-hidden">
                                            <div className="bg-chart-1 h-full transition-all" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-black/5 p-4 border-none rounded-none">
                            <div className="flex items-center gap-4">
                                <Button onClick={() => togglePlayPause()} size="icon" className="bg-black text-chart-1 hover:bg-black/80 rounded-none h-12 w-12">
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </Button>
                                <div className="flex-grow">
                                    <p className="font-bold text-xs uppercase tracking-widest text-foreground">Track Preview</p>
                                    <div className="w-full bg-muted rounded-none h-1 mt-1 overflow-hidden">
                                        <div className="bg-chart-1 h-1 transition-all" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                 </div>
               )}
          </div>

          <div className="mt-8 w-full space-y-4">
            <Button 
                size="lg" 
                onClick={handleBuyNow} 
                className="w-full h-16 text-xl font-bold bg-chart-1 text-black hover:bg-black hover:text-chart-1 rounded-none uppercase italic transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
                <CreditCard className="mr-3 h-6 w-6" />
                Buy Now Instantly
            </Button>
            
            <Button size="lg" variant="outline" onClick={handleAddToCart} className="w-full h-16 text-xl font-bold border-2 border-black rounded-none uppercase italic transition-all hover:bg-black/5" disabled={addedToCart}>
                <ShoppingCart className="mr-3 h-6 w-6" />
                {addedToCart ? 'Added to Family!' : 'Add to Cart'}
            </Button>

            {addedToCart && (
              <Button size="lg" variant="ghost" className="w-full h-14 font-bold bg-black text-chart-1 hover:bg-black/90 rounded-none uppercase italic" asChild>
                <Link href="/cart">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  View Cart & Checkout
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t-2 border-black/10 pt-16">
          <div className="text-center mb-16">
            <h2 className="font-headline text-5xl font-bold text-foreground uppercase italic tracking-tighter">You Might <span className="text-chart-1">Also Like</span></h2>
            <div className="h-1 w-24 bg-chart-1 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {relatedProducts.map((item: Product) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col border-none bg-transparent">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-none overflow-hidden border-2 border-black/5">
                        <Image
                            src={item.imageUrl || ''}
                            alt={item.name}
                            fill
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        </Link>
                    </CardContent>
                    <div className="mt-4 flex justify-between items-center px-1">
                        <div>
                            <p className="font-bold text-foreground uppercase text-lg leading-tight">{item.name}</p>
                            <p className="text-xl font-bold text-chart-1 bg-black px-3 py-1 inline-block italic mt-1">{item.price}</p>
                        </div>
                        <Button size="icon" variant="default" className="bg-black text-chart-1 hover:bg-chart-1 hover:text-black transition-colors rounded-none h-12 w-12" asChild>
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                <Eye className="h-6 w-6"/>
                            </Link>
                        </Button>
                    </div>
                </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
