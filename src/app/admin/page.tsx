'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, useFirebaseApp } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Terminal, FileAudio, FileImage, PlusCircle, Mail, Users, RefreshCcw, ExternalLink, Settings2, Package, Music, PieChart, UploadCloud, Disc, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from 'next/image';

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
                    There was a problem accessing the subscriber list.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="pt-0">
                {!subscribers || subscribers.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No subscribers yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Email Address</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right">Joined On</TableHead>
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
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="pt-0">
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
  price: z.string().regex(/^[\$\€\£]\d+(\.\d{2})?$/, "Price format must be €XX.XX or £XX.XX"),
  type: z.enum(['merch', 'music']),
  brand: z.enum(['Verse 3 Merch', 'Crude City']),
  slug: z.string().min(3, "Slug is required.").refine(s => !s.includes(' '), "Slug cannot contain spaces."),
  imageUrl: z.string().optional(),
  digital: z.boolean().optional(),
  isAlbum: z.boolean().optional(),
  tracks: z.array(z.object({
      title: z.string().min(1, "Track title is required"),
      audioFile: z.any().optional(),
      audioUrl: z.string().optional()
  })).optional(),
  downloadUrl: z.string().optional(),
  sizes: z.string().optional(),
  audioFile: z.any().optional(),
  imageFile: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const AddProductForm = ({ onFinished, initialType }: { onFinished: () => void, initialType: 'merch' | 'music' }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const firebaseApp = useFirebaseApp();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [currentStep, setCurrentStep] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: initialType === 'merch' ? '£25.00' : '£2.00',
            type: initialType,
            brand: 'Verse 3 Merch',
            slug: '',
            imageUrl: '',
            digital: initialType === 'music',
            isAlbum: false,
            downloadUrl: '',
            sizes: '',
            tracks: []
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tracks",
    });

    const productType = form.watch('type');
    const isAlbum = form.watch('isAlbum');

    const handleFileUpload = (file: File, path: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("No file selected"));
            if (!firebaseApp) return reject(new Error("Firebase not initialized"));
            
            const storage = getStorage(firebaseApp);
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = snapshot.totalBytes > 0 
                        ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
                        : 0;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Upload error detail:', error);
                    reject(new Error(`Upload failed: ${error.message}`));
                },
                async () => {
                    try {
                      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                      resolve(downloadURL);
                    } catch (e: any) {
                      reject(new Error(`URL retrieval failed: ${e.message}`));
                    }
                }
            );
        });
    };

    const handleInstantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCurrentStep('Uploading Artwork...');
        setUploadProgress(0);
        
        try {
            const imgPath = `products/images/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const url = await handleFileUpload(file, imgPath);
            setUploadedImageUrl(url);
            toast({ title: 'Artwork Uploaded', description: 'Cover image is ready.' });
        } catch (error: any) {
            console.error('Instant upload error:', error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setUploadProgress(null);
            setCurrentStep('');
        }
    };

    const onSubmit = async (values: ProductFormValues) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database connection not ready.' });
            return;
        }
        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            let finalImageUrl = uploadedImageUrl || values.imageUrl || '';
            let finalDownloadUrl = values.downloadUrl || '';
            const finalTracks: any[] = [];

            // 1. Handle Audio Upload for Single
            if (values.type === 'music' && !values.isAlbum && values.audioFile && values.audioFile.length > 0) {
                setCurrentStep('Uploading Audio...');
                const audFile = values.audioFile[0] as File;
                const audPath = `products/audio/${Date.now()}_${audFile.name.replace(/\s+/g, '_')}`;
                finalDownloadUrl = await handleFileUpload(audFile, audPath);
            }

            // 2. Handle Album Tracks Upload
            if (values.type === 'music' && values.isAlbum && values.tracks && values.tracks.length > 0) {
                for (let i = 0; i < values.tracks.length; i++) {
                    const track = values.tracks[i];
                    if (track.audioFile && track.audioFile.length > 0) {
                        setCurrentStep(`Uploading Track ${i + 1}/${values.tracks.length}: ${track.title}...`);
                        const tFile = track.audioFile[0] as File;
                        const tPath = `products/audio/${Date.now()}_${tFile.name.replace(/\s+/g, '_')}`;
                        const tUrl = await handleFileUpload(tFile, tPath);
                        finalTracks.push({ title: track.title, audioUrl: tUrl });
                    }
                }
            }

            // 3. Build sanitized object
            const productData = {
                name: values.name,
                slug: values.slug,
                description: values.description,
                price: values.price,
                type: values.type,
                brand: values.brand,
                imageUrl: finalImageUrl,
                downloadUrl: finalDownloadUrl,
                digital: !!values.digital,
                isAlbum: !!values.isAlbum,
                tracks: finalTracks,
                revolutLink: 'https://checkout.stripe.com/',
                createdAt: serverTimestamp(),
                sizes: values.sizes ? values.sizes.split(',').map(s => s.trim().toUpperCase()) : []
            };

            const productsCollection = collection(firestore, 'products');
            addDocumentNonBlocking(productsCollection, productData);
            
            toast({ title: 'Success!', description: `${values.name} published.` });
            onFinished();
            form.reset();
            setUploadedImageUrl('');
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast({ 
              variant: 'destructive', 
              title: 'Publish Failed', 
              description: error.message || 'There was a problem processing your library upload.' 
            });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
            setCurrentStep('');
        }
    };

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{productType === 'music' ? (isAlbum ? 'Album Title' : 'Single Title') : 'Product Name'}</FormLabel>
                        <FormControl>
                            <Input placeholder={productType === 'music' ? "e.g., Quiet Steps" : "e.g., Hoodie"} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="slug" render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Slug</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., quiet-steps" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="brand" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Brand / Label</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Verse 3 Merch">Verse 3</SelectItem>
                                    <SelectItem value="Crude City">Crude City</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input placeholder="£2.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    {productType === 'music' && (
                        <FormField control={form.control} name="isAlbum" render={({ field }) => (
                            <FormItem className="flex flex-col justify-end space-y-2">
                                <FormLabel className='text-xs font-bold uppercase'>Album/EP Mode</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-2 h-10">
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        <span className="text-xs font-medium">{field.value ? 'Album/EP' : 'Single Track'}</span>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )} />
                    )}
                </div>

                {productType === 'merch' && (
                     <FormField control={form.control} name="sizes" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sizes (e.g. S, M, L, XL)</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>Comma separated list.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                )}

                <div className="border-t pt-4 space-y-4">
                    <div className="space-y-2">
                        <FormLabel>{productType === 'music' ? 'Cover Art' : 'Product Photo'}</FormLabel>
                        <div className="flex items-center gap-4">
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleInstantImageUpload} 
                                className="flex-grow"
                            />
                            {uploadedImageUrl && (
                                <div className="h-10 w-10 relative border rounded overflow-hidden flex-shrink-0">
                                    <Image src={uploadedImageUrl} alt="Preview" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {uploadedImageUrl && <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Image Uploaded Successfully</p>}
                    </div>

                    {productType === 'music' && !isAlbum && (
                        <FormField control={form.control} name="audioFile" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Audio File (MP3/WAV)</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="audio/*" onChange={(e) => field.onChange(e.target.files)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        ) } />
                    )}

                    {productType === 'music' && isAlbum && (
                        <div className="space-y-4">
                            <FormLabel className="flex justify-between items-center">
                                Tracklist
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', audioFile: null })}>
                                    <Plus className="mr-2 h-3 w-3" /> Add Track
                                </Button>
                            </FormLabel>
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border bg-black/5 rounded space-y-3 relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <FormField control={form.control} name={`tracks.${index}.title`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Track {index + 1} Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Intro" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`tracks.${index}.audioFile`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Audio File</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="audio/*" onChange={(e) => field.onChange(e.target.files)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {(isSubmitting || (uploadProgress !== null && uploadProgress > 0)) && (
                    <div className='space-y-2 py-4 sticky bottom-0 bg-white border-t z-10'>
                        <div className="flex justify-between text-[10px] font-bold uppercase italic text-chart-1">
                            <span>{currentStep || 'Processing...'}</span>
                            <span>{uploadProgress !== null ? Math.round(uploadProgress) : '0'}%</span>
                        </div>
                        <Progress value={uploadProgress || 0} className="h-1" />
                    </div>
                )}

                <Button type="submit" disabled={isSubmitting || !!currentStep} className="w-full h-12 bg-black text-chart-1 font-bold">
                   {isSubmitting ? 'Finalizing Library Entry...' : (productType === 'music' ? (isAlbum ? 'Publish Album' : 'Upload Track') : 'Add Item')}
                   {!isSubmitting && <UploadCloud className="ml-2 h-4 w-4" />}
                </Button>
            </form>
         </Form>
    );
};

const MerchManagement = ({ dbProducts, printfulProducts, isLoading }: { dbProducts: any[], printfulProducts: any[], isLoading: boolean }) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const merchOnly = useMemo(() => {
        const dbMerch = dbProducts.filter(p => p.type === 'merch');
        const printfulMerch = printfulProducts;
        const combined = [...dbMerch];
        const slugs = new Set(combined.map(p => p.slug));
        printfulMerch.forEach(p => {
            if (!slugs.has(p.slug)) combined.push(p);
        });
        return combined.sort((a, b) => a.name.localeCompare(b.name));
    }, [dbProducts, printfulProducts]);

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="pt-0">
                <div className="flex justify-end gap-2 mb-6">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Merch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl uppercase italic">Add Merch Item</DialogTitle>
                            </DialogHeader>
                            <AddProductForm initialType="merch" onFinished={() => setIsAddDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading && <div className="py-4 space-y-2"><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-full"/></div>}
                {!isLoading && merchOnly.length > 0 && (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {merchOnly.map((p: any) => (
                                <TableRow key={p.id || p.slug}>
                                    <TableCell className="font-bold">{p.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{p.brand}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                                            {p.id && String(p.id).length > 10 ? 'Local' : 'Printful'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{p.price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

const MusicManagement = ({ dbProducts, isLoading }: { dbProducts: any[], isLoading: boolean }) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const musicOnly = useMemo(() => {
        return dbProducts.filter(p => p.type === 'music').sort((a, b) => a.name.localeCompare(b.name));
    }, [dbProducts]);

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="pt-0">
                <div className="flex justify-end gap-2 mb-6">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-chart-1 text-black hover:bg-black hover:text-chart-1">
                                <Disc className="mr-2 h-4 w-4" /> Upload New Music
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl uppercase italic">Upload To Music Library</DialogTitle>
                            </DialogHeader>
                            <AddProductForm initialType="music" onFinished={() => setIsAddDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading && <div className="py-4 space-y-2"><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-full"/></div>}
                {!isLoading && musicOnly.length === 0 && <p className="text-center text-muted-foreground py-8">No tracks in library yet.</p>}
                {!isLoading && musicOnly.length > 0 && (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Content</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {musicOnly.map((p: any) => (
                                <TableRow key={p.id || p.slug}>
                                    <TableCell className="font-bold">{p.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{p.isAlbum ? 'Album/EP' : 'Single'}</Badge>
                                    </TableCell>
                                    <TableCell>{p.price}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {p.downloadUrl && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={p.downloadUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileAudio className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            {p.tracks && p.tracks.length > 0 && (
                                                <Badge className="bg-chart-1 text-black">{p.tracks.length} Tracks</Badge>
                                            )}
                                        </div>
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

const SalesDashboard = () => (
    <Card className="border-none shadow-none bg-transparent">
        <CardContent className="pt-0">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Stripe Analytics Coming Soon</h3>
            </div>
        </CardContent>
    </Card>
);

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const isAdmin = user?.email === adminEmail || user?.uid === adminUid;

    const firestore = useFirestore();
    const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: dbProducts, isLoading: isDbLoading } = useCollection(productsQuery);
    
    const [printfulProducts, setPrintfulProducts] = useState<Product[]>([]);
    const [isPrintfulLoading, setIsPrintfulLoading] = useState(false);

    const loadPrintfulData = async () => {
        setIsPrintfulLoading(true);
        try {
            const v3 = await getProducts('Verse 3 Merch');
            const crude = await getProducts('Crude City');
            setPrintfulProducts([...v3, ...crude]);
        } catch (err) {
            console.error("Failed to fetch Printful products:", err);
        } finally {
            setIsPrintfulLoading(false);
        }
    };

    useEffect(() => {
        if (!isUserLoading && !isAdmin) {
            router.push('/');
        } else if (isAdmin) {
            loadPrintfulData();
        }
    }, [isAdmin, isUserLoading, router]);

    if (isUserLoading || !isAdmin) {
        return (
          <div className="container py-24 text-center">
            <div className="flex flex-col items-center gap-4">
              <RefreshCcw className="h-8 w-8 animate-spin text-chart-1" />
              <p className="font-headline text-2xl uppercase italic tracking-widest">Authorizing Admin Access...</p>
            </div>
          </div>
        );
    }

    return (
        <div className="container py-12 md:py-24 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Settings2 className="h-8 w-8 text-chart-1" />
                        <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-tighter italic">Admin <span className="text-chart-1">Control</span></h1>
                    </div>
                    <p className="text-muted-foreground">Authenticated as: <span className="font-bold text-foreground">{user?.displayName || adminEmail}</span></p>
                </div>
                <Button variant="outline" size="sm" onClick={loadPrintfulData} disabled={isPrintfulLoading}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isPrintfulLoading ? 'animate-spin' : ''}`} />
                    Sync Storefronts
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={['merch', 'music']} className="w-full space-y-4">
                <AccordionItem value="merch" className="border-2 border-black/5 rounded-lg overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Package className="h-6 w-6 text-chart-1" />
                            <span className="font-headline text-2xl uppercase italic">Merch Management</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <MerchManagement dbProducts={dbProducts || []} printfulProducts={printfulProducts} isLoading={isDbLoading || isPrintfulLoading} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="music" className="border-2 border-black/5 rounded-lg overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Disc className="h-6 w-6 text-chart-1" />
                            <span className="font-headline text-2xl uppercase italic">Music Library</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <MusicManagement dbProducts={dbProducts || []} isLoading={isDbLoading} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="subscribers" className="border-2 border-black/5 rounded-lg overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-chart-1" />
                            <span className="font-headline text-2xl uppercase italic">V3 Family Subscribers</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <NewsletterSubscribers />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="submissions" className="border-2 border-black/5 rounded-lg overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Music className="h-6 w-6 text-chart-1" />
                            <span className="font-headline text-2xl uppercase italic">Music Submissions</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <MusicSubmissions />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sales" className="border-2 border-black/5 rounded-lg overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <PieChart className="h-6 w-6 text-chart-1" />
                            <span className="font-headline text-2xl uppercase italic">Sales Dashboard</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <SalesDashboard />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
