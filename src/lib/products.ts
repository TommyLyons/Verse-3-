'use server';

import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';
import { type Product } from '@/lib/schemas';

export { type Product };


/**
 * Fetches all products from both Firestore and the Genkit Flow (Printful).
 * This function will now throw an error if the Printful flow fails, allowing the UI to display it.
 * @returns A promise that resolves to an array of all products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    // Attempt to fetch products from Firestore.
    // This part is resilient and will not block the Printful fetch.
    try {
        const productsCollection = collection(firestore, 'products');
        const snapshot = await getDocs(productsCollection);
        dbProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    } catch (error) {
        console.warn("Warning: Could not fetch products from Firestore. This might be expected in a local environment without database access.", error);
    }

    // Attempt to fetch products from the Genkit flow (Printful).
    // If this throws an error, it will be propagated up to the calling component.
    flowProducts = await getFlowProducts('Crude City');

    // Combine the results.
    return [...dbProducts, ...flowProducts];
};


// This function now fetches all products before finding the one with the matching slug.
export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug === slug);
}
