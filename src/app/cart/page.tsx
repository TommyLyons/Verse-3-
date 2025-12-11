
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
      )}
    </div>
  );
}
