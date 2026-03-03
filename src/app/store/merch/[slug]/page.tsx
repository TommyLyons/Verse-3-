import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    const params = products
      .filter((p) => p.type === 'merch' && p.slug)
      .map((p) => ({
        slug: p.slug,
      }));
    
    // Fallback params to ensure build succeeds even if no products are found
    if (params.length === 0) {
      return [{ slug: 'fallback-merch' }];
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params for merch:", error);
    return [{ slug: 'fallback-merch' }];
  }
}

export default async function MerchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }
  
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
