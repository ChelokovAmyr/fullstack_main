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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  findAll(@Request() req) {
    // Admin can see all orders, users see only their own
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}

