import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

// Prevent build-time static generation failures if API/DB is unreachable
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MerchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const allProducts = await getAllProducts();
  
  const product = allProducts.find(p => 
    p.slug.toLowerCase() === slug.toLowerCase() && 
    p.type === 'merch'
  );
  
  if (!product) {
    notFound();
  }
  
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
