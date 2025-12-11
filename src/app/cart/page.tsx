
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/products';
import { Product } from '@/lib/products';

function RecommendedProducts() {
  const { cart, addToCart } = useCart();
  const cartIds = cart.map(item => item.id);

  const hasMerch = cart.some(item => item.type === 'merch');
  const hasMusic = cart.some(item => item.type === 'music');

  const recommendedProducts: Product[] = [];

  // If there's merch but no music, recommend a music item
  if (hasMerch && !hasMusic) {
    const musicProduct = products.find(p => p.type === 'music' && !cartIds.includes(p.id));
    if (musicProduct) recommendedProducts.push(musicProduct);
  }

  // If there's music but no merch, recommend a merch item
  if (hasMusic && !hasMerch) {
    const merchProduct = products.find(p => p.type === 'merch' && !cartIds.includes(p.id));
    if (merchProduct) recommendedProducts.push(merchProduct);
  }

  // If both (or neither), recommend one of each if available
  if (recommendedProducts.length === 0) {
     const musicProduct = products.find(p => p.type === 'music' && !cartIds.includes(p.id));
     if (musicProduct) recommendedProducts.push(musicProduct);
     const merchProduct = products.find(p => p.type === 'merch' && !cartIds.includes(p.id));
     if (merchProduct) recommendedProducts.push(merchProduct);
  }
  
  // Ensure we don't have duplicates if the above logic overlaps
  const uniqueRecommendations = Array.from(new Set(recommendedProducts.map(p => p.id)))
    .map(id => recommendedProducts.find(p => p.id === id)!)
    .filter(Boolean);

  if (uniqueRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="font-headline text-3xl font-bold text-center mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {uniqueRecommendations.slice(0,2).map((item) => (
           <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                <CardContent className="p-0 flex-grow">
                    <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                        <Image
                            src={item.image.imageUrl}
                            alt={item.image.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={item.image.imageHint}
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                    </Link>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center bg-card">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-primary">{item.price}</p>
                    </div>
                    <Button size="sm" onClick={() => addToCart(item)}>
                        <ShoppingCart className="mr-2 h-4 w-4"/>
                        Add
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (productId: number, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity)) {
      updateQuantity(productId, quantity);
    }
  };

  const subtotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return total + price * item.quantity;
  }, 0);

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Your Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="mt-6">
            <Link href="/store">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-[2fr_1fr] gap-12 items-start">
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="flex items-center p-4">
                  <div className="relative w-24 h-24 mr-4">
                    <Image
                      src={item.image.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link href={`/store/${item.type}/${item.slug}`} className="font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.price}</p>
                    <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive mt-1 px-0 h-auto">
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16 h-9"
                    />
                  
                  </div>
                </Card>
              ))}
            </div>

            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                      Since each item is paid for individually via Revolut, please click "Buy Now" for each item below.
                  </p>
                {cart.map(item => (
                  <Button key={item.id} asChild className='w-full'>
                      <a href={item.revolutLink} target="_blank" rel="noopener noreferrer">Buy {item.name}</a>
                  </Button>
                ))}
                  <Button variant="outline" onClick={clearCart} className="w-full">
                      Clear Cart
                  </Button>
              </CardFooter>
            </Card>
          </div>
          <RecommendedProducts />
        </>
      )}
    </div>
  );
}
