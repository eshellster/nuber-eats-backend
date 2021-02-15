import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.enities';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
