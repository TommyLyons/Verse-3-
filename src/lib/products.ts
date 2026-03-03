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

export const getAllProducts = async (): Promise<Product[]> => {
    let dbProducts: Product[] = [];
    let flowProducts: Product[] = [];

    try {
        const db = getServerFirestore();
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        
        dbProducts = snapshot.docs.map(doc => {
            const data = doc.data() as Product;
            return { ...data, id: doc.id };
        });
    } catch (error) {
        console.warn("Warning: Could not fetch products from Firestore.", error);
    }

    try {
        const [crudeProducts, v3Products] = await Promise.all([
            getFlowProducts('Crude City'),
            getFlowProducts('Verse 3 Merch')
        ]);
        flowProducts = [...crudeProducts, ...v3Products];
    } catch (error) {
        console.warn("Warning: Could not fetch products from Printful Flow.", error);
    }

    // Combine products. Printful prices are already formatted in the flow.
    const combined = [...dbProducts, ...flowProducts];

    return combined;
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    try {
        const allProducts = await getAllProducts();
        return allProducts.find(p => p.slug === slug);
    } catch (error) {
        console.error("Error in getProductBySlug:", error);
        return undefined;
    }
}
