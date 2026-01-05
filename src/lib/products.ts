
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { z } from 'zod';

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


// This static data will now act as a fallback or initial data.
// The primary source of truth will be Firestore.
export const products: Product[] = [
   
];


// This function will now require the full product list to be passed in.
export const getProductBySlug = async (slug: string, allProducts: Product[]) => {
    // First, check the products from Firestore
    let product = allProducts.find(p => p.slug === slug);
    return product;
}

export const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    // Find up to 2 related products of the opposite type from the main product list.
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};
