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

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

