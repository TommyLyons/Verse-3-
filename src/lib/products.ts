'use server';

import { getProducts as getFlowProducts, Product, ProductSchema } from '@/ai/flows/get-products-flow';
import { collection, getDocs, Firestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-init';

export { type Product, ProductSchema };

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
