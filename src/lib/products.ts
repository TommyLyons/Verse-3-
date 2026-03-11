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

    // Fallback items that should ALWAYS be present if everything else fails
    const fallbacks: Product[] = [
        {
            id: 'v3-hoodie-fallback',
            name: 'V3 Classic Hoodie',
            slug: 'v3-classic-hoodie',
            price: '£35',
            description: 'The essential Verse 3 Hoodie. Premium heavyweight cotton.',
            imageUrl: 'https://images.unsplash.com/photo-1610582144787-eda2e6f293b4?auto=format&fit=crop&q=80&w=1080',
            revolutLink: 'https://checkout.stripe.com/',
            type: 'merch',
            brand: 'Verse 3 Merch',
            sizes: ['S', 'M', 'L', 'XL']
        },
        {
            id: 'quiet-steps-digital',
            name: 'Quiet Steps',
            slug: 'quiet-steps',
            price: '£2',
            description: 'Debut single from Verse 3 Records. Digital Master.',
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
            if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
                serialized.createdAt = serialized.createdAt.toDate().toISOString();
            }
            return { ...serialized, id: doc.id } as Product;
        });
    } catch (error) {
        console.warn("Firestore fetch failed, using fallback/flow products.");
    }

    try {
        const [crudeProducts, v3Products] = await Promise.all([
            getFlowProducts('Crude City'),
            getFlowProducts('Verse 3 Merch')
        ]);
        flowProducts = [...crudeProducts, ...v3Products];
    } catch (error) {
        console.warn("Printful flow fetch failed.");
    }

    // Global de-duplication by slug
    const uniqueMap = new Map<string, Product>();
    
    // 1. Start with fallbacks
    fallbacks.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
    
    // 2. Add Printful products (overrides fallbacks if slug matches)
    flowProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));
    
    // 3. Add DB products (local manual entries override everything)
    dbProducts.forEach(p => uniqueMap.set(p.slug.toLowerCase(), p));

    const combined = Array.from(uniqueMap.values());
    return combined.sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}
