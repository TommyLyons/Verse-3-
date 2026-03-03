'use server';
/**
 * @fileOverview A flow for fetching product information from Printful with accurate retail pricing and regional currency enforcement.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getPrintfulApiKey(): Promise<string | null> {
    if (process.env.PRINTFUL_API_KEY) {
        return process.env.PRINTFUL_API_KEY;
    }

    const secretName = 'projects/studio-6967403383-a8bb0/secrets/PRINTFUL_API_KEY/versions/latest';

    try {
        const client = new SecretManagerServiceClient();
        const [version] = await client.accessSecretVersion({
            name: secretName,
        });

        const payload = version.payload?.data?.toString();
        if (payload) {
            return payload;
        }
        return null;
    } catch (error) {
        return null;
    }
}

const getProductsFlow = ai.defineFlow(
  {
    name: 'getProductsFlow',
    inputSchema: z.object({ brand: z.enum(['Verse 3 Merch', 'Crude City']) }),
    outputSchema: z.array(ProductSchema),
  },
  async ({ brand }) => {
    const apiKey = await getPrintfulApiKey();
    if (!apiKey) return [];

    const headers = { 'Authorization': `Bearer ${apiKey}` };

    try {
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const allStores = storesData.result || [];

        // Precise store filtering to prevent region/brand crossover
        const matchingStores = allStores.filter((store: any) => {
            const name = store.name.toLowerCase();
            const isV3 = name.includes('v3') || name.includes('verse') || name.includes('three');
            const isCrude = name.includes('crude');
            
            if (brand === 'Verse 3 Merch') return isV3 && !isCrude;
            if (brand === 'Crude City') return isCrude;
            return false;
        });

        if (matchingStores.length === 0) return [];

        const allDetailedProducts: Product[] = [];

        for (const store of matchingStores) {
            const storeId = store.id;
            // Robust region detection
            const isUK = store.name.toUpperCase().includes('UK') || store.name.toUpperCase().includes('UNITED KINGDOM');
            const region = isUK ? 'UK' : 'EU';
            const currencySymbol = isUK ? '£' : '€';

            const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });
            if (!productsResponse.ok) continue;

            const data = await productsResponse.json();
            const products = data.result || [];

            const detailedProducts = await Promise.all(products.map(async (item: any) => {
                try {
                    const detailResponse = await fetch(`https://api.printful.com/sync/products/${item.id}?store_id=${storeId}`, { headers });
                    if (!detailResponse.ok) return null;
                    
                    const detailData = await detailResponse.json();
                    const syncProduct = detailData.result.sync_product;
                    const syncVariants = detailData.result.sync_variants;

                    if (!syncProduct || !syncProduct.name || !syncProduct.thumbnail_url) return null;

                    const sizes = syncVariants 
                        ? [...new Set(syncVariants.map((v: any) => v.size).filter(Boolean))] as string[] 
                        : [];
                    
                    // ACCURATE RETAIL PRICE EXTRACTION
                    // We pull the retail price specifically as set in this regional store.
                    // We take the MAX to ensure premium items (like backpacks) reflect their true value.
                    let retailPrice = 0;
                    if (syncVariants && syncVariants.length > 0) {
                        const prices = syncVariants.map((v: any) => parseFloat(v.retail_price)).filter((p: number) => !isNaN(p) && p > 0);
                        if (prices.length > 0) {
                            retailPrice = Math.max(...prices);
                        }
                    }

                    const formattedPrice = retailPrice === 0 ? 'N/A' : `${currencySymbol}${retailPrice.toFixed(2)}`;
                    const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                    return {
                        id: String(syncProduct.id),
                        name: syncProduct.name,
                        slug: slug,
                        price: formattedPrice,
                        description: syncProduct.name.includes('Backpack') 
                            ? `Premium official ${brand} utility gear. Built for durability and style.`
                            : `Official ${brand} merchandise. Premium quality.`,
                        imageUrl: syncProduct.thumbnail_url,
                        revolutLink: 'https://revolut.me/',
                        type: 'merch',
                        brand: brand as any,
                        availableRegions: [region as any],
                        sizes: sizes.length > 0 ? sizes : undefined,
                    };
                } catch (err) {
                    return null;
                }
            }));

            allDetailedProducts.push(...detailedProducts.filter((p): p is Product => p !== null));
        }

        return allDetailedProducts;
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
