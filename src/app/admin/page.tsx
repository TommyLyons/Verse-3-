'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Terminal, FileAudio, FileImage, PlusCircle, Mail, Users } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const adminEmail = 'verse3records@gmail.com';
const adminUid = 'I47i5ZR5aAPOMVgQnTYQm2UB3Ym2';

const NewsletterSubscribers = () => {
    const firestore = useFirestore();
    const subscribersQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'newsletterSubscriptions');
    }, [firestore]);
    const { data: subscribers, isLoading, error } = useCollection(subscribersQuery);

    if (isLoading) return <Skeleton className="h-64 w-full" />;

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Access Error</AlertTitle>
                <AlertDescription>
                    {error.message || "You do not have permission to view the subscriber list."}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="border-2 border-chart-1/20">
            <CardHeader className="bg-black text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 font-headline text-2xl uppercase italic">
                    <Users className="h-6 w-6 text-chart-1" />
                    V3 Family Subscribers
                </CardTitle>
                <CardDescription className="text-chart-1/60">
                    Email list of users who joined via the newsletter signup.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {!subscribers || subscribers.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No subscribers yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-foreground">Email Address</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right text-foreground">Joined On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscribers.map((sub: any) => (
                                <TableRow key={sub.id} className="hover:bg-chart-1/5 transition-colors">
                                    <TableCell className="font-medium text-lg">{sub.email}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {sub.subscribedAt?.toDate ? format(sub.subscribedAt.toDate(), 'PPP p') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

const MusicSubmissions = () => {
    const firestore = useFirestore();
    const submissionsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'demoSubmissions');
    }, [firestore]);
    const { data: submissions, isLoading, error } = useCollection(submissionsQuery);

    if (isLoading) return <Skeleton className="h-64 w-full" />;

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Submissions</AlertTitle>
                <AlertDescription>There was a problem fetching the music submissions.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl uppercase italic">Music Submissions</CardTitle>
                <CardDescription>Review demos and EPs uploaded by artists.</CardDescription>
            </CardHeader>
            <CardContent>
                {!submissions || submissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No demo submissions yet.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Artist</TableHead>
                                <TableHead>Track Title</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((submission: any) => (
                                <TableRow key={submission.id}>
                                    <TableCell>
                                        <div className="font-medium">{submission.artistName}</div>
                                        <div className="text-sm text-muted-foreground">{submission.artistEmail}</div>
                                    </TableCell>
                                    <TableCell>{submission.trackTitle}</TableCell>
                                    <TableCell>
                                        {submission.submittedAt?.toDate ? format(submission.submittedAt.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {submission.audioUrl && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={submission.audioUrl} target="_blank" rel="noopener noreferrer">
                                                    <FileAudio className="mr-2 h-4 w-4" /> Audio
                                                </a>
                                            </Button>
                                        )}
                                        {submission.imageUrl && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={submission.imageUrl} target="_blank" rel="noopener noreferrer">
                                                    <FileImage className="mr-2 h-4 w-4" /> Art
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.string().regex(/^[\$\€]\d+(\.\d{2})?$/, "Price must be in the format $XX.XX or €XX.XX."),
  revolutLink: z.string().url("Please enter a valid Revolut purchase link."),
  type: z.enum(['merch', 'music']),
  brand: z.enum(['Verse 3 Merch', 'Crude City']),
  slug: z.string().min(3, "Slug is required.").refine(s => !s.includes(' '), "Slug cannot contain spaces."),
  imageUrl: z.string().url("Please enter a valid image URL."),
  digital: z.boolean().optional(),
  downloadUrl: z.string().optional(),
  sizes: z.string().optional(),
});
type ProductFormValues = z.infer<typeof productFormSchema>;

const AddProductForm = ({ onFinished }: { onFinished: () => void }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: '€',
            revolutLink: 'https://revolut.me/',
            type: 'merch',
            brand: 'Verse 3 Merch',
            slug: '',
            imageUrl: '',
            digital: false,
            downloadUrl: '',
            sizes: ''
        },
    });

    const productType = form.watch('type');

    const onSubmit = async (values: ProductFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const productsCollection = collection(firestore, 'products');
            const productData: any = { ...values };
            if (productData.sizes && typeof productData.sizes === 'string') {
                productData.sizes = productData.sizes.split(',').map((s: string) => s.trim().toUpperCase());
            } else {
                productData.sizes = [];
            }
            addDocumentNonBlocking(productsCollection, productData);
            toast({ title: 'Product Added!', description: `${values.name} added to store.` });
            onFinished();
            form.reset();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add product.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Hoodie" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="e.g., hoodie" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input placeholder="€35.00" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="merch">Merch</SelectItem><SelectItem value="music">Music</SelectItem></SelectContent></Select>
                        <FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Verse 3 Merch">Verse 3 Merch</SelectItem><SelectItem value="Crude City">Crude City</SelectItem></SelectContent></Select>
                    <FormMessage /></FormItem>
                )} />
                {productType === 'merch' && (
                     <FormField control={form.control} name="sizes" render={({ field }) => (
                        <FormItem><FormLabel>Sizes (S, M, L...)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                 <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="revolutLink" render={({ field }) => (
                    <FormItem><FormLabel>Revolut Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                   {isSubmitting ? 'Adding...' : 'Add Product'}
                </Button>
            </form>
         </Form>
    );
};

const ProductManagement = () => {
    const firestore = useFirestore();
    const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: products, isLoading, error } = useCollection(productsQuery);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle className="font-headline text-2xl uppercase italic">Product Management</CardTitle></div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader><AddProductForm onFinished={() => setIsAddDialogOpen(false)} /></DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading...</p>}
                {error && <p className="text-destructive">Error loading products.</p>}
                {products && products.length > 0 && (
                     <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead>Type</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {products.map((p: any) => (
                                <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell><Badge variant="secondary">{p.brand}</Badge></TableCell><TableCell>{p.type}</TableCell><TableCell>{p.price}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

const SalesDashboard = () => (
    <Card><CardHeader><CardTitle className="font-headline text-2xl uppercase italic">Sales Dashboard</CardTitle></CardHeader>
        <CardContent><div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg"><BarChart className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-xl font-semibold">Sales Data Soon</h3></div></CardContent>
    </Card>
);

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const isAdmin = user?.email === adminEmail || user?.uid === adminUid;

    useEffect(() => {
        if (!isUserLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, isUserLoading, router]);

    if (isUserLoading || !isAdmin) {
        return <div className="container py-24 text-center"><p>Authorizing...</p></div>;
    }

    return (
        <div className="container py-12 md:py-24">
            <div className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-tighter italic">Admin <span className="text-chart-1">Control</span></h1>
                <p className="text-muted-foreground mt-2">Authenticated as: <span className="font-bold text-foreground">{user?.displayName || adminEmail}</span></p>
            </div>
            <div className="grid gap-8">
                <NewsletterSubscribers />
                <ProductManagement />
                <MusicSubmissions />
                <SalesDashboard />
            </div>
        </div>
    );
}
