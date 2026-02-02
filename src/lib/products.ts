'use server';

import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export { type Product };

/**
 * Initializes a Firebase instance for server-side use.
 */
function getServerFirestore() {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
}

/**
 * Fetches all products from both Firestore and the Genkit Flow (Printful).
 * This function ensures all items of type 'merch' are priced at €35.00.
 * @returns A promise that resolves to an array of all products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    // Fetch products from Firestore using the standard JS SDK (compatible with server-side)
    try {
        const db = getServerFirestore();
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        
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

    // Fetch products from the Genkit flow (Printful).
    try {
        flowProducts = await getFlowProducts('Crude City');
    } catch (error) {
        console.warn("Warning: Could not fetch products from Printful Flow.", error);
    }

    // Combine the results, ensuring merch pricing is consistent
    return [...dbProducts, ...flowProducts].map(p => {
        if (p.type === 'merch') {
            return { ...p, price: '€35.00' };
        }
        return p;
    });
};

/**
 * Fetches all products before finding the one with the matching slug.
 */
export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug === slug);
}
