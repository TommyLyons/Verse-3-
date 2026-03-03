import { getAllProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products
    .filter((p) => p.type === 'music')
    .map((p) => ({
      slug: p.slug,
    }));
}

export default async function MusicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }
  
  return <ProductClientPage product={product} allProducts={allProducts} />;
}
