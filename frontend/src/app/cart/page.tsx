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
    return <div className="container">Загрузка...</div>;
  }

  const total = cartItems?.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  return (
    <div className="container">
      <h1>Корзина</h1>

      {cartItems && cartItems.length > 0 ? (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <Link href={`/products/${item.product.id}`}>
                  {item.product.images && item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                  )}
                </Link>
                <div className="cart-item-info">
                  <Link href={`/products/${item.product.id}`}>
                    <h3>{item.product.name}</h3>
                  </Link>
                  <p className="cart-item-price">{item.product.price} ₽</p>
                </div>
                <div className="cart-item-actions">
                  <input
                    type="number"
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantityMutation.mutate({
                        id: item.id,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="quantity-input"
                  />
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
                </div>
                <div className="cart-item-total">
                  {(item.product.price * item.quantity).toLocaleString()} ₽
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Товаров:</span>
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="summary-row">
              <span>Итого:</span>
              <span className="total-price">{total.toLocaleString()} ₽</span>
            </div>
            <div className="cart-actions">
              <button
                onClick={() => clearMutation.mutate()}
                className="btn btn-secondary"
              >
                Очистить корзину
              </button>
              <Link href="/checkout" className="btn btn-primary">
                Оформить заказ
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <p>Ваша корзина пуста</p>
          <Link href="/products" className="btn btn-primary">
            Перейти к покупкам
          </Link>
        </div>
      )}
    </div>
  );
}

