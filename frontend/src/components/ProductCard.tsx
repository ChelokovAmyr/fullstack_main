'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { cartApi, wishlistApi } from '@/lib/api';
import { Product } from '@/lib/api';
import Modal from '@/components/Modal';

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
}

export default function ProductCard({ product, showWishlist = true }: ProductCardProps) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const { data: wishlistCheck } = useQuery({
    queryKey: ['wishlist', product.id],
    queryFn: () => wishlistApi.check(product.id),
    enabled: isAuthenticated && showWishlist,
  });

  const isInWishlist = wishlistCheck?.isInWishlist || false;

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.add(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Успешно',
        message: 'Товар добавлен в корзину!',
      });
    },
    onError: (error: any) => {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось добавить товар в корзину',
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.add(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', product.id] });
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Успешно',
        message: 'Товар добавлен в избранное!',
      });
    },
    onError: (error: any) => {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось добавить товар в избранное',
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.remove(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', product.id] });
    },
    onError: (error: any) => {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось удалить товар из избранного',
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setModal({
        isOpen: true,
        type: 'info',
        title: 'Требуется вход',
        message: 'Пожалуйста, войдите в систему, чтобы добавить товар в корзину',
      });
      return;
    }
    if (product.stock <= 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: 'Товар отсутствует в наличии',
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setModal({
        isOpen: true,
        type: 'info',
        title: 'Требуется вход',
        message: 'Пожалуйста, войдите в систему, чтобы добавить товар в избранное',
      });
      return;
    }
    if (isInWishlist) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  return (
    <>
      <div className="product-card">
        <Link href={`/products/${product.id}`} className="product-card-link">
          <div className="product-image-wrapper">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
            ) : (
              <div className="product-image-placeholder">Нет изображения</div>
            )}
            {product.stock <= 0 && (
              <div className="product-badge-out">Нет в наличии</div>
            )}
          </div>
          <div className="product-info">
            <div className="product-header">
              <h3 className="product-name">{product.name}</h3>
              {showWishlist && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlistToggle(e);
                  }}
                  className={`product-wishlist-btn ${isInWishlist ? 'active' : ''}`}
                  disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                  title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  {isInWishlist ? '★' : '☆'}
                </button>
              )}
            </div>
            
            {product.rating > 0 && (
              <div className="product-rating">
                <span className="rating-value">{Number(product.rating).toFixed(1)}</span>
                <span className="rating-count">({product.reviewCount})</span>
              </div>
            )}

            <div className="product-price-section">
              <div className="product-price">
                <span className="current-price">{Number(product.price).toLocaleString()} ₽</span>
                {product.oldPrice && (
                  <span className="old-price">{Number(product.oldPrice).toLocaleString()} ₽</span>
                )}
              </div>
              {product.stock > 0 && (
                <span className="product-stock-badge">В наличии</span>
              )}
            </div>
          </div>
        </Link>
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm product-add-btn"
            disabled={product.stock <= 0 || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? 'Добавление...' : product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        type={modal.type}
      >
        {modal.message}
      </Modal>
    </>
  );
}

