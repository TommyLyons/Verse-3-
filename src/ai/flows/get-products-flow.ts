'use server';
/**
 * @fileOverview Exhaustive synchronization flow for Printful inventory.
 * - Robust error handling for all API interactions.
 * - Global de-duplication based on product slugs.
 * - Intelligent brand categorization based on store name and content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';

// Hardcoded key as requested by user to ensure immediate synchronization
const AUTHORIZED_KEY = "Ov2Uw6O0IVIwo0GQyILreP4POv0NSwfcowFvmU20";

export async function getPrintfulApiKey(): Promise<string | null> {
    return AUTHORIZED_KEY;
}

const getProductsFlow = ai.defineFlow(
  {
    name: 'getProductsFlow',
    inputSchema: z.object({ brand: z.enum(['Verse 3 Merch', 'Crude City']) }),
    outputSchema: z.array(ProductSchema),
  },
  async ({ brand }) => {
    const apiKey = await getPrintfulApiKey();
    if (!apiKey) {
        console.warn("Printful API Key missing.");
        return [];
    }

    const headers = { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    try {
        // Fetch all stores to ensure we don't miss any region or brand
        const storesResponse = await fetch('https://api.printful.com/stores', { headers });
        if (!storesResponse.ok) return [];
        
        const storesData = await storesResponse.json();
        const allStores = storesData.result || [];
        if (allStores.length === 0) return [];

        const globalProductsMap = new Map<string, Product>();

        for (const store of allStores) {
            try {
                const storeId = store.id;
                const storeNameUpper = store.name.toUpperCase();
                
                // Brand detection based on Store Name
                const isCrudeStore = storeNameUpper.includes('CRUDE') || storeNameUpper.includes('CITY');
                
                // Region detection
                const isUKStore = storeNameUpper.includes('UK') || storeNameUpper.includes('GBP');
                const region = isUKStore ? 'UK' : 'EU';
                const currencySymbol = isUKStore ? '£' : '€';

                // Fetch sync products for this specific store
                const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });
                if (!productsResponse.ok) continue;

                const data = await productsResponse.json();
                const products = data.result || [];

                for (const item of products) {
                    try {
                        const prodName = item.name.toLowerCase();
                        const slug = item.name.toLowerCase()
                            .replace(/ /g, '-')
                            .replace(/[^\w-]+/g, '')
                            .trim();

                        // Item-level brand refinement
                        const isCrudeItem = isCrudeStore || prodName.includes('crude') || prodName.includes('city');
                        const targetBrand = isCrudeItem ? 'Crude City' : 'Verse 3 Merch';

                        // Only process items for the requested brand
                        if (targetBrand !== brand) continue;

                        // De-duplicate globally by slug
                        if (!globalProductsMap.has(slug)) {
                            // Fetch full details
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
                                description: syncProduct.description || `Official ${brand} merchandise. Premium quality. Global shipping included.`,
                                imageUrl: syncProduct.thumbnail_url || item.thumbnail_url,
                                revolutLink: 'https://checkout.stripe.com/',
                                type: 'merch',
                                brand: brand as any,
                                availableRegions: [region as any],
                                sizes: sizes.length > 0 ? sizes : undefined,
                            });
                        }
                    } catch (err) { continue; }
                }
            } catch (err) { continue; }
        }

        return Array.from(globalProductsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
