
'use server';
/**
 * @fileOverview A flow for fetching product information from Printful with accurate retail pricing, regional currency enforcement, and consistent alphabetical ordering.
 * GBP prices are rounded up to the nearest whole number.
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

        const matchingStores = allStores.filter((store: any) => {
            const name = store.name.toLowerCase();
            const isV3 = name.includes('v3') || name.includes('verse') || name.includes('three') || name.includes('records') || name.includes('v-3');
            const isCrude = name.includes('crude');
            
            if (brand === 'Verse 3 Merch') return isV3 && !isCrude;
            if (brand === 'Crude City') return isCrude;
            return false;
        });

        if (matchingStores.length === 0) return [];

        const allDetailedProducts: Product[] = [];

        for (const store of matchingStores) {
            const storeId = store.id;
            const storeNameUpper = store.name.toUpperCase();
            
            const isUKStore = storeNameUpper.includes('UK') || 
                            storeNameUpper.includes('UNITED KINGDOM') ||
                            storeNameUpper.includes('GBP') ||
                            storeNameUpper.includes('V3 UK');

            const region = isUKStore ? 'UK' : 'EU';
            const currencySymbol = isUKStore ? '£' : '€';

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
                    
                    let retailPrice = 0;
                    if (syncVariants && syncVariants.length > 0) {
                        const firstVariantPrice = parseFloat(syncVariants[0].retail_price);
                        if (!isNaN(firstVariantPrice) && firstVariantPrice > 0) {
                            retailPrice = firstVariantPrice;
                        } else {
                            const validPrices = syncVariants.map((v: any) => parseFloat(v.retail_price)).filter((p: number) => !isNaN(p) && p > 0);
                            if (validPrices.length > 0) {
                                retailPrice = validPrices[0];
                            }
                        }
                    }

                    // Force rounding up for GBP prices
                    if (isUKStore && retailPrice > 0) {
                        retailPrice = Math.ceil(retailPrice);
                    }

                    const formattedPrice = retailPrice === 0 ? 'N/A' : `${currencySymbol}${retailPrice % 1 === 0 ? retailPrice.toFixed(0) : retailPrice.toFixed(2)}`;
                    const slug = syncProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                    return {
                        id: String(syncProduct.id),
                        name: syncProduct.name,
                        slug: slug,
                        price: formattedPrice,
                        description: `Official ${brand} merchandise. Premium quality craftsmanship.`,
                        imageUrl: syncProduct.thumbnail_url,
                        revolutLink: 'https://checkout.stripe.com/',
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

        return allDetailedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        return [];
    }
  }
);

export async function getProducts(brand: 'Verse 3 Merch' | 'Crude City'): Promise<Product[]> {
  return getProductsFlow({ brand });
}
