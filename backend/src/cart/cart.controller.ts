import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.cartService.findAll(req.user.id);
  }

  @Patch(':id')
  updateQuantity(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.cartService.updateQuantity(id, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }

  @Delete()
  clear(@Request() req) {
    return this.cartService.clear(req.user.id);
  }
}

