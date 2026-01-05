
import { getProductBySlug, getRelatedProducts, getAllProducts, type Product } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductClientPage } from './product-client-page';
import { initializeFirebase } from '@/firebase';

// This is the main server component for the product page.
export default async function MusicPage({ params }: { params: { slug: string } }) {
  const { firestore } = initializeFirebase();
  const { slug } = params;

  // Fetch all data on the server.
  const allProducts = await getAllProducts(firestore);
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }
  
  const relatedProducts = getRelatedProducts(product, allProducts);
  
  // Render the client component and pass the fetched data as props.
  return <ProductClientPage product={product} relatedProducts={relatedProducts} />;
}
