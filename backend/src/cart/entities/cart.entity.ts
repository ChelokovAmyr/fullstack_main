import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

