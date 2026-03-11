'use server';
/**
 * @fileOverview Exhaustive synchronization flow for multiple Printful stores.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';

const AUTHORIZED_KEY = "Ov2Uw6O0IVIwo0GQyILreP4POv0NSwfcowFvmU20";

export async function getPrintfulApiKey(): Promise<string | null> {
    return AUTHORIZED_KEY;
}

const getProductsFlow = ai.defineFlow(
  {
    name: 'getProductsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(ProductSchema),
  },
  async () => {
    const apiKey = await getPrintfulApiKey();
    if (!apiKey) return [];

    const headers = { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const allStores = storesData.result || [];
        
        const globalProductsMap = new Map<string, Product>();

        for (const store of allStores) {
            try {
                const storeId = store.id;
                const storeNameUpper = (store.name || '').toUpperCase();
                
                const isCrudeStore = storeNameUpper.includes('CRUDE') || storeNameUpper.includes('CITY');
                const targetBrand = isCrudeStore ? 'Crude City' : 'Verse 3 Merch';
                
                const currency = store.currency || 'GBP';
                const isUKStore = currency === 'GBP' || storeNameUpper.includes('UK');
                const region = isUKStore ? 'UK' : 'EU';
                const currencySymbol = isUKStore ? '£' : '€';

                const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&limit=100`, { headers });
                if (!productsResponse.ok) continue;

                const data = await productsResponse.json();
                const products = data.result || [];

                for (const item of products) {
                    try {
                        const slug = (item.name || '').toLowerCase()
                            .replace(/ /g, '-')
                            .replace(/[^\w-]+/g, '')
                            .trim();

                        if (globalProductsMap.has(slug)) continue;

                        const detailResponse = await fetch(`https://api.printful.com/sync/products/${item.id}?store_id=${storeId}`, { headers });
                        if (!detailResponse.ok) continue;
                        
                        const detailData = await detailResponse.json();
                        const syncProduct = detailData.result.sync_product;
                        const syncVariants = detailData.result.sync_variants;

                        if (!syncProduct) continue;

                        const sizes = syncVariants 
                            ? [...new Set(syncVariants.map((v: any) => v.size).filter(Boolean))] as string[] 
                            : [];
                        
                        let minPrice = 0;
                        if (syncVariants && syncVariants.length > 0) {
                            const validPrices = syncVariants
                                .map((v: any) => parseFloat(v.retail_price))
                                .filter((p: number) => !isNaN(p) && p > 0);
                            if (validPrices.length > 0) minPrice = Math.min(...validPrices);
                        }

                        // Apply standard brand markup
                        if (minPrice > 0) {
                            minPrice += isUKStore ? 5 : 6;
                            minPrice = Math.round(minPrice / 5) * 5;
                        }

                        const formattedPrice = minPrice === 0 ? 'N/A' : `${currencySymbol}${minPrice.toFixed(0)}`;

                        globalProductsMap.set(slug, {
                            id: String(syncProduct.id),
                            name: syncProduct.name,
                            slug: slug,
                            price: formattedPrice,
                            description: syncProduct.description || `Official ${targetBrand} merchandise. Premium quality.`,
                            imageUrl: syncProduct.thumbnail_url || item.thumbnail_url,
                            revolutLink: 'https://checkout.stripe.com/',
                            type: 'merch',
                            brand: targetBrand as any,
                            availableRegions: [region as any],
                            sizes: sizes.length > 0 ? sizes : undefined,
                        });
                    } catch (err) {}
                }
            } catch (err) {}
        }

        return Array.from(globalProductsMap.values());
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(): Promise<Product[]> {
  return getProductsFlow();
}
