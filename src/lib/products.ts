import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';
import { type Product } from '@/lib/schemas';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export { type Product };

function getServerFirestore() {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
}

/**
 * Recursively serializes Firestore data to ensure only plain objects 
 * are passed from Server Components to Client Components.
 */
function serializeData(data: any): any {
    if (data === null || typeof data !== 'object') return data;
    
    // Handle Firestore Timestamps (they have seconds and nanoseconds)
    if (data.seconds !== undefined && data.nanoseconds !== undefined) {
        try {
            if (typeof data.toDate === 'function') {
                return data.toDate().toISOString();
            }
            return new Date(data.seconds * 1000).toISOString();
        } catch (e) {
            return data;
        }
    }

    if (Array.isArray(data)) {
        return data.map(serializeData);
    }

    const result: any = {};
    for (const key in data) {
        result[key] = serializeData(data[key]);
    }
    return result;
}

export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    // Verified Fallbacks for Resilient User Experience
    const fallbacks: Product[] = [
        {
            id: 'v3-hoodie-fallback',
            name: 'V3 Classic Hoodie',
            slug: 'v3-classic-hoodie',
            price: '£35',
            description: 'The essential Verse 3 Hoodie. Premium heavyweight cotton. Free shipping included.',
            imageUrl: 'https://images.unsplash.com/photo-1610582144787-eda2e6f293b4?auto=format&fit=crop&q=80&w=1080',
            revolutLink: 'https://checkout.stripe.com/',
            type: 'merch',
            brand: 'Verse 3 Merch',
            sizes: ['S', 'M', 'L', 'XL'],
            availableRegions: ['UK', 'EU']
        }
    ];

    try {
        const db = getServerFirestore();
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        
        dbProducts = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...serializeData(data), id: doc.id } as Product;
        });
    } catch (error) {
        console.warn("Firestore collection fetch failure.");
    }

    try {
        // Fetch products from Printful Flow
        flowProducts = await getFlowProducts().catch((e) => {
            console.warn("Printful Sync Failure:", e.message);
            return [];
        });
    } catch (error) {
        console.warn("External product synchronization failure.");
    }

    const uniqueMap = new Map<string, Product>();
    
    // Merge Strategy: Fallbacks < Printful Sync < Local Database (Overwrites)
    fallbacks.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
    flowProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
    dbProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));

    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}
