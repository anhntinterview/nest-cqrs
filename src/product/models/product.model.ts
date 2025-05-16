import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/models/user.model';

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  ownerId: number;

  @Field(() => User)
  owner: User;
}

@ObjectType()
export class CreateProductResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
