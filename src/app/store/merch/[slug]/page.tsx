
import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    const merchProducts = products.filter((p) => p.type === 'merch' && p.slug);
    
    if (merchProducts.length === 0) {
      return [{ slug: 'v3-hoodie' }];
    }
    
    return merchProducts.map((p) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for merch:", error);
    return [{ slug: 'v3-hoodie' }];
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
