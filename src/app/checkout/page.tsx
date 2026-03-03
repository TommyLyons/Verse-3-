
'use client';

import React, { useState } from 'react';
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
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const router = useRouter();
  const { user } = useUser();
  const { cart, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const physicalItems = cart.filter(item => !item.digital);
  const total = physicalItems.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity, 0);
  const currencySymbol = physicalItems.length > 0 ? physicalItems[0].price.replace(/[0-9.,]/g, '') : '€';

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
    if (physicalItems.length === 0) {
        toast({ variant: 'destructive', title: 'Your cart has no physical items.'});
        return;
    }

    setIsSubmitting(true);

    try {
      const ordersCollection = collection(firestore!, 'orders');

      const orderData = {
        customerDetails: values,
        items: physicalItems.map(item => ({ 
            id: item.id, 
            name: item.name, 
            quantity: item.quantity, 
            price: item.price,
            size: item.size || null 
        })),
        total: `${currencySymbol}${total.toFixed(2)}`,
        submittedAt: serverTimestamp(),
        status: 'pending_stripe_payment',
        userId: user?.uid || 'guest'
      };

      await addDocumentNonBlocking(ordersCollection, orderData);
      
      // Simulation of Stripe Redirect
      toast({
        title: 'Connecting to Stripe...',
        description: "Redirecting you to our secure payment gateway.",
      });

      setTimeout(() => {
        setOrderComplete(true);
        clearCart();
      }, 2000);

    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'Failed to process checkout. Please check your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
        <div className="container py-12 md:py-24 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">Thank you for your purchase. A confirmation email will be sent shortly with your tracking details.</p>
            <Button onClick={() => router.push('/store')}>Continue Shopping</Button>
        </div>
    )
  }

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-12">
        <div>
            <Card className="max-w-xl mx-auto border-2">
                <CardHeader>
                <CardTitle className="text-3xl font-headline text-primary">Secure Checkout</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Payments processed securely via Stripe.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+44..." {...field} />
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
                            <FormLabel>Shipping Address</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Full address including postal code"
                                className="min-h-[100px]"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <Button type="submit" disabled={isSubmitting || physicalItems.length === 0} className="w-full h-14 text-lg font-bold bg-black text-chart-1 rounded-none hover:bg-black/90">
                        {isSubmitting ? 'Processing...' : `Pay ${currencySymbol}${total.toFixed(2)} with Stripe`}
                        <CreditCard className="ml-2 h-5 w-5" />
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
        <div>
            <h2 className="text-2xl font-headline mb-4 uppercase italic tracking-wider">Your Order</h2>
            <div className="space-y-4">
                {physicalItems.map(item => (
                    <Card key={item.cartId} className="flex items-center p-3 border-none bg-secondary/50">
                        <div className="relative w-16 h-16 mr-4">
                             <Image
                                src={('image' in item && item.image ? item.image.imageUrl : item.imageUrl) || ''}
                                alt={item.name}
                                fill
                                className="object-cover rounded-md"
                                sizes="64px"
                             />
                        </div>
                        <div className="flex-grow">
                            <p className="font-bold uppercase text-sm">{item.name}</p>
                            {item.size && <p className="text-xs text-muted-foreground uppercase">Size: {item.size}</p>}
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold">{currencySymbol}{(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}</p>
                    </Card>
                ))}
            </div>
             <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="flex justify-between font-bold text-xl italic uppercase">
                    <span>Total</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
