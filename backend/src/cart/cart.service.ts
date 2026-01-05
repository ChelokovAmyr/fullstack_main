import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const existing = await this.cartRepository.findOne({
      where: {
        userId,
        productId: addToCartDto.productId,
      },
    });

    if (existing) {
      existing.quantity += addToCartDto.quantity;
      return this.cartRepository.save(existing);
    }

    const cartItem = this.cartRepository.create({
      userId,
      productId: addToCartDto.productId,
      quantity: addToCartDto.quantity,
    });

    return this.cartRepository.save(cartItem);
  }

  findAll(userId: string) {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
    });
  }

  async updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      return this.remove(id);
    }
    return this.cartRepository.update(id, { quantity });
  }

  remove(id: string) {
    return this.cartRepository.delete(id);
  }

  clear(userId: string) {
    return this.cartRepository.delete({ userId });
  }
}

