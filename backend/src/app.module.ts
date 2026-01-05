import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Cart } from './cart/entities/cart.entity';
import { Review } from './reviews/entities/review.entity';
import { Wishlist } from './wishlist/entities/wishlist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_DATABASE || 'my_fullstack_db',
      entities: [
        User,
        Category,
        Product,
        Order,
        OrderItem,
        Cart,
        Review,
        Wishlist,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: true,
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    ReviewsModule,
    WishlistModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

