
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
import { BarChart, Terminal, FileAudio, FileImage, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

const MusicSubmissions = () => {
    const firestore = useFirestore();
    const submissionsQuery = useMemo(() => collection(firestore, 'demoSubmissions'), [firestore]);
    const { data: submissions, isLoading, error } = useCollection(submissionsQuery);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Submissions</AlertTitle>
                <AlertDescription>
                    There was a problem fetching the music submissions. Please check your connection and security rules.
                </AlertDescription>
            </Alert>
        )
    }

    if (!submissions || submissions.length === 0) {
        return <p className="text-muted-foreground">No demo submissions yet.</p>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Music Submissions</CardTitle>
                <CardDescription>Review demos and EPs uploaded by artists.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                    {submission.submittedAt ? format(submission.submittedAt.toDate(), 'PPP') : 'N/A'}
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
            </CardContent>
        </Card>
    )
}

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.string().regex(/^\$\d+(\.\d{2})?$/, "Price must be in the format $XX.XX."),
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
            price: '$',
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
        setIsSubmitting(true);
        try {
            const productsCollection = collection(firestore, 'products');

            const productData: any = { ...values };
            if (productData.sizes && typeof productData.sizes === 'string') {
                productData.sizes = productData.sizes.split(',').map((s: string) => s.trim().toUpperCase());
            } else {
                productData.sizes = [];
            }

            await addDocumentNonBlocking(productsCollection, productData);
            
            toast({
                title: 'Product Added!',
                description: `${values.name} has been added to the store.`,
            });
            onFinished();
            form.reset();
        } catch (error) {
            console.error("Error adding product:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add product. Please check console for details.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Verse3 Logo Hoodie" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl><Input placeholder="e.g., verse3-logo-hoodie" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="A short description of the product." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl><Input placeholder="$29.99" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="merch">Merch</SelectItem>
                                        <SelectItem value="music">Music</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Verse 3 Merch">Verse 3 Merch</SelectItem>
                                    <SelectItem value="Crude City">Crude City</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {productType === 'merch' && (
                     <FormField
                        control={form.control}
                        name="sizes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Available Sizes (comma-separated)</FormLabel>
                                <FormControl><Input placeholder="S, M, L, XL, XXL, XXXL, XXXXL" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input placeholder="https://picsum.photos/..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="revolutLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Revolut Link</FormLabel>
                            <FormControl><Input placeholder="https://revolut.me/..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                   {isSubmitting ? 'Adding Product...' : 'Add Product'}
                </Button>
            </form>
         </Form>
    )
}

const ProductManagement = () => {
    const firestore = useFirestore();
    const productsQuery = useMemo(() => collection(firestore, 'products'), [firestore]);
    const { data: products, isLoading, error } = useCollection(productsQuery);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>Add, edit, or remove store products.</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                         <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Product</DialogTitle>
                            <DialogDescription>Fill out the details for the new product.</DialogDescription>
                        </DialogHeader>
                        <AddProductForm onFinished={() => setIsAddDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading products...</p>}
                {error && <p className="text-destructive">Error loading products.</p>}
                {products && (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{product.brand}</Badge></TableCell>
                                    <TableCell>{product.type}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                 {products?.length === 0 && !isLoading && (
                    <p className="text-muted-foreground text-center py-4">No products found.</p>
                )}
            </CardContent>
        </Card>
    );
};


const SalesDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Dashboard</CardTitle>
                <CardDescription>Analytics for merchandise and record sales.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Sales Data Coming Soon</h3>
                    <p className="text-muted-foreground mt-2">
                        E-commerce functionality is not yet implemented. Once sales data is available, you will see it here.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user?.email !== adminEmail) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user?.email !== adminEmail) {
        return (
            <div className="container py-12 md:py-24 text-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-24">
            <div className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome, {user.displayName}.</p>
            </div>

            <div className="grid gap-8">
                <ProductManagement />
                <MusicSubmissions />
                <SalesDashboard />
            </div>
        </div>
    )
}

    
