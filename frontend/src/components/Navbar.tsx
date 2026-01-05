'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { authApi, cartApi, wishlistApi, categoriesApi } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };

    if (isCatalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCatalogOpen]);

  const { data: user } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getAll,
    enabled: isAuthenticated,
  });

  const { data: wishlistItems } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getAll,
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          Магазин
        </Link>

        <div className="navbar-links">
          <div className="catalog-menu" ref={catalogRef}>
            <button
              className="catalog-button"
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              onMouseEnter={() => setIsCatalogOpen(true)}
            >
              Каталог
            </button>
            {isCatalogOpen && categories && categories.length > 0 && (
              <div className="catalog-dropdown" onMouseLeave={() => setIsCatalogOpen(false)}>
                <Link
                  href="/products"
                  className="catalog-dropdown-item"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  Все товары
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="catalog-dropdown-item"
                    onClick={() => setIsCatalogOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {isAuthenticated ? (
            <>
              <Link href="/cart" className="cart-link">
                Корзина {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <Link href="/profile?tab=wishlist" className="wishlist-link">
                Избранное {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
              </Link>
              <Link href="/profile">{user?.firstName || 'Профиль'}</Link>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Войти</Link>
              <Link href="/register">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

