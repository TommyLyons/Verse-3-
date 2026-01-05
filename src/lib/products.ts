
'use server';


import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { z } from 'zod';
import { collection, getDocs, Firestore, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-init';


export const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  slug: z.string(),
  price: z.string(),
  description: z.string(),
  image: z.object({
    id: z.string().optional(),
    description: z.string(),
    imageUrl: z.string(),
    imageHint: z.string(),
  }).optional(),
  imageUrl: z.string().optional(),
  revolutLink: z.string().url(),
  type: z.enum(['merch', 'music']),
  brand: z.enum(['Verse 3 Merch', 'Crude City']).optional(),
  digital: z.boolean().optional(),
  downloadUrl: z.string().url().optional(),
  availableRegions: z.array(z.enum(['UK', 'EU'])).optional(),
  sizes: z.array(z.string()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

/**
 * Fetches all products from both Firestore and the Genkit Flow, returning a single combined array.
 * This is the primary function for getting all product data. It can be called from server or client components.
 * @returns A promise that resolves to an array of all products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const db = initializeFirebase().firestore;

        const productsCollection = collection(db, 'products');
        const dbProductsPromise = getDocs(productsCollection).then(snapshot => 
            snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product))
        );

        const flowProductsPromise = getFlowProducts('Crude City');

        const [dbProducts, flowProducts] = await Promise.all([
            dbProductsPromise,
            flowProductsPromise
        ]);

        return [...dbProducts, ...flowProducts];
    } catch (error) {
        console.error("Error fetching all products:", error);
        // In case of an error, return an empty array to prevent crashes.
        return [];
    }
};


// This function now fetches all products before finding the one with the matching slug.
export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug === slug);
}
