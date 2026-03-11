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

    // Robust fallbacks that always show up to prevent blank pages
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
        },
        {
            id: 'quiet-steps-digital',
            name: 'Quiet Steps',
            slug: 'quiet-steps',
            price: '£2',
            description: 'Debut single from Verse 3 Records. Authorized Digital Master.',
            imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&q=80&w=1080',
            revolutLink: 'https://checkout.stripe.com/',
            type: 'music',
            brand: 'Verse 3 Merch',
            digital: true,
            downloadUrl: 'https://storage.googleapis.com/studioprod-us-central1-39a4/media/SoundHelix-Song-1.mp3'
        }
    ];

    try {
        const db = getServerFirestore();
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        
        dbProducts = snapshot.docs.map(doc => {
            const data = doc.data() as any;
            const serialized = { ...data };
            if (serialized.updatedAt && typeof serialized.updatedAt.toDate === 'function') {
                serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
            }
            return { ...serialized, id: doc.id } as Product;
        });
    } catch (error) {
        console.warn("Firestore fetch error, proceeding with flow/fallbacks.");
    }

    try {
        // Fetch Printful items with a timeout safety to prevent page hanging
        const printfulData = await Promise.race([
            Promise.all([
                getFlowProducts('Crude City'),
                getFlowProducts('Verse 3 Merch')
            ]),
            new Promise<Product[][]>((_, reject) => setTimeout(() => reject(new Error('Printful timeout')), 8000))
        ]).catch(() => [[], []]);
        
        flowProducts = [...printfulData[0], ...printfulData[1]];
    } catch (error) {
        console.warn("Printful flow skipped due to timeout or error.");
    }

    // Global de-duplication by normalized slug
    const uniqueMap = new Map<string, Product>();
    
    // Priority 1: Fallbacks (Baseline)
    fallbacks.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
    
    // Priority 2: Flow (Printful - overrides fallbacks)
    flowProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
    
    // Priority 3: Database (Manual - overrides all)
    dbProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));

    const combined = Array.from(uniqueMap.values());
    return combined.sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}
