
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { z } from 'zod';
import { collection, getDocs, Firestore, query } from 'firebase/firestore';


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


// This static data is no longer used.
export const products: Product[] = [];

/**
 * Fetches all products from both Firestore and the Genkit Flow, returning a single combined array.
 * This is the primary function for getting all product data.
 * @param firestore - The Firestore instance.
 * @returns A promise that resolves to an array of all products.
 */
export const getAllProducts = async (firestore: Firestore): Promise<Product[]> => {
    try {
        const productsCollection = collection(firestore, 'products');
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
export const getProductBySlug = async (slug: string, firestore: Firestore): Promise<Product | undefined> => {
    const allProducts = await getAllProducts(firestore);
    return allProducts.find(p => p.slug === slug);
}

// This function filters a provided list of products to find related ones.
export const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    // Find up to 2 related products of the opposite type from the provided list.
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};
