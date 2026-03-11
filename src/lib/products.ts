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
 * Recursively serializes data to ensure only plain objects are passed to Client Components.
 * This explicitly handles Firestore Timestamps by converting them to ISO strings.
 */
function serializeData(data: any): any {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    // Handle Firestore Timestamps
    if (typeof data.seconds === 'number' && typeof data.nanoseconds === 'number') {
        return new Date(data.seconds * 1000).toISOString();
    }

    if (data instanceof Date) {
        return data.toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(serializeData);
    }

    const serialized: any = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            serialized[key] = serializeData(data[key]);
        }
    }
    return serialized;
}

export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    try {
        const db = getServerFirestore();
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        
        dbProducts = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...serializeData(data), id: doc.id } as Product;
        });
    } catch (error) {
        console.warn("Firestore products fetch failure.");
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
    
    // Merge strategy: Printful first, then DB (DB overrides Printful if slugs match)
    flowProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), serializeData(p)));
    dbProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), serializeData(p)));

    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}
