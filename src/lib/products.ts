
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
    brand?: 'Verse 3 Merch' | 'Crude City'; // Added for merchandise branding
    digital?: boolean;
    downloadUrl?: string; // Only for digital products
    availableRegions?: ('UK' | 'EU')[]; // For merchandise availability
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
        type: 'merch',
        brand: 'Verse 3 Merch',
        availableRegions: ['UK', 'EU']
    },
    { 
        id: 3, 
        name: 'Verse3 Logo Cap', 
        slug: 'verse3-logo-cap',
        price: '$24.99', 
        description: 'A stylish and comfortable black cap with the Verse3 Records logo beautifully embroidered on the front. Perfect for everyday wear.',
        image: getImage('merch-cap')!, 
        revolutLink: 'https://revolut.me/test-business-studio/25',
        type: 'merch',
        brand: 'Verse 3 Merch',
        availableRegions: ['UK', 'EU']
    },
    { 
        id: 6, 
        name: 'Printify Demo T-Shirt', 
        slug: 'printify-demo-t-shirt',
        price: '$29.99', 
        description: 'This is a sample product that could be sourced from Printify. It\'s a high-quality, comfortable t-shirt perfect for your fans.',
        image: getImage('merch-tshirt')!, 
        revolutLink: 'https://revolut.me/test-business-studio/30', // You would replace this with the actual Printify product link or checkout
        type: 'merch',
        brand: 'Verse 3 Merch',
        availableRegions: ['UK']
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
    { 
        id: 5, 
        name: 'Lofty - Quiet Steps Single', 
        slug: 'lofty-quiet-steps',
        price: '$9.99', 
        description: 'The debut single from Lofty. A melodic and emotional track that sets the tone for Verse3 Records.',
        image: getImage('album-art-2')!, 
        revolutLink: 'https://revolut.me/test-business-studio/10',
        type: 'music'
    },
    {
        id: 7,
        name: 'Quiet Steps (WAV Download)',
        slug: 'quiet-steps-wav',
        price: '$2.99',
        description: 'Purchase a high-quality WAV file of "Quiet Steps". After purchase, the file will be available for download in your profile.',
        image: getImage('album-art-2')!,
        revolutLink: 'https://revolut.me/test-business-studio/3',
        type: 'music',
        digital: true,
        downloadUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/Music%2F01.%20The%20Goods%20-%20Glow%20(Original%20Mix).mp3?alt=media&token=7bb1f9b9-cf66-49f7-9104-92f94d75bd2c'
    }
];

export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);

export const getRelatedProducts = (currentProduct: Product) => {
    // If viewing merch, recommend music. If viewing music, recommend merch.
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    return products.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};
