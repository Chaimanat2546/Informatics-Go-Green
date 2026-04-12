import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class OAuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001'; // Default matching auth.controller

    // Redirect to login page on OAuth failure
    response.redirect(`${frontendUrl}/auth/login?error=access_denied`);
  }
}
