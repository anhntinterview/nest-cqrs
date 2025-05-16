import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Product, User } from '@prisma/client';

@Controller()
export class AppController {
  @MessagePattern('user.created')
  handleUserCreated(@Payload() user: User) {
    console.log('🎯 [UserNotificationService] Received:', user);

    return {
      success: true,
      message: `User '${user.name}' created successfully`,
    };
  }

  @MessagePattern('product.created')
  handleProductCreated(@Payload() product: Product) {
    console.log('📦 [NotificationService] Received product:', product);

    return {
      succes: true,
      message: `Product ${product.name} created successfully`,
    };
  }
}
