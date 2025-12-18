
'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, DownloadCloud, Play, Pause } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, use, useRef, useEffect } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const product = getProductBySlug(params.slug);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // States for audio preview
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= 30) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
      } else {
        setProgress((audio.currentTime / 30) * 100);
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
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    // To trigger a download, the link must not be on the same origin, or have the download attribute.
    // However, for cross-origin downloads, the server must provide the `Content-Disposition: attachment` header.
    // Firebase Storage does this automatically for its download URLs.
    link.target = '_blank'; // Fallback for safety
    link.rel = 'noopener noreferrer';
    link.download = filename; // Suggest a filename
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
            triggerDownload(product.downloadUrl, `${product.name}.mp3`);
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

        // Trigger the download automatically
        triggerDownload(product.downloadUrl, `${product.name}.mp3`);


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

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square">
          <Image
            src={product.image.imageUrl}
            alt={product.image.description}
            fill
            className="object-cover rounded-lg"
            data-ai-hint={product.image.imageHint}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col h-full">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg">{product.description}</p>
          
          {product.digital && product.downloadUrl && (
            <div className="mt-6 flex-grow">
                 <audio ref={audioRef} src={product.downloadUrl} className="hidden" />
                 <Card className="bg-card/50 p-4">
                    <div className="flex items-center gap-4">
                        <Button onClick={togglePlayPause} size="icon" variant="outline" className="flex-shrink-0">
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <div>
                            <p className="font-semibold text-sm">30-Second Preview</p>
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
                <Button size="lg" onClick={handlePurchase} className="w-full" disabled={isProcessingPurchase || isUserLoading}>
                  <DownloadCloud className="mr-2 h-5 w-5" />
                  {isProcessingPurchase ? 'Processing...' : 'Buy & Download'}
                </Button>
            ) : (
              <>
                <Button size="lg" onClick={handleAddToCart} className="w-full" disabled={addedToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addedToCart ? 'Added!' : 'Add to Cart'}
                </Button>
                {addedToCart && (
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link href="/cart">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      View Cart
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
          <h2 className="font-headline text-3xl font-bold text-center mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {relatedProducts.map((item) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                    <CardContent className="p-0 flex-grow">
                        <div className="aspect-square relative">
                        <Image
                            src={item.image.imageUrl}
                            alt={item.image.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={item.image.imageHint}
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between items-center bg-card">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-primary">{item.price}</p>
                    </div>
                    <Button size="sm" asChild>
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
