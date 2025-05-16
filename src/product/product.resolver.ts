import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Product } from './models/product.model';
import { CommandBus } from '@nestjs/cqrs';
import { ProductService } from './product.service';
import { CreateProductCommand } from './commands/create-product.command';
import { CreateProductInput } from './input/create-product.input';
import { User } from 'src/user/models/user.model';
import { UserService } from 'src/user/user.service';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [Product])
  async products() {
    return this.productService.findAll();
  }

  @Query(() => Product, { nullable: true })
  async product(@Args('id', { type: () => Int }) id: number) {
    return this.productService.findOne(id);
  }

  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.commandBus.execute(new CreateProductCommand(input));
  }

  @ResolveField(() => User)
  async owner(@Parent() product: Product) {
    return this.userService.findOne(product.ownerId);
  }
}
