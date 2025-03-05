import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppConfigService } from 'libs/config/src';
import { JwtTokenService } from './jwt-token.service';

//
import { FacebookAuthService } from './facebook-auth.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  VerifyOTPDto,
  ResetPasswordDto,
} from './dto';
import { Public } from './public';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private appConfigService: AppConfigService,
    private tokenService: JwtTokenService,
    private readonly authService: AuthService,
    //
    private readonly facebookAuthService: FacebookAuthService,
  ) {}

  @Get('google')
  async googleLogin(@Res() res) {
    const url = this.authService.getGoogleAuthURL();
    res.redirect(url); // Redirect to Google's OAuth2 login page
  }

  @Post('register')
  @Public()
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @Public()
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('forgot-password')
  @Public()
  async forgotPasswoprd(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post('verify-otp')
  @Public()
  async verifyOtp(@Body() data: VerifyOTPDto) {
    return this.authService.verifyOtp(data);
  }

  @Post('reset-password')
  @Public()
  async forgotPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }
  // @Get('google/link-account')
  // async linkAccount(@Req() req) {
  //   const authHeader = req.headers['authorization'];
  //   const url = this.authService.getGoogleAuthURL(authHeader);
  //   return { url };
  // }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res,
  ) {
    const googleConfig = this.appConfigService.getGoogleConfig();
    let loggedInUser = null;
    if (state && state.startsWith('Bearer ')) {
      const token = state.split(' ')[1];
      loggedInUser = await this.tokenService.validateToken(token);
    }
    let result = null;
    if (loggedInUser) {
      result = await this.authService.googleCallback(code, loggedInUser);
    } else {
      result = await this.authService.googleCallback(code);
    }

    res.redirect(
      `${googleConfig.appUrl}?token=${result.jwtToken}&type=${result.type}`,
    );
  }

  // facebook

  @Get('facebook')
  async facebookLogin(@Res() res) {
    console.log('Route Called...');
    const url = this.facebookAuthService.getFacebookAuthURL();
    res.redirect(url);
  }

  @Get('facebook/callback')
  async facebookCallback(
    @Req() req,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res,
  ) {
    console.log('Headers:', req.headers);
    console.log('State:', state);

    const facebookConfig = this.appConfigService.getFacebookConfig();
    let loggedInUser = null;
    if (state && state.startsWith('Bearer ')) {
      const token = state.split(' ')[1];
      loggedInUser = await this.tokenService.validateToken(token);
    }

    const result = await this.authService.facebookCallback(code, loggedInUser);
    res.redirect(
      `${facebookConfig.appUrl}?token=${result.jwtToken}&type=${result.type}`,
    );
  }
}
