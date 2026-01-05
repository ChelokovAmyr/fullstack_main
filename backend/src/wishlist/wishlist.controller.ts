import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findAll(@Request() req) {
    return this.wishlistService.findAll(req.user.id);
  }

  @Get(':productId/check')
  async check(@Request() req, @Param('productId') productId: string) {
    const isInWishlist = await this.wishlistService.isInWishlist(req.user.id, productId);
    return { isInWishlist };
  }

  @Post(':productId')
  async addToWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  remove(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.id, productId);
  }
}

