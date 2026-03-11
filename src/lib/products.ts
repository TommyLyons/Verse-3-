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
 * This fixes the "Only plain objects can be passed to Client Components" error.
 */
function serializeData(data: any): any {
    if (data === null || typeof data !== 'object') return data;
    
    // Handle Firestore Timestamps
    if (data.seconds !== undefined && data.nanoseconds !== undefined) {
        return new Date(data.seconds * 1000).toISOString();
    }
    
    if (data instanceof Date) {
        return data.toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(serializeData);
    }

    const result: any = {};
    for (const key in data) {
        // Skip functions and other non-serializable properties
        if (typeof data[key] === 'function') continue;
        result[key] = serializeData(data[key]);
    }
    return result;
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
            // Crucial: Serialize the data before it leaves the server component context
            return { ...serializeData(data), id: doc.id } as Product;
        });
    } catch (error) {
        console.warn("Firestore products fetch failure.");
    }

    try {
        // Fetch products from Printful Flow using the hardcoded authorized key
        flowProducts = await getFlowProducts().catch((e) => {
            console.warn("Printful Sync Failure:", e.message);
            return [];
        });
    } catch (error) {
        console.warn("External product synchronization failure.");
    }

    const uniqueMap = new Map<string, Product>();
    
    // Merge strategy with local database taking priority
    flowProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), serializeData(p)));
    dbProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), serializeData(p)));

    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}
