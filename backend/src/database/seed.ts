import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Review } from '../reviews/entities/review.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'my_fullstack_db',
  entities: [User, Category, Product, Order, OrderItem, Cart, Review, Wishlist],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const categoryRepository = AppDataSource.getRepository(Category);
  const productRepository = AppDataSource.getRepository(Product);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  let admin = await userRepository.findOne({ where: { email: 'admin@shop.com' } });
  if (!admin) {
    admin = userRepository.create({
      email: 'admin@shop.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
    console.log('Admin user created');
  }

  // Create categories
  const categoriesData = [
    { name: 'Электроника', slug: 'electronics', description: 'Смартфоны, ноутбуки, планшеты, аксессуары' },
    { name: 'Одежда', slug: 'clothing', description: 'Мужская и женская одежда' },
    { name: 'Обувь', slug: 'shoes', description: 'Кроссовки, ботинки, туфли, сапоги' },
    { name: 'Дом и сад', slug: 'home-garden', description: 'Мебель, декор, садовый инвентарь' },
    { name: 'Спорт', slug: 'sports', description: 'Спортивные товары и инвентарь' },
    { name: 'Книги', slug: 'books', description: 'Художественная и научная литература' },
    { name: 'Красота и здоровье', slug: 'beauty-health', description: 'Косметика, парфюмерия, товары для здоровья' },
    { name: 'Игрушки и игры', slug: 'toys-games', description: 'Детские игрушки, настольные игры' },
    { name: 'Автомобили', slug: 'automotive', description: 'Автозапчасти, аксессуары для авто' },
    { name: 'Еда и напитки', slug: 'food-drinks', description: 'Продукты питания, напитки' },
  ];

  const categories: Category[] = [];
  for (const catData of categoriesData) {
    let category = await categoryRepository.findOne({ where: { slug: catData.slug } });
    if (!category) {
      category = categoryRepository.create(catData);
      category = await categoryRepository.save(category);
      console.log(`Category created: ${category.name}`);
    }
    categories.push(category);
  }

  // Create products
  const productsData = [
    // Electronics
    {
      name: 'iPhone 15 Pro',
      description: 'Новейший смартфон от Apple с процессором A17 Pro',
      price: 99990,
      oldPrice: 109990,
      stock: 50,
      categoryId: categories[0].id,
      sku: 'IPH15PRO',
      images: ['https://via.placeholder.com/400x400?text=iPhone+15+Pro'],
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Флагманский смартфон Samsung с камерой 200 МП',
      price: 79990,
      oldPrice: 89990,
      stock: 40,
      categoryId: categories[0].id,
      sku: 'SGS24',
      images: ['https://via.placeholder.com/400x400?text=Galaxy+S24'],
    },
    {
      name: 'MacBook Pro 16"',
      description: 'Профессиональный ноутбук с чипом M3 Pro',
      price: 249990,
      stock: 20,
      categoryId: categories[0].id,
      sku: 'MBP16M3',
      images: ['https://via.placeholder.com/400x400?text=MacBook+Pro'],
    },
    {
      name: 'iPad Air',
      description: 'Планшет с дисплеем 10.9 дюймов',
      price: 59990,
      stock: 30,
      categoryId: categories[0].id,
      sku: 'IPADAIR',
      images: ['https://via.placeholder.com/400x400?text=iPad+Air'],
    },
    {
      name: 'AirPods Pro 2',
      description: 'Беспроводные наушники с активным шумоподавлением',
      price: 24990,
      stock: 100,
      categoryId: categories[0].id,
      sku: 'APP2',
      images: ['https://via.placeholder.com/400x400?text=AirPods+Pro'],
    },
    // Clothing
    {
      name: 'Джинсы классические',
      description: 'Классические джинсы из денима премиум качества',
      price: 4990,
      oldPrice: 6990,
      stock: 80,
      categoryId: categories[1].id,
      sku: 'JEANS001',
      images: ['https://via.placeholder.com/400x400?text=Jeans'],
    },
    {
      name: 'Футболка хлопковая',
      description: 'Мягкая футболка из 100% хлопка',
      price: 1990,
      stock: 150,
      categoryId: categories[1].id,
      sku: 'TSHIRT001',
      images: ['https://via.placeholder.com/400x400?text=T-Shirt'],
    },
    {
      name: 'Куртка зимняя',
      description: 'Теплая зимняя куртка с утеплителем',
      price: 8990,
      oldPrice: 12990,
      stock: 60,
      categoryId: categories[1].id,
      sku: 'JACKET001',
      images: ['https://via.placeholder.com/400x400?text=Jacket'],
    },
    // Shoes
    {
      name: 'Кроссовки спортивные',
      description: 'Удобные кроссовки для бега и тренировок',
      price: 5990,
      oldPrice: 7990,
      stock: 70,
      categoryId: categories[2].id,
      sku: 'SNEAKERS001',
      images: ['https://via.placeholder.com/400x400?text=Sneakers'],
    },
    {
      name: 'Ботинки кожаные',
      description: 'Классические кожаные ботинки',
      price: 8990,
      stock: 50,
      categoryId: categories[2].id,
      sku: 'BOOTS001',
      images: ['https://via.placeholder.com/400x400?text=Boots'],
    },
    // Home & Garden
    {
      name: 'Диван угловой',
      description: 'Удобный угловой диван для гостиной',
      price: 49990,
      oldPrice: 59990,
      stock: 15,
      categoryId: categories[3].id,
      sku: 'SOFA001',
      images: ['https://via.placeholder.com/400x400?text=Sofa'],
    },
    {
      name: 'Стол обеденный',
      description: 'Деревянный обеденный стол на 6 персон',
      price: 29990,
      stock: 20,
      categoryId: categories[3].id,
      sku: 'TABLE001',
      images: ['https://via.placeholder.com/400x400?text=Table'],
    },
    // Sports
    {
      name: 'Гантели набор',
      description: 'Набор разборных гантелей 2x20 кг',
      price: 4990,
      stock: 40,
      categoryId: categories[4].id,
      sku: 'DUMBBELLS001',
      images: ['https://via.placeholder.com/400x400?text=Dumbbells'],
    },
    {
      name: 'Велосипед горный',
      description: 'Горный велосипед 21 скорость',
      price: 29990,
      oldPrice: 34990,
      stock: 10,
      categoryId: categories[4].id,
      sku: 'BIKE001',
      images: ['https://via.placeholder.com/400x400?text=Bike'],
    },
    // Books
    {
      name: 'Война и мир',
      description: 'Роман-эпопея Льва Толстого',
      price: 990,
      stock: 200,
      categoryId: categories[5].id,
      sku: 'BOOK001',
      images: ['https://via.placeholder.com/400x400?text=Book'],
    },
    {
      name: 'Преступление и наказание',
      description: 'Роман Федора Достоевского',
      price: 890,
      stock: 180,
      categoryId: categories[5].id,
      sku: 'BOOK002',
      images: ['https://via.placeholder.com/400x400?text=Book'],
    },
    {
      name: 'Мастер и Маргарита',
      description: 'Роман Михаила Булгакова',
      price: 950,
      stock: 150,
      categoryId: categories[5].id,
      sku: 'BOOK003',
      images: ['https://via.placeholder.com/400x400?text=Book'],
    },
    {
      name: '1984',
      description: 'Антиутопический роман Джорджа Оруэлла',
      price: 850,
      stock: 120,
      categoryId: categories[5].id,
      sku: 'BOOK004',
      images: ['https://via.placeholder.com/400x400?text=Book'],
    },
    // More Electronics
    {
      name: 'Xiaomi Redmi Note 13',
      description: 'Смартфон с камерой 108 МП и быстрой зарядкой',
      price: 24990,
      oldPrice: 29990,
      stock: 75,
      categoryId: categories[0].id,
      sku: 'XIAOMI13',
      images: ['https://via.placeholder.com/400x400?text=Xiaomi'],
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Беспроводные наушники с шумоподавлением',
      price: 34990,
      oldPrice: 39990,
      stock: 45,
      categoryId: categories[0].id,
      sku: 'SONYWH5',
      images: ['https://via.placeholder.com/400x400?text=Sony'],
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Умные часы с GPS и пульсометром',
      price: 44990,
      stock: 60,
      categoryId: categories[0].id,
      sku: 'AWATCH9',
      images: ['https://via.placeholder.com/400x400?text=Apple+Watch'],
    },
    {
      name: 'Dell XPS 15',
      description: 'Ноутбук 15.6" с процессором Intel i7',
      price: 149990,
      oldPrice: 169990,
      stock: 25,
      categoryId: categories[0].id,
      sku: 'DELLXPS15',
      images: ['https://via.placeholder.com/400x400?text=Dell+XPS'],
    },
    {
      name: 'Samsung 4K TV 55"',
      description: 'Телевизор 55 дюймов с поддержкой 4K HDR',
      price: 69990,
      oldPrice: 89990,
      stock: 30,
      categoryId: categories[0].id,
      sku: 'SAMSUNGTV55',
      images: ['https://via.placeholder.com/400x400?text=Samsung+TV'],
    },
    // More Clothing
    {
      name: 'Свитер шерстяной',
      description: 'Теплый свитер из натуральной шерсти',
      price: 3990,
      oldPrice: 5990,
      stock: 90,
      categoryId: categories[1].id,
      sku: 'SWEATER001',
      images: ['https://via.placeholder.com/400x400?text=Sweater'],
    },
    {
      name: 'Платье вечернее',
      description: 'Элегантное вечернее платье',
      price: 7990,
      stock: 40,
      categoryId: categories[1].id,
      sku: 'DRESS001',
      images: ['https://via.placeholder.com/400x400?text=Dress'],
    },
    {
      name: 'Брюки классические',
      description: 'Классические брюки для офиса',
      price: 3490,
      stock: 100,
      categoryId: categories[1].id,
      sku: 'PANTS001',
      images: ['https://via.placeholder.com/400x400?text=Pants'],
    },
    {
      name: 'Пиджак деловой',
      description: 'Классический деловой пиджак',
      price: 8990,
      oldPrice: 11990,
      stock: 55,
      categoryId: categories[1].id,
      sku: 'JACKET002',
      images: ['https://via.placeholder.com/400x400?text=Suit+Jacket'],
    },
    // More Shoes
    {
      name: 'Туфли классические',
      description: 'Классические мужские туфли',
      price: 6990,
      stock: 65,
      categoryId: categories[2].id,
      sku: 'SHOES001',
      images: ['https://via.placeholder.com/400x400?text=Classic+Shoes'],
    },
    {
      name: 'Сапоги зимние',
      description: 'Теплые зимние сапоги',
      price: 5990,
      oldPrice: 7990,
      stock: 80,
      categoryId: categories[2].id,
      sku: 'BOOTS002',
      images: ['https://via.placeholder.com/400x400?text=Winter+Boots'],
    },
    {
      name: 'Кроссовки беговые',
      description: 'Профессиональные беговые кроссовки',
      price: 7990,
      stock: 50,
      categoryId: categories[2].id,
      sku: 'RUNNERS001',
      images: ['https://via.placeholder.com/400x400?text=Running+Shoes'],
    },
    // More Home & Garden
    {
      name: 'Кресло офисное',
      description: 'Эргономичное офисное кресло',
      price: 19990,
      oldPrice: 24990,
      stock: 35,
      categoryId: categories[3].id,
      sku: 'CHAIR001',
      images: ['https://via.placeholder.com/400x400?text=Office+Chair'],
    },
    {
      name: 'Шкаф-купе',
      description: 'Вместительный шкаф-купе 3 двери',
      price: 39990,
      stock: 12,
      categoryId: categories[3].id,
      sku: 'WARDROBE001',
      images: ['https://via.placeholder.com/400x400?text=Wardrobe'],
    },
    {
      name: 'Лампа настольная',
      description: 'Современная настольная лампа с LED',
      price: 2990,
      stock: 120,
      categoryId: categories[3].id,
      sku: 'LAMP001',
      images: ['https://via.placeholder.com/400x400?text=Table+Lamp'],
    },
    {
      name: 'Ковер персидский',
      description: 'Роскошный персидский ковер ручной работы',
      price: 89990,
      stock: 8,
      categoryId: categories[3].id,
      sku: 'CARPET001',
      images: ['https://via.placeholder.com/400x400?text=Persian+Carpet'],
    },
    // More Sports
    {
      name: 'Беговая дорожка',
      description: 'Электрическая беговая дорожка',
      price: 89990,
      oldPrice: 119990,
      stock: 15,
      categoryId: categories[4].id,
      sku: 'TREADMILL001',
      images: ['https://via.placeholder.com/400x400?text=Treadmill'],
    },
    {
      name: 'Мяч футбольный',
      description: 'Профессиональный футбольный мяч',
      price: 2990,
      stock: 200,
      categoryId: categories[4].id,
      sku: 'FOOTBALL001',
      images: ['https://via.placeholder.com/400x400?text=Football'],
    },
    {
      name: 'Ракетка теннисная',
      description: 'Профессиональная теннисная ракетка',
      price: 8990,
      stock: 60,
      categoryId: categories[4].id,
      sku: 'TENNIS001',
      images: ['https://via.placeholder.com/400x400?text=Tennis+Racket'],
    },
    {
      name: 'Гиря 24 кг',
      description: 'Чугунная гиря для тренировок',
      price: 2990,
      stock: 85,
      categoryId: categories[4].id,
      sku: 'KETTLEBELL001',
      images: ['https://via.placeholder.com/400x400?text=Kettlebell'],
    },
    // Beauty & Health
    {
      name: 'Крем для лица',
      description: 'Увлажняющий крем для лица с гиалуроновой кислотой',
      price: 1990,
      stock: 150,
      categoryId: categories[6].id,
      sku: 'CREAM001',
      images: ['https://via.placeholder.com/400x400?text=Face+Cream'],
    },
    {
      name: 'Парфюм мужской',
      description: 'Элитный мужской парфюм 100 мл',
      price: 5990,
      oldPrice: 7990,
      stock: 70,
      categoryId: categories[6].id,
      sku: 'PERFUME001',
      images: ['https://via.placeholder.com/400x400?text=Perfume'],
    },
    {
      name: 'Шампунь для волос',
      description: 'Восстанавливающий шампунь для всех типов волос',
      price: 890,
      stock: 200,
      categoryId: categories[6].id,
      sku: 'SHAMPOO001',
      images: ['https://via.placeholder.com/400x400?text=Shampoo'],
    },
    // Toys & Games
    {
      name: 'Конструктор LEGO',
      description: 'Большой набор конструктора LEGO',
      price: 4990,
      stock: 95,
      categoryId: categories[7].id,
      sku: 'LEGO001',
      images: ['https://via.placeholder.com/400x400?text=LEGO'],
    },
    {
      name: 'Монополия',
      description: 'Классическая настольная игра Монополия',
      price: 2990,
      stock: 80,
      categoryId: categories[7].id,
      sku: 'MONOPOLY001',
      images: ['https://via.placeholder.com/400x400?text=Monopoly'],
    },
    {
      name: 'Кукла Барби',
      description: 'Кукла Барби с аксессуарами',
      price: 1990,
      stock: 120,
      categoryId: categories[7].id,
      sku: 'BARBIE001',
      images: ['https://via.placeholder.com/400x400?text=Barbie'],
    },
    // Automotive
    {
      name: 'Автомобильные коврики',
      description: 'Комплект ковриков в салон автомобиля',
      price: 1990,
      stock: 150,
      categoryId: categories[8].id,
      sku: 'MATS001',
      images: ['https://via.placeholder.com/400x400?text=Car+Mats'],
    },
    {
      name: 'Чехол на руль',
      description: 'Кожаный чехол на рулевое колесо',
      price: 1490,
      stock: 100,
      categoryId: categories[8].id,
      sku: 'STEERING001',
      images: ['https://via.placeholder.com/400x400?text=Steering+Wheel'],
    },
    // Food & Drinks
    {
      name: 'Кофе в зернах',
      description: 'Премиум кофе в зернах, 1 кг',
      price: 1490,
      stock: 200,
      categoryId: categories[9].id,
      sku: 'COFFEE001',
      images: ['https://via.placeholder.com/400x400?text=Coffee'],
    },
    {
      name: 'Чай зеленый',
      description: 'Элитный зеленый чай, 200 г',
      price: 890,
      stock: 180,
      categoryId: categories[9].id,
      sku: 'TEA001',
      images: ['https://via.placeholder.com/400x400?text=Green+Tea'],
    },
  ];

  for (const prodData of productsData) {
    const existing = await productRepository.findOne({ where: { sku: prodData.sku } });
    if (!existing) {
      const product = productRepository.create({
        ...prodData,
        isActive: true,
        rating: 0,
        reviewCount: 0,
      });
      await productRepository.save(product);
      console.log(`Product created: ${product.name}`);
    }
  }

  console.log('Seed completed!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

