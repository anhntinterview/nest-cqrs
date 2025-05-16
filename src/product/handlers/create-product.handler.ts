import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../commands/create-product.command';
import { ClientKafka } from '@nestjs/microservices';
import { ProductService } from '../product.service';
import { Inject } from '@nestjs/common';
import { CreateProductResponse, Product } from '../models/product.model';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    private readonly productService: ProductService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async execute(command: CreateProductCommand) {
    const product = (await this.productService.create(command.dto)) as Product;

    try {
      // Send Kafka & wait response from product-notification-service
      const response = await new Promise<CreateProductResponse>(
        (resolve, reject) => {
          const subcription = this.kafkaClient
            .send('product.created', product)
            .subscribe({
              next: (result) => {
                resolve(result);
                subcription.unsubscribe();
              },
              error: (err) => {
                reject(err instanceof Error ? err : new Error(String(err)));
              },
            });
        },
      );

      if (response && response.success) {
        return response;
      }
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? `Kafka send error: ${err.message}`
          : 'Unknown error',
      );
    }

    return product;
  }
}
