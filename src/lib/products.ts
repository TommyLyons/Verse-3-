
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    description: string;
    image: ImagePlaceholder;
    revolutLink: string;
    type: 'merch' | 'music';
}


export const products: Product[] = [
    { 
        id: 1, 
        name: 'Verse3 Logo Hoodie', 
        slug: 'verse3-logo-hoodie',
        price: '$59.99', 
        description: 'Stay warm and rep the label with this comfortable, high-quality black hoodie featuring the signature Verse3 Records logo in vibrant yellow.',
        image: getImage('merch-hoodie')!, 
        revolutLink: 'https://revolut.me/test-business-studio/50',
        type: 'merch' 
    },
    { 
        id: 3, 
        name: 'Verse3 Logo Cap', 
        slug: 'verse3-logo-cap',
        price: '$24.99', 
        description: 'A stylish and comfortable black cap with the Verse3 Records logo beautifully embroidered on the front. Perfect for everyday wear.',
        image: getImage('merch-cap')!, 
        revolutLink: 'https://revolut.me/test-business-studio/25',
        type: 'merch'
    },
    { 
        id: 2, 
        name: 'DJ Lofty - Midnight Drive Vinyl', 
        slug: 'midnight-drive-vinyl',
        price: '$29.99', 
        description: 'Own a piece of Verse3 history with the special edition vinyl pressing of DJ Lofty\'s "Midnight Drive". Features exclusive artwork and high-fidelity audio.',
        image: getImage('merch-vinyl')!, 
        revolutLink: 'https://revolut.me/test-business-studio/30',
        type: 'music'
    },
    { 
        id: 4, 
        name: 'Verse3 Album Art Poster', 
        slug: 'album-art-poster',
        price: '$19.99', 
        description: 'Decorate your space with this high-quality poster print of the iconic abstract neon artwork from one of our flagship releases.',
        image: getImage('album-art-1')!, 
        revolutLink: 'https://revolut.me/test-business-studio/20',
        type: 'music'
    },
];

export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);

export const getRelatedProducts = (currentProduct: Product) => {
    // If viewing merch, recommend music. If viewing music, recommend merch.
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    return products.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};

