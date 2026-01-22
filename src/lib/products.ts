'use server';

import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';
import { type Product } from '@/lib/schemas';

export { type Product };

// This is a sample product list that acts as a fallback.
const sampleCrudeCityProducts: Product[] = [
    {
        id: 101,
        name: 'Crude City Graffiti Tee',
        slug: 'crude-city-graffiti-tee',
        price: '£34.99',
        description: 'A premium cotton t-shirt featuring a bold graffiti design from the heart of Crude City. Limited edition.',
        imageUrl: 'https://picsum.photos/seed/101/600/600',
        revolutLink: 'https://revolut.me/test-business-studio/35',
        type: 'merch',
        brand: 'Crude City',
        availableRegions: ['UK', 'EU'],
    },
    {
        id: 102,
        name: 'Crude City Beanie',
        slug: 'crude-city-beanie',
        price: '£22.99',
        description: 'Keep your head warm with the official Crude City beanie. Embroidered logo, one size fits all.',
        imageUrl: 'https://picsum.photos/seed/102/600/600',
        revolutLink: 'https://revolut.me/test-business-studio/23',
        type: 'merch',
        brand: 'Crude City',
        availableRegions: ['UK', 'EU'],
    },
    {
        id: 103,
        name: 'WEED T',
        slug: 'weed-t',
        price: '£45.00',
        description: 'High-quality tee with a bold statement. Made from 100% organic cotton.',
        imageUrl: 'https://picsum.photos/seed/103/600/600',
        revolutLink: 'https://revolut.me/test-business-studio/45',
        type: 'merch',
        brand: 'Crude City',
        availableRegions: ['UK', 'EU'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'],
    },
];

/**
 * Fetches all products from both Firestore and the Genkit Flow, returning a single combined array.
 * This function is now resilient. If fetching from the live Printful API fails, it will fall back to using sample data.
 * @returns A promise that resolves to an array of all products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    // Attempt to fetch products from Firestore.
    try {
        const productsCollection = collection(firestore, 'products');
        const snapshot = await getDocs(productsCollection);
        dbProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    } catch (error) {
        console.warn("Warning: Could not fetch products from Firestore. This might be expected in a local environment without database access.", error);
    }

    // Attempt to fetch products from the Genkit flow (Printful).
    try {
        flowProducts = await getFlowProducts('Crude City');
        if (flowProducts.length === 0) {
             console.warn("Genkit flow returned 0 products from Printful. Falling back to sample data for Crude City.");
             flowProducts = sampleCrudeCityProducts;
        }
    } catch (error) {
        console.error("Critical Error: Could not fetch products from Genkit flow. Falling back to sample data.", error);
        // If the flow fails for any reason (e.g., bad API key), use the sample data as a fallback.
        flowProducts = sampleCrudeCityProducts;
    }

    // Combine the results.
    return [...dbProducts, ...flowProducts];
};


// This function now fetches all products before finding the one with the matching slug.
export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug === slug);
}
