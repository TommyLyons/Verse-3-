
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, Play, Pause, CreditCard } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [progress, setProgress] = useState(0);

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
  }, [product]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
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
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col h-full">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground uppercase italic">{product.name}</h1>
          <p className="text-2xl font-bold text-primary italic mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{product.description}</p>
          
          {product.digital && product.downloadUrl && (
            <div className="mt-6 flex-grow">
                 <audio ref={audioRef} src={product.downloadUrl} className="hidden" preload="none" />
                 <Card className="bg-card/50 p-4 border-2 border-black/5 rounded-none">
                    <div className="flex items-center gap-4">
                        <Button onClick={togglePlayPause} size="icon" variant="outline" className="flex-shrink-0 border-primary text-primary hover:bg-primary/10 rounded-none">
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <div className="flex-grow">
                            <p className="font-bold text-xs uppercase tracking-widest text-foreground">30-Second Preview</p>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                                <div className="bg-chart-1 h-1.5 transition-all" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
          )}

          <div className="mt-8 w-full space-y-4">
            <Button size="lg" onClick={handleBuyNow} className="w-full h-14 text-lg font-bold bg-chart-1 text-black hover:bg-chart-1/80 rounded-none uppercase italic">
                <CreditCard className="mr-2 h-6 w-6" />
                Buy Now Instantly
            </Button>
            
            {!product.digital && (
              <Button size="lg" variant="outline" onClick={handleAddToCart} className="w-full h-14 text-lg font-bold border-2 border-black rounded-none uppercase italic" disabled={addedToCart}>
                <ShoppingCart className="mr-2 h-6 w-6" />
                {addedToCart ? 'Added to Family!' : 'Add to Cart'}
              </Button>
            )}

            {addedToCart && (
              <Button size="lg" variant="ghost" className="w-full h-14 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-none uppercase italic" asChild>
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
        <div className="mt-24 border-t pt-16">
          <h2 className="font-headline text-4xl font-bold text-center mb-12 text-foreground uppercase italic tracking-tighter">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {relatedProducts.map((item: Product) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col border-none bg-transparent">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-xl overflow-hidden">
                        <Image
                            src={item.imageUrl || ''}
                            alt={item.name}
                            fill
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        </Link>
                    </CardContent>
                    <div className="p-4 flex justify-between items-center bg-card mt-2">
                    <div>
                        <p className="font-bold text-foreground uppercase text-sm leading-tight">{item.name}</p>
                        <p className="text-sm font-bold text-primary italic">{item.price}</p>
                    </div>
                    <Button size="sm" variant="default" className="bg-black text-chart-1 font-bold" asChild>
                        <Link href={`/store/${item.type}/${item.slug}`}>
                            <Eye className="h-4 w-4"/>
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
