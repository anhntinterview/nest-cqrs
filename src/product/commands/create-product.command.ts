import { CreateProductDTO } from '../dto/create-product.dto';

export class CreateProductCommand {
  constructor(public readonly dto: CreateProductDTO) {}
}
