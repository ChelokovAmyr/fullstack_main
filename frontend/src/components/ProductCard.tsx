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
      setIsInWishlist(true);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
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
      setIsInWishlist(false);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setModal({
        isOpen: true,
        type: 'info',
        title: 'Вход required',
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
        title: 'Вход required',
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
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm"
            disabled={product.stock <= 0 || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? 'Добавление...' : 'В корзину'}
          </button>
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              className={`btn btn-icon ${isInWishlist ? 'btn-wishlist-active' : 'btn-wishlist'}`}
              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
              title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              {isInWishlist ? '❤️' : '🤍'}
            </button>
          )}
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

