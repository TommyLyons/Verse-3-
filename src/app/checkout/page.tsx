
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
import { CreditCard, CheckCircle } from 'lucide-react';
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
  const revolutLinks = [...new Set(physicalItems.map(item => item.revolutLink))];

  const total = physicalItems.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity, 0);
  const currencySymbol = physicalItems.length > 0 ? physicalItems[0].price.replace(/[0-9.,]/g, '') : '$';

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
      const ordersCollection = collection(firestore, 'orders');

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
        status: 'pending_payment',
        userId: user?.uid || 'guest'
      };

      await addDocumentNonBlocking(ordersCollection, orderData);

      // Open all unique revolut links
      revolutLinks.forEach(link => {
        window.open(link, '_blank');
      });
      
      toast({
        title: 'Order Submitted!',
        description: "Please complete your payment in the new tabs. Your order has been received.",
      });

      setOrderComplete(true);
      clearCart();

    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem submitting your order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
        <div className="container py-12 md:py-24 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">Thank You For Your Order!</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">Your order details have been saved. Please complete the payment via the Revolut links that were opened.</p>
            <Button onClick={() => router.push('/store')}>Continue Shopping</Button>
        </div>
    )
  }

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-12">
        <div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                <CardTitle className="text-3xl font-headline text-primary">Checkout</CardTitle>
                <CardDescription>
                    Please provide your details for shipping and order confirmation.
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
                                <Input placeholder="Your full name" {...field} />
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
                                <Input placeholder="your@email.com" {...field} />
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
                                <Input placeholder="+44 123 456 7890" {...field} />
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
                            <FormLabel>Postal Address</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Street, City, Postal Code, Country"
                                className="resize-y"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <Button type="submit" disabled={isSubmitting || physicalItems.length === 0} className="w-full">
                        {isSubmitting ? 'Processing...' : `Proceed to Payment (${revolutLinks.length} item${revolutLinks.length > 1 ? 's' : ''})`}
                        <CreditCard className="ml-2 h-4 w-4" />
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
        <div>
            <h2 className="text-2xl font-headline mb-4">Your Order</h2>
            <div className="space-y-4">
                {physicalItems.map(item => (
                    <Card key={item.cartId} className="flex items-center p-3">
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
                            <p className="font-semibold">{item.name}</p>
                            {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{currencySymbol}{(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}</p>
                    </Card>
                ))}
            </div>
             <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
