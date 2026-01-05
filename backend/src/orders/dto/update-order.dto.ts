import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  shippingCity?: string;

  @IsOptional()
  @IsString()
  shippingPostalCode?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

