'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authApi, ordersApi, wishlistApi } from '@/lib/api';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function ProfilePage() {
  const router = useRouter();
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
      <h1>Личный кабинет</h1>

      <div className="profile-tabs">
        <button
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'active' : ''}
        >
          Профиль
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'active' : ''}
        >
          Заказы
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={activeTab === 'wishlist' ? 'active' : ''}
        >
          Избранное
        </button>
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content">
          <h2>Мой профиль</h2>
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
              />
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateProfileMutation.isPending}
            >
              Сохранить изменения
            </button>
          </form>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-content">
          <h2>Мои заказы</h2>
          {orders && orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Заказ #{order.id.slice(0, 8)}</span>
                    <span className={`order-status status-${order.status}`}>
                      {order.status === 'pending' && 'В обработке'}
                      {order.status === 'processing' && 'Обрабатывается'}
                      {order.status === 'shipped' && 'Отправлен'}
                      {order.status === 'delivered' && 'Доставлен'}
                      {order.status === 'cancelled' && 'Отменен'}
                    </span>
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <span>{item.productName} x {item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    Итого: {order.total.toLocaleString()} ₽
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>У вас пока нет заказов</p>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="wishlist-content">
          <h2>Избранное</h2>
          {wishlist && wishlist.length > 0 ? (
            <div className="wishlist-grid">
              {wishlist.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/products/${item.product.id}`}
                  className="wishlist-item"
                >
                  {item.product.images && item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="wishlist-image"
                    />
                  )}
                  <h3>{item.product.name}</h3>
                  <p className="price">{item.product.price} ₽</p>
                </Link>
              ))}
            </div>
          ) : (
            <p>Ваш список избранного пуст</p>
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

