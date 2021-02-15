import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // console.log(context);
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['req']['user'];
    // console.log(user);
    if (!user) {
      return false;
    }
    return true;
  }
}
