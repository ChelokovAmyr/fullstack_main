'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cartApi } from '@/lib/api';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getAll,
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartApi.updateQuantity(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: cartApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка корзины...</p>
        </div>
      </div>
    );
  }

  const total = cartItems?.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="container">
      <div className="cart-header">
        <h1>🛒 Корзина</h1>
        {cartItems && cartItems.length > 0 && (
          <p className="cart-subtitle">
            {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
          </p>
        )}
      </div>

      {cartItems && cartItems.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h2>Товары в корзине</h2>
              {cartItems.length > 0 && (
                <button
                  onClick={() => clearMutation.mutate()}
                  className="btn-clear-cart"
                  disabled={clearMutation.isPending}
                >
                  {clearMutation.isPending ? 'Очистка...' : '🗑️ Очистить корзину'}
                </button>
              )}
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <Link href={`/products/${item.product.id}`} className="cart-item-image-wrapper">
                    {item.product.images && item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="cart-item-image"
                      />
                    ) : (
                      <div className="cart-item-image-placeholder">📦</div>
                    )}
                  </Link>
                  
                  <div className="cart-item-details">
                    <Link href={`/products/${item.product.id}`} className="cart-item-name">
                      <h3>{item.product.name}</h3>
                    </Link>
                    <div className="cart-item-meta">
                      <span className="cart-item-unit-price">
                        {Number(item.product.price).toLocaleString()} ₽ за шт.
                      </span>
                      {item.product.stock > 0 && (
                        <span className="cart-item-stock">
                          В наличии: {item.product.stock} шт.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          updateQuantityMutation.mutate({
                            id: item.id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        className="quantity-btn quantity-btn-minus"
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const clampedValue = Math.max(1, Math.min(value, item.product.stock));
                          updateQuantityMutation.mutate({
                            id: item.id,
                            quantity: clampedValue,
                          });
                        }}
                        className="quantity-input"
                        disabled={updateQuantityMutation.isPending}
                      />
                      <button
                        onClick={() =>
                          updateQuantityMutation.mutate({
                            id: item.id,
                            quantity: Math.min(item.product.stock, item.quantity + 1),
                          })
                        }
                        className="quantity-btn quantity-btn-plus"
                        disabled={item.quantity >= item.product.stock || updateQuantityMutation.isPending}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price-total">
                      <span className="price-label">Сумма:</span>
                      <span className="price-value">
                        {(item.product.price * item.quantity).toLocaleString()} ₽
                      </span>
                    </div>

                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="btn-remove-item"
                      disabled={removeMutation.isPending}
                      title="Удалить из корзины"
                    >
                      {removeMutation.isPending ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-card">
            <h2 className="summary-title">Итого</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Товаров:</span>
                <span className="summary-value">{totalItems} шт.</span>
              </div>
              <div className="summary-row summary-row-total">
                <span>К оплате:</span>
                <span className="total-price">{total.toLocaleString()} ₽</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-checkout">
              Оформить заказ →
            </Link>
            <Link href="/products" className="link-continue-shopping">
              ← Продолжить покупки
            </Link>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары из каталога, чтобы они появились здесь</p>
          <Link href="/products" className="btn btn-primary btn-large">
            Перейти к покупкам
          </Link>
        </div>
      )}
    </div>
  );
}

