import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoginInput, LoginOutput } from 'src/users/dtos/login.dto';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './Entities/user.entities';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const { ok, error } = await this.usersService.createAccount(
        createAccountInput,
      );
      return { ok, error };
    } catch (e) {
      return {
        error: e,
        ok: false,
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  @Query(() => User)
  @UseGuards(AuthGuard)
  me() {}
}
