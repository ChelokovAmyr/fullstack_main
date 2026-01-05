import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('wishlist')
@Unique(['userId', 'productId'])
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.wishlist, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Product, (product) => product.wishlistItems, { onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @CreateDateColumn()
  createdAt: Date;
}

