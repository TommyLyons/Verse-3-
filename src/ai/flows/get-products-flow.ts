'use server';
/**
 * @fileOverview A flow for fetching product information from ALL connected Printful stores.
 * - Store-Name Categorization: Automatically assigns items to 'Crude City' if the store name matches.
 * - De-duplication: Ensures unique products by tracking Sync Product IDs.
 * - Brand Logic: Products match brands based on both Store Name and Product Title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProductSchema, type Product } from '@/lib/schemas';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function getPrintfulApiKey(): Promise<string | null> {
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

        if (allStores.length === 0) return [];

        // Map to prevent duplicates within the same brand request across different stores
        const uniqueProductsMap = new Map<string, Product>();

        for (const store of allStores) {
            const storeId = store.id;
            const storeNameUpper = store.name.toUpperCase();
            
            const isCrudeCityStore = storeNameUpper.includes('CRUDE') || storeNameUpper.includes('CITY');
            const isUKStore = storeNameUpper.includes('UK') || storeNameUpper.includes('GBP');
            
            const region = isUKStore ? 'UK' : 'EU';
            const currencySymbol = isUKStore ? '£' : '€';
            const shippingBuffer = isUKStore ? 5.00 : 6.00;

            const productsResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}&status=synced&limit=100`, { headers });
            if (!productsResponse.ok) continue;

            const data = await productsResponse.json();
            const products = data.result || [];

            for (const item of products) {
                try {
                    const detailResponse = await fetch(`https://api.printful.com/sync/products/${item.id}?store_id=${storeId}`, { headers });
                    if (!detailResponse.ok) continue;
                    
                    const detailData = await detailResponse.json();
                    const syncProduct = detailData.result.sync_product;
                    const syncVariants = detailData.result.sync_variants;

                    if (!syncProduct || !syncProduct.name || !syncProduct.thumbnail_url) continue;

                    const prodName = syncProduct.name.toLowerCase();
                    const belongsToCrude = isCrudeCityStore || prodName.includes('crude') || prodName.includes('city');

                    if (brand === 'Crude City' && !belongsToCrude) continue;
                    if (brand === 'Verse 3 Merch' && belongsToCrude) continue;

                    const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                    // Only add if not already present to avoid duplicates
                    if (!uniqueProductsMap.has(slug)) {
                        const sizes = syncVariants 
                            ? [...new Set(syncVariants.map((v: any) => v.size).filter(Boolean))] as string[] 
                            : [];
                        
                        let retailPrice = 0;
                        if (syncVariants && syncVariants.length > 0) {
                            const validPrices = syncVariants
                                .map((v: any) => parseFloat(v.retail_price))
                                .filter((p: number) => !isNaN(p) && p > 0);
                            
                            if (validPrices.length > 0) {
                                retailPrice = Math.min(...validPrices);
                            }
                        }

                        if (retailPrice > 0) {
                            retailPrice += shippingBuffer;
                            retailPrice = Math.round(retailPrice / 5) * 5;
                        }

                        const formattedPrice = retailPrice === 0 ? 'N/A' : `${currencySymbol}${retailPrice.toFixed(0)}`;

                        uniqueProductsMap.set(slug, {
                            id: String(syncProduct.id),
                            name: syncProduct.name,
                            slug: slug,
                            price: formattedPrice,
                            description: syncProduct.description || `Official ${brand} merchandise. Premium quality. Free shipping included.`,
                            imageUrl: syncProduct.thumbnail_url,
                            revolutLink: 'https://checkout.stripe.com/',
                            type: 'merch',
                            brand: brand as any,
                            availableRegions: [region as any],
                            sizes: sizes.length > 0 ? sizes : undefined,
                        });
                    }
                } catch (err) {
                    continue;
                }
            }
        }

        return Array.from(uniqueProductsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
