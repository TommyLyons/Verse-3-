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
            const data = doc.data() as any;
            // Convert Firestore Timestamps to ISO strings to avoid Next.js serialization errors
            const serialized = { ...data };
            if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
                serialized.createdAt = serialized.createdAt.toDate().toISOString();
            }
            return { ...serialized, id: doc.id } as Product;
        });
    } catch (error) {
        console.warn("Warning: Could not fetch products from Firestore during build.");
    }

    try {
        const [crudeProducts, v3Products] = await Promise.all([
            getFlowProducts('Crude City'),
            getFlowProducts('Verse 3 Merch')
        ]);
        flowProducts = [...crudeProducts, ...v3Products];
    } catch (error) {
        console.warn("Warning: Could not fetch products from Printful Flow during build.");
    }

    const combined = [...dbProducts, ...flowProducts];

    // Enforce consistent alphabetical sorting across all stores
    const sorted = combined.sort((a, b) => a.name.localeCompare(b.name));

    // Final fallback for static build safety if no products could be retrieved
    if (sorted.length === 0) {
        return [
            {
                id: 'v3-hoodie-fallback',
                name: 'V3 Hoodie',
                slug: 'v3-hoodie',
                price: '£35',
                description: 'Classic Verse 3 Hoodie. High quality streetwear.',
                imageUrl: 'https://images.unsplash.com/photo-1610582144787-eda2e6f293b4?auto=format&fit=crop&q=80&w=1080',
                revolutLink: 'https://checkout.stripe.com/',
                type: 'merch',
                brand: 'Verse 3 Merch'
            },
            {
                id: 'quiet-steps-fallback',
                name: 'Quiet Steps',
                slug: 'quiet-steps',
                price: '£2',
                description: 'Debut single from Verse 3 Records.',
                imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&q=80&w=1080',
                revolutLink: 'https://checkout.stripe.com/',
                type: 'music',
                brand: 'Verse 3 Merch',
                digital: true,
                downloadUrl: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-1.mp3'
            }
        ];
    }

    return sorted;
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    try {
        const allProducts = await getAllProducts();
        // Use case-insensitive lookup for URL safety
        return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
    } catch (error) {
        console.error("Error in getProductBySlug:", error);
        return undefined;
    }
}
