import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    // Check if user already reviewed this product
    const existing = await this.reviewsRepository.findOne({
      where: {
        userId,
        productId: createReviewDto.productId,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      userId,
      productId: createReviewDto.productId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Update product rating
    await this.productsService.updateRating(createReviewDto.productId);

    return savedReview;
  }

  findAll(productId?: string) {
    const where: any = {};
    if (productId) {
      where.productId = productId;
    }
    return this.reviewsRepository.find({
      where,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
  }

  remove(id: string) {
    return this.reviewsRepository.delete(id);
  }
}

