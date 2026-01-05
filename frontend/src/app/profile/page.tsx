'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authApi, ordersApi, wishlistApi } from '@/lib/api';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'wishlist' || tab === 'orders' || tab === 'profile') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const { data: user } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
      });
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    enabled: isAuthenticated && activeTab === 'orders',
  });

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getAll,
    enabled: isAuthenticated && activeTab === 'wishlist',
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Успешно',
        message: 'Профиль обновлен',
      });
    },
    onError: (error: any) => {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось обновить профиль',
      });
    },
  });

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div>
          <h1>Личный кабинет</h1>
          {user && (
            <p className="profile-subtitle">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Выйти
        </button>
      </div>

      <div className="profile-tabs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
        >
          Профиль
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
        >
          Заказы
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`profile-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
        >
          Избранное
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-content-header">
            <h2>Мой профиль</h2>
            <p className="profile-content-description">
              Управляйте личной информацией и настройками аккаунта
            </p>
          </div>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="firstName">Имя</label>
              <input
                type="text"
                id="firstName"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Фамилия</label>
              <input
                type="text"
                id="lastName"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                disabled
                className="input-disabled"
              />
              <small className="form-hint">Email нельзя изменить</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input
                type="tel"
                id="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Адрес</label>
              <input
                type="text"
                id="address"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Город</label>
              <input
                type="text"
                id="city"
                value={profileData.city}
                onChange={(e) =>
                  setProfileData({ ...profileData, city: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Почтовый индекс</label>
              <input
                type="text"
                id="postalCode"
                value={profileData.postalCode}
                onChange={(e) =>
                  setProfileData({ ...profileData, postalCode: e.target.value })
                }
              />
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-content">
          <div className="profile-content-header">
            <h2>Мои заказы</h2>
            <p className="profile-content-description">
              История всех ваших заказов
            </p>
          </div>
          {orders && orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-card-info">
                      <div className="order-id">Заказ #{order.id.slice(0, 8)}</div>
                      <div className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <span className={`order-status status-${order.status}`}>
                      {order.status === 'pending' && 'В обработке'}
                      {order.status === 'processing' && 'Обрабатывается'}
                      {order.status === 'shipped' && 'Отправлен'}
                      {order.status === 'delivered' && 'Доставлен'}
                      {order.status === 'cancelled' && 'Отменен'}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="order-item-info">
                          <span className="order-item-name">{item.productName}</span>
                          <span className="order-item-quantity">× {item.quantity}</span>
                        </div>
                        <span className="order-item-price">
                          {(Number(item.price) * item.quantity).toLocaleString()} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="order-card-footer">
                    <div className="order-total">
                      <span>Итого:</span>
                      <span className="order-total-amount">{Number(order.total).toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>У вас пока нет заказов</h3>
              <p>Когда вы сделаете первый заказ, он появится здесь</p>
              <Link href="/products" className="btn btn-primary">
                Перейти к покупкам
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="wishlist-content">
          <div className="profile-content-header">
            <h2>Избранное</h2>
            <p className="profile-content-description">
              Товары, которые вы добавили в избранное
            </p>
          </div>
          {wishlist && wishlist.length > 0 ? (
            <div className="wishlist-grid">
              {wishlist.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/products/${item.product.id}`}
                  className="wishlist-item-card"
                >
                  <div className="wishlist-item-image-wrapper">
                    {item.product.images && item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="wishlist-item-image"
                      />
                    ) : (
                      <div className="wishlist-item-placeholder">Нет изображения</div>
                    )}
                  </div>
                  <div className="wishlist-item-info">
                    <h3 className="wishlist-item-name">{item.product.name}</h3>
                    <div className="wishlist-item-price">
                      {Number(item.product.price).toLocaleString()} ₽
                    </div>
                    {item.product.rating > 0 && (
                      <div className="wishlist-item-rating">
                        Рейтинг: {Number(item.product.rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Ваш список избранного пуст</h3>
              <p>Добавьте товары в избранное, чтобы они появились здесь</p>
              <Link href="/products" className="btn btn-primary">
                Перейти к покупкам
              </Link>
            </div>
          )}
        </div>
      )}

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

