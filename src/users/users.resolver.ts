import { Resolver, Query } from '@nestjs/graphql';
import { User } from './Entities/user.enitites';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }
}
