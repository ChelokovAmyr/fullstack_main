'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi, categoriesApi } from '@/lib/api';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => productsApi.getAll({ categoryId: selectedCategory || undefined, limit: 8 }),
  });

  return (
    <div className="container">
      <div className="hero">
        <h1>Добро пожаловать в наш интернет-магазин!</h1>
        <p>Широкий ассортимент товаров по выгодным ценам</p>
      </div>

      {categories && categories.length > 0 && (
        <div className="categories-section">
          <h2>Категории</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="category-card"
              >
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="products-section">
        <div className="section-header">
          <h2>Популярные товары</h2>
          <Link href="/products" className="view-all-link">
            Смотреть все →
          </Link>
        </div>

        {isLoading ? (
          <div className="loading">Загрузка...</div>
        ) : productsData?.products && productsData.products.length > 0 ? (
          <div className="products-grid">
            {productsData.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="product-card"
              >
                {product.images && product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                )}
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-price">
                    {product.oldPrice && (
                      <span className="old-price">{product.oldPrice} ₽</span>
                    )}
                    <span className="current-price">{product.price} ₽</span>
                  </div>
                  {product.rating > 0 && (
                    <div className="product-rating">
                      ⭐ {Number(product.rating).toFixed(1)} ({product.reviewCount})
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-products">Товары не найдены</div>
        )}
      </div>
    </div>
  );
}
