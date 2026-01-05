import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';

@Entity('products')
@Index(['name'])
@Index(['price'])
@Index(['category'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  sku: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn()
  category: Category;

  @Column()
  categoryId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Cart, (cart) => cart.product)
  cartItems: Cart[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlistItems: Wishlist[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

