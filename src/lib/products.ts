'use server';

import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';
import { type Product } from '@/lib/schemas';

export { type Product };


/**
 * Fetches all products from both Firestore and the Genkit Flow (Printful).
 * This function ensures all items of type 'merch' are priced at €35.00.
 * @returns A promise that resolves to an array of all products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    // Attempt to fetch products from Firestore.
    try {
        const productsCollection = collection(firestore, 'products');
        const snapshot = await getDocs(productsCollection);
        dbProducts = snapshot.docs.map(doc => {
            const data = doc.data() as Product;
            // Force €35.00 price for merchandise
            if (data.type === 'merch') {
                return { ...data, id: doc.id, price: '€35.00' };
            }
            return { ...data, id: doc.id };
        });
    } catch (error) {
        console.warn("Warning: Could not fetch products from Firestore.", error);
    }

    // Attempt to fetch products from the Genkit flow (Printful).
    // The flow itself is already updated to return €35.00 for its items (which are all merch).
    flowProducts = await getFlowProducts('Crude City');

    // Combine the results.
    return [...dbProducts, ...flowProducts];
};


// This function now fetches all products before finding the one with the matching slug.
export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug === slug);
}
