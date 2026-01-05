'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, productsApi } from '@/lib/api';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const category = categories?.find((cat) => cat.id === categoryId);

  // Get product data if on product page
  const productId = pathname.startsWith('/products/') ? pathname.split('/products/')[1] : null;
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId!),
    enabled: !!productId,
  });

  const breadcrumbs = [];

  // Home
  breadcrumbs.push({ label: 'Главная', href: '/' });

  // Products page
  if (pathname === '/products') {
    if (category) {
      breadcrumbs.push({ label: 'Каталог', href: '/products' });
      breadcrumbs.push({ label: category.name, href: null });
    } else {
      breadcrumbs.push({ label: 'Каталог', href: null });
    }
  }

  // Product detail page
  if (pathname.startsWith('/products/') && productId) {
    breadcrumbs.push({ label: 'Каталог', href: '/products' });
    if (product) {
      if (product.category) {
        breadcrumbs.push({ 
          label: product.category.name, 
          href: `/products?category=${product.category.id}` 
        });
      }
      breadcrumbs.push({ label: product.name, href: null });
    } else {
      breadcrumbs.push({ label: 'Товар', href: null });
    }
  }

  // Cart page
  if (pathname === '/cart') {
    breadcrumbs.push({ label: 'Корзина', href: null });
  }

  // Checkout page
  if (pathname === '/checkout') {
    breadcrumbs.push({ label: 'Корзина', href: '/cart' });
    breadcrumbs.push({ label: 'Оформление заказа', href: null });
  }

  // Profile pages
  if (pathname === '/profile') {
    breadcrumbs.push({ label: 'Профиль', href: null });
  }

  // Login/Register pages
  if (pathname === '/login') {
    breadcrumbs.push({ label: 'Вход', href: null });
  }
  if (pathname === '/register') {
    breadcrumbs.push({ label: 'Регистрация', href: null });
  }

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumbs">
      <div className="container">
        <ol className="breadcrumbs-list">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="breadcrumbs-item">
              {crumb.href ? (
                <Link href={crumb.href} className="breadcrumbs-link">
                  {crumb.label}
                </Link>
              ) : (
                <span className="breadcrumbs-current">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="breadcrumbs-separator">/</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

