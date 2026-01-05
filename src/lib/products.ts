
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

export interface Product {
    id: number | string; // Can be number for static or string from Firestore
    name: string;
    slug: string;
    price: string;
    description: string;
    image: ImagePlaceholder | { imageUrl: string; description: string, imageHint: string }; // Allow for dynamic images
    revolutLink: string;
    type: 'merch' | 'music';
    brand?: 'Verse 3 Merch' | 'Crude City';
    digital?: boolean;
    downloadUrl?: string;
    availableRegions?: ('UK' | 'EU')[];
}


// This static data will now act as a fallback or initial data.
// The primary source of truth will be Firestore.
export const products: Product[] = [
   
];

// These functions will now require the full product list to be passed in.
export const getProductBySlug = (slug: string, allProducts: Product[]) => {
    return allProducts.find(p => p.slug === slug);
}

export const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    // Find up to 2 related products of the opposite type.
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};
