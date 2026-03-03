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

    // Final fallback for static build safety if no products could be retrieved
    if (combined.length === 0) {
        return [
            {
                id: 'v3-hoodie-fallback',
                name: 'V3 Hoodie',
                slug: 'v3-hoodie',
                price: '£35.00',
                description: 'Classic Verse 3 Hoodie. High quality streetwear.',
                imageUrl: 'https://images.unsplash.com/photo-1610582144787-eda2e6f293b4?auto=format&fit=crop&q=80&w=1080',
                revolutLink: 'https://revolut.me/',
                type: 'merch',
                brand: 'Verse 3 Merch'
            },
            {
                id: 'quiet-steps-fallback',
                name: 'Quiet Steps',
                slug: 'quiet-steps',
                price: '£1.49',
                description: 'Debut single from Verse 3 Records.',
                imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&q=80&w=1080',
                revolutLink: 'https://revolut.me/',
                type: 'music',
                brand: 'Verse 3 Merch',
                digital: true,
                downloadUrl: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-1.mp3'
            }
        ];
    }

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
