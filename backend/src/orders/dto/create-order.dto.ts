import { IsString, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  quantity: string;

  @IsString()
  price: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  shippingAddress: string;

  @IsString()
  shippingCity: string;

  @IsString()
  shippingPostalCode: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

