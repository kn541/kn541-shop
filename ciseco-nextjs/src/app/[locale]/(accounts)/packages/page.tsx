import { getPackageProducts } from '@/lib/api/products'
import PackagesPageClient from './PackagesPageClient'

export default async function PackagesPage() {
  const products = await getPackageProducts()
  return <PackagesPageClient initialProducts={products} />
}
