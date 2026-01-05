'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cartApi, ordersApi, authApi } from '@/lib/api';
import Modal from '@/components/Modal';

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingPhone: '',
    notes: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/login');
    } else {
      // Load user profile to pre-fill address
      authApi.getProfile().then((user) => {
        if (user.address) setFormData((f) => ({ ...f, shippingAddress: user.address || '' }));
        if (user.city) setFormData((f) => ({ ...f, shippingCity: user.city || '' }));
        if (user.postalCode) setFormData((f) => ({ ...f, shippingPostalCode: user.postalCode || '' }));
        if (user.phone) setFormData((f) => ({ ...f, shippingPhone: user.phone || '' }));
      });
    }
  }, [router]);

  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getAll,
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      cartApi.clear();
      router.push('/profile/orders');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: 'Корзина пуста',
      });
      return;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity.toString(),
      price: item.product.price.toString(),
    }));

    createOrderMutation.mutate({
      items: orderItems,
      ...formData,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;
  const shippingCost = 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="container">
      <h1>Оформление заказа</h1>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Данные доставки</h2>

          <div className="form-group">
            <label htmlFor="shippingAddress">Адрес</label>
            <input
              type="text"
              id="shippingAddress"
              value={formData.shippingAddress}
              onChange={(e) =>
                setFormData({ ...formData, shippingAddress: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shippingCity">Город</label>
            <input
              type="text"
              id="shippingCity"
              value={formData.shippingCity}
              onChange={(e) =>
                setFormData({ ...formData, shippingCity: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shippingPostalCode">Почтовый индекс</label>
            <input
              type="text"
              id="shippingPostalCode"
              value={formData.shippingPostalCode}
              onChange={(e) =>
                setFormData({ ...formData, shippingPostalCode: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shippingPhone">Телефон</label>
            <input
              type="tel"
              id="shippingPhone"
              value={formData.shippingPhone}
              onChange={(e) =>
                setFormData({ ...formData, shippingPhone: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Примечания к заказу</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Ваш заказ</h2>
          <div className="order-items">
            {cartItems?.map((item) => (
              <div key={item.id} className="order-item">
                <span>{item.product.name} x {item.quantity}</span>
                <span>{(item.product.price * item.quantity).toLocaleString()} ₽</span>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Товары:</span>
              <span>{subtotal.toLocaleString()} ₽</span>
            </div>
            <div className="total-row">
              <span>Доставка:</span>
              <span>{shippingCost.toLocaleString()} ₽</span>
            </div>
            <div className="total-row">
              <span>НДС (10%):</span>
              <span>{tax.toLocaleString()} ₽</span>
            </div>
            <div className="total-row total">
              <span>Итого:</span>
              <span>{total.toLocaleString()} ₽</span>
            </div>
          </div>
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

