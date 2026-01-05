'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { productsApi, cartApi, reviewsApi, wishlistApi, authApi } from '@/lib/api';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getAll(productId),
  });

  const { data: wishlistCheck } = useQuery({
    queryKey: ['wishlist', productId],
    queryFn: () => wishlistApi.check(productId),
    enabled: isAuthenticated,
  });

  const inWishlist = wishlistCheck?.isInWishlist || false;

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.add(productId, quantity),
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
    mutationFn: () => wishlistApi.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', productId] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', productId] });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: () => reviewsApi.create({ 
      productId, 
      rating, 
      comment: reviewComment.trim() || undefined 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setReviewComment('');
      setRating(5);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Успешно',
        message: 'Отзыв успешно добавлен!',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при добавлении отзыва';
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: errorMessage,
      });
    },
  });

  if (isLoading) {
    return <div className="container">Загрузка...</div>;
  }

  if (!product) {
    return <div className="container">Товар не найден</div>;
  }

  return (
    <div className="container">
      <Link href="/products" className="back-link">← Назад к каталогу</Link>

      <div className="product-detail">
        <div className="product-images">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="main-product-image"
            />
          ) : (
            <div className="no-image">Нет изображения</div>
          )}
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>

          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          <div className="product-price-section">
            {product.oldPrice && (
              <span className="old-price">{product.oldPrice} ₽</span>
            )}
            <span className="current-price">{product.price} ₽</span>
          </div>

          {product.rating > 0 && (
            <div className="product-rating">
              ⭐ {Number(product.rating).toFixed(1)} ({product.reviewCount} отзывов)
            </div>
          )}

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">В наличии ({product.stock} шт.)</span>
            ) : (
              <span className="out-of-stock">Нет в наличии</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <label>Количество:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="quantity-input"
                />
              </div>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => addToCartMutation.mutate()}
                    className="btn btn-primary"
                    disabled={addToCartMutation.isPending}
                  >
                    Добавить в корзину
                  </button>

                  {inWishlist ? (
                    <button
                      onClick={() => removeFromWishlistMutation.mutate()}
                      className="btn btn-secondary"
                    >
                      Удалить из избранного
                    </button>
                  ) : (
                    <button
                      onClick={() => addToWishlistMutation.mutate()}
                      className="btn btn-secondary"
                    >
                      Добавить в избранное
                    </button>
                  )}
                </>
              ) : (
                <Link href="/login" className="btn btn-primary">
                  Войдите, чтобы добавить в корзину
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h2>Отзывы ({reviews?.length || 0})</h2>

        {isAuthenticated && (
          <div className="add-review-form">
            <h3>Оставить отзыв</h3>
            <div className="rating-input">
              <label>Оценка:</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="rating-select"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ⭐
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Ваш отзыв..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="review-textarea"
            />
            <button
              onClick={() => createReviewMutation.mutate()}
              className="btn btn-primary"
              disabled={createReviewMutation.isPending}
            >
              Отправить отзыв
            </button>
          </div>
        )}

        <div className="reviews-list">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <strong>{review.user?.firstName || 'Пользователь'}</strong>
                  <span className="review-rating">
                    {'⭐'.repeat(review.rating)}
                  </span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p>{review.comment}</p>}
              </div>
            ))
          ) : (
            <p>Пока нет отзывов</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        type={modal.type}
      >
        <p>{modal.message}</p>
      </Modal>
    </div>
  );
}

