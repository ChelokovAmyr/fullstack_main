'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search, selectedCategory, sortBy, sortOrder, page],
    queryFn: () =>
      productsApi.getAll({
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 12,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="container">
      <h1>Каталог товаров</h1>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Найти
          </button>
        </form>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">Все категории</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="createdAt-DESC">Новинки</option>
            <option value="price-ASC">Цена: по возрастанию</option>
            <option value="price-DESC">Цена: по убыванию</option>
            <option value="rating-DESC">По рейтингу</option>
            <option value="name-ASC">По названию А-Я</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Загрузка...</div>
      ) : productsData?.products && productsData.products.length > 0 ? (
        <>
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
                  {product.stock > 0 ? (
                    <span className="in-stock">В наличии</span>
                  ) : (
                    <span className="out-of-stock">Нет в наличии</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {productsData.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-button"
              >
                Назад
              </button>
              <span>
                Страница {page} из {productsData.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(productsData.totalPages, p + 1))}
                disabled={page === productsData.totalPages}
                className="pagination-button"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-products">Товары не найдены</div>
      )}
    </div>
  );
}

