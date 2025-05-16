import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  name: string;

  @Field(() => Float)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNumber()
  price: number;

  @Field({ nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  description?: string;

  @Field(() => Int)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsInt()
  ownerId: number;
}
