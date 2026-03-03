'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/ui/back-button';
import { CreditCard, ShieldCheck, ShoppingBag, RefreshCcw, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { fetchClientSecret } from '@/app/actions/checkout';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// Your Stripe Publishable Key
const STRIPE_PUBLISHABLE_KEY = "pk_live_51T6sTyB9Rp46v45XkIzRrWnjQQMZXFzErkzoeTK2h8VOGT7uP0PmfTBrVnRFPwQ5vFaQqrdLXJcuXpKhO29Zl8Iq004hGYRp53";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const checkoutFormSchema = z.object({
  name: z.string().min(2, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  phone: z.string().min(5, { message: 'A valid phone number is required.' }),
  address: z.string().min(10, { message: 'A full postal address is required.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const { cart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripe, setShowStripe] = useState(false);

  const total = cart.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity, 0);
  const currencySymbol = cart.length > 0 ? cart[0].price.replace(/[0-9.,]/g, '') : '£';

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    if (cart.length === 0) {
        toast({ variant: 'destructive', title: 'Your cart is empty.'});
        return;
    }

    setIsSubmitting(true);

    try {
      // 1. Record the order in Firestore
      if (firestore) {
        const ordersCollection = collection(firestore, 'orders');
        const orderData = {
          customerDetails: values,
          items: cart.map(item => ({ 
              id: item.id, 
              name: item.name, 
              quantity: item.quantity, 
              price: item.price,
              size: item.size || null 
          })),
          total: `${currencySymbol}${total.toFixed(2)}`,
          submittedAt: serverTimestamp(),
          status: 'awaiting_payment',
          userId: user?.uid || 'guest'
        };
        addDocumentNonBlocking(ordersCollection, orderData);
      }
      
      // 2. Show the Stripe Embedded UI
      setShowStripe(true);
      toast({
        title: 'Initializing Secure Payment',
        description: "Preparing your checkout session...",
      });
    } catch (error: any) {
      console.error('Order recording error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: error.message || 'Failed to process checkout. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wrapped in useCallback for the EmbeddedCheckoutProvider
  const getClientSecret = useCallback(() => {
    return fetchClientSecret(cart);
  }, [cart]);

  if (showStripe) {
    return (
      <div className="container py-12 md:py-24 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setShowStripe(false)} className="mb-8 font-headline uppercase italic">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to details
        </Button>
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-none">
          <CardHeader className="bg-black text-white p-8">
            <CardTitle className="font-headline text-3xl italic uppercase tracking-wider text-chart-1">Secure Checkout</CardTitle>
            <CardDescription className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Powering your payments with Stripe</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[400px]">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret: getClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle className="text-4xl md:text-5xl font-headline text-primary uppercase italic tracking-tighter">Secure <span className="text-chart-1">Checkout</span></CardTitle>
                    <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                        <ShieldCheck className="h-4 w-4 text-chart-1" />
                        Enter your shipping details
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" className="h-12 border-2 rounded-none border-black/10 focus-visible:ring-black" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="john@example.com" className="h-12 border-2 rounded-none border-black/10 focus-visible:ring-black" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+44..." className="h-12 border-2 rounded-none border-black/10 focus-visible:ring-black" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Shipping Address</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Full address including postal code"
                                className="min-h-[120px] border-2 rounded-none border-black/10 focus-visible:ring-black resize-none"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <Button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full h-16 text-xl font-headline uppercase italic tracking-wider bg-black text-chart-1 rounded-none hover:bg-black/90">
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <RefreshCcw className="h-5 w-5 animate-spin" />
                            Initializing...
                          </div>
                        ) : (
                          <>
                            Proceed to Payment
                            <CreditCard className="ml-3 h-6 w-6" />
                          </>
                        )}
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
        
        <div className="space-y-6">
            <h2 className="text-2xl font-headline uppercase italic tracking-wider border-b-2 border-black pb-2">Your Order</h2>
            <div className="space-y-4">
                {cart.map(item => (
                    <div key={item.cartId} className="flex items-center gap-4 py-2">
                        <div className="relative w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                             <Image
                                src={('image' in item && item.image ? item.image.imageUrl : item.imageUrl) || ''}
                                alt={item.name}
                                fill
                                className="object-contain p-2"
                                sizes="80px"
                             />
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-bold uppercase text-xs truncate leading-tight">{item.name}</p>
                            {item.size && <p className="text-[10px] text-muted-foreground uppercase font-bold">Size: {item.size}</p>}
                            <p className="text-[10px] text-muted-foreground font-bold">Qty: {item.quantity}</p>
                            <p className="font-bold text-sm mt-1">{currencySymbol}{(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-8 pt-6 border-t-2 border-black space-y-4">
                <div className="flex justify-between text-muted-foreground font-bold uppercase text-xs">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-bold uppercase text-xs">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-headline text-3xl italic uppercase pt-2">
                    <span>Total</span>
                    <span className="text-chart-1 bg-black px-2">{currencySymbol}{total.toFixed(2)}</span>
                </div>
            </div>
            <div className="pt-8">
                <div className="bg-secondary/50 p-4 border-l-4 border-chart-1 flex items-start gap-3">
                    <ShoppingBag className="h-5 w-5 text-black mt-1" />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-black">V3 Family Guarantee</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-1">Premium quality gear, processed and shipped with care by Verse3 Records.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
