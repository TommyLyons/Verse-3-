import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';
import type { Product } from '@/lib/products';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products
    .filter((p) => p.type === 'merch')
    .map((p) => ({
      slug: p.slug,
    }));
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
