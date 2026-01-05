
'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getRelatedProducts, type Product, getAllProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, DownloadCloud, Play, Pause } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // States for audio preview
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchProductData() {
        if (!firestore) return;
        setIsLoading(true);

        const allProducts = await getAllProducts(firestore);
        const fetchedProduct = allProducts.find(p => p.slug === slug);
        setProduct(fetchedProduct);

        if (fetchedProduct) {
            const related = getRelatedProducts(fetchedProduct, allProducts);
            setRelatedProducts(related);
        }
        setIsLoading(false);
    }

    if (slug) {
      fetchProductData();
    }
  }, [slug, firestore]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const duration = 30; // Limit preview to 30 seconds
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
  }, [product]); // Re-run effect if product changes

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
  
  if (isLoading || product === undefined) {
    return (
        <div className="container py-12 md:py-24">
            <BackButton />
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
  }

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

  const imageUrl = ('image' in product && product.image ? product.image.imageUrl : product.imageUrl) || '';
  const imageDescription = ('image' in product && product.image ? product.image.description : product.description) || '';
  const imageHint = ('image' in product && product.image ? product.image.imageHint : '') || '';


  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={imageHint}
          />
        </div>
        <div className="flex flex-col h-full">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg">{product.description}</p>
          
          {product.digital && product.downloadUrl && (
            <div className="mt-6 flex-grow">
                 <audio ref={audioRef} src={product.downloadUrl} className="hidden" preload="none" />
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
            {relatedProducts.map((item: Product) => {
              const relatedImageUrl = ('image' in item && item.image ? item.image.imageUrl : item.imageUrl) || '';
              const relatedImageDescription = ('image' in item && item.image ? item.image.description : item.description) || '';
              const relatedImageHint = ('image' in item && item.image ? item.image.imageHint : '') || '';
              
              return (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                        <Image
                            src={relatedImageUrl}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                            data-ai-hint={relatedImageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                        </Link>
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
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
