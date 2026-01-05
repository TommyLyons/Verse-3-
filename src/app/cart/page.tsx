
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (cartId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity)) {
      updateQuantity(cartId, quantity);
    }
  };

  const subtotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return total + price * item.quantity;
  }, 0);

  const hasPhysicalProduct = cart.some(item => !item.digital);

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
                <Card key={item.cartId} className="flex items-center p-4">
                  <div className="relative w-24 h-24 mr-4">
                    <Image
                      src={('image' in item && item.image ? item.image.imageUrl : item.imageUrl) || ''}
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
                    {item.size && (
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{item.price}</p>
                    <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.cartId)} className="text-muted-foreground hover:text-destructive mt-1 px-0 h-auto">
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
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
                {hasPhysicalProduct ? (
                   <Button asChild className='w-full'>
                       <Link href="/checkout">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Checkout
                       </Link>
                   </Button>
                ) : (
                    <p className='text-xs text-muted-foreground text-center'>Digital items are purchased individually from their product pages.</p>
                )}
                 
                  <Button variant="outline" onClick={clearCart} className="w-full">
                      Clear Cart
                  </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
