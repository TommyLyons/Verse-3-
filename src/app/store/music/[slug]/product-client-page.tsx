'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, DownloadCloud, Play, Pause, CreditCard } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};

export function ProductClientPage({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

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

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; 
    link.rel = 'noopener noreferrer';
    link.download = filename; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handlePurchase = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to purchase digital products.',
      });
      return;
    }
    if (!firestore || !product.downloadUrl) return;

    setIsProcessingPurchase(true);

    try {
        const purchasesCollection = collection(firestore, 'users', user.uid, 'purchasedProducts');
        
        const q = query(purchasesCollection, where('productId', '==', String(product.id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                title: 'Already Purchased',
                description: 'You already own this item. Triggering download now...',
            });
            if(product.downloadUrl) {
                triggerDownload(product.downloadUrl, `${product.name}.mp3`);
            }
            setIsProcessingPurchase(false);
            return;
        }

        const purchaseData = {
            productId: String(product.id),
            productName: product.name,
            downloadUrl: product.downloadUrl,
            purchasedAt: serverTimestamp(),
        };

        addDocumentNonBlocking(purchasesCollection, purchaseData);
        
        window.open(product.revolutLink, '_blank');

        toast({
            title: 'Purchase Processing!',
            description: 'Your download will begin automatically. Please complete the payment.',
        });

        if(product.downloadUrl) {
            triggerDownload(product.downloadUrl, `${product.name}.mp3`);
        }

    } catch (error) {
        console.error("Purchase error:", error);
        toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: 'There was an error processing your purchase. Please try again.',
        });
    } finally {
        setIsProcessingPurchase(false);
    }
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
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
          <p className="text-2xl font-semibold text-foreground mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg">{product.description}</p>
          
          {product.digital && product.downloadUrl && (
            <div className="mt-6 flex-grow">
                 <audio ref={audioRef} src={product.downloadUrl} className="hidden" preload="none" />
                 <Card className="bg-card/50 p-4 border-border">
                    <div className="flex items-center gap-4">
                        <Button onClick={togglePlayPause} size="icon" variant="outline" className="flex-shrink-0 border-primary text-primary hover:bg-primary/10">
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-foreground">30-Second Preview</p>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
          )}

          <div className="mt-8 w-full space-y-4">
            {product.digital ? (
                <Button size="lg" onClick={handlePurchase} className="w-full h-14 text-lg font-bold bg-chart-1 text-black hover:bg-chart-1/80 rounded-none uppercase italic" disabled={isProcessingPurchase || isUserLoading}>
                  <DownloadCloud className="mr-2 h-6 w-6" />
                  {isProcessingPurchase ? 'Processing...' : 'Buy Now'}
                </Button>
            ) : (
              <>
                <Button size="lg" onClick={handleAddToCart} className="w-full h-14 text-lg font-bold bg-black text-chart-1 hover:bg-black/90 rounded-none uppercase italic" disabled={addedToCart}>
                  <ShoppingCart className="mr-2 h-6 w-6" />
                  {addedToCart ? 'Added to Family!' : 'Add to Cart'}
                </Button>
                
                <Button size="lg" className="w-full h-14 text-lg font-bold bg-chart-1 text-black hover:bg-chart-1/80 rounded-none uppercase italic" asChild>
                    <a href={product.revolutLink} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="mr-2 h-6 w-6" />
                        Buy Now
                    </a>
                </Button>

                {addedToCart && (
                  <Button size="lg" variant="ghost" className="w-full h-14 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-none uppercase italic" asChild>
                    <Link href="/cart">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      View Cart & Checkout
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="font-headline text-3xl font-bold text-center mb-8 text-foreground">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {relatedProducts.map((item: Product) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col border-border bg-card">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                        <Image
                            src={item.imageUrl || ''}
                            alt={item.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        </Link>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between items-center bg-card">
                    <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.price}</p>
                    </div>
                    <Button size="sm" variant="default" className="bg-primary text-primary-foreground" asChild>
                        <Link href={`/store/${item.type}/${item.slug}`}>
                            <Eye className="mr-2 h-4 w-4"/>
                            View
                        </Link>
                    </Button>
                    </CardFooter>
                </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
