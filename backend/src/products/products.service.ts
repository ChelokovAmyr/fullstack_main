import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, SortField, SortOrder } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      sortBy = SortField.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 20,
    } = query;

    const where: FindOptionsWhere<Product> = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = Between(minPrice || 0, maxPrice || 999999);
    }

    if (minRating !== undefined) {
      where.rating = MoreThanOrEqual(minRating) as any;
    }

    const [products, total] = await this.productsRepository.findAndCount({
      where,
      relations: ['category', 'reviews'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'reviews', 'reviews.user'],
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productsRepository.update(id, updateProductDto);
  }

  remove(id: string) {
    return this.productsRepository.delete(id);
  }

  async updateRating(productId: string) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['reviews'],
    });

    if (!product || !product.reviews || product.reviews.length === 0) {
      return;
    }

    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / product.reviews.length;

    product.rating = Math.round(averageRating * 100) / 100;
    product.reviewCount = product.reviews.length;

    return this.productsRepository.save(product);
  }
}

