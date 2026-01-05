import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async addToWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      return existing;
    }

    const wishlistItem = this.wishlistRepository.create({
      userId,
      productId,
    });

    return this.wishlistRepository.save(wishlistItem);
  }

  findAll(userId: string) {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  remove(userId: string, productId: string) {
    return this.wishlistRepository.delete({ userId, productId });
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    return !!item;
  }
}

