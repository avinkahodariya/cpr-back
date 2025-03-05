// src/app.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserToken, Source, JwtUserPayload } from 'libs/schema/src';
import { CommonUtilsService } from 'libs/common-utils/src';
import { JwtTokenService } from './jwt-token.service';
import { GoogleAuthService } from './google-auth.service';
import * as bcrypt from 'bcrypt'; // Make sure to install bcrypt

//
import { FacebookAuthService } from './facebook-auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOTPDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private googleAuthService: GoogleAuthService,
    private tokenService: JwtTokenService,
    //
    private facebookAuthService: FacebookAuthService,
    // private eventService: EventService,
    @InjectModel('UserToken') private readonly userTokenModel: Model<UserToken>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  getGoogleAuthURL(token?: string): string {
    return this.googleAuthService.getGoogleAuthURL(token);
  }

  async googleCallback(code: string, loggedInUser: JwtUserPayload = null) {
    const tokens = await this.googleAuthService.getTokens(code);
    const user = await this.googleAuthService.verifyIdToken(tokens.idToken);

    let existingUser = null;
    if (loggedInUser) {
      existingUser = await this.userModel.findById(loggedInUser.id).lean();
    } else {
      existingUser = await this.userModel
        .findOne({ emailID: user.email })
        .lean();
    }

    const isExistingsUser = !!existingUser;
    if (!existingUser) {
      existingUser = await this.userModel.create({
        emailID: user.email,
        firstname: user.name.split(' ')[0] || '',
        lastname: user.name.split(' ')[1] || '',
        image: user.picture || '',
      });
    }
    // Save user token if not exists
    await this.userTokenModel.findOneAndUpdate(
      { emailID: user.email, source: Source.Google },
      {
        userID: existingUser._id.toString(),
        emailID: user.email,
        accessToken: CommonUtilsService.encrypt(tokens.accessToken),
        refreshToken: CommonUtilsService.encrypt(tokens.refreshToken),
        source: Source.Google,
      },
      { upsert: true },
    );

    const jwtToken = await this.tokenService.generateToken({
      ...user,
      _id: existingUser._id.toString(),
    });

    // if (!isExistingsUser) {
    //   const userToken = await this.userTokenModel
    //     .findOne({ emailID: user.email, source: Source.Google })
    //     .lean();
    //   this.eventService.fetchEvents(userToken, 365); // TODO: 12-15 months
    // }

    return {
      jwtToken,
      type: loggedInUser
        ? 'linked-account'
        : isExistingsUser
          ? 'old-account'
          : 'new-account',
    };
  }

  async forgotPassword(data: ForgotPasswordDto) {
    try {
      const existingUser = await this.userModel
        .findOne({ emailID: data.email })
        .lean();
      if (!existingUser) {
        throw new BadRequestException('User not found');
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(data: VerifyOTPDto) {
    try {
      const existingUser = await this.userModel
        .findOne({ emailID: data.email })
        .lean();
      if (!existingUser) {
        throw new BadRequestException('User not found');
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const existingUser = await this.userModel
        .findOne({ emailID: data.email })
        .lean();
      if (!existingUser) {
        throw new BadRequestException('User not found');
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    // Check if the user exists
    const existingUser = await this.userModel
      .findOne({ emailID: email })
      .lean();
    if (!existingUser) {
      throw new BadRequestException('Invalid email or password');
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    // Generate a JWT token
    const jwtToken = await this.tokenService.generateToken({
      ...existingUser,
      _id: existingUser._id.toString(),
    });

    return {
      jwtToken,
      type: 'existing-account', // As this is an existing user logging in
    };
  }

  async register(data: RegisterDto) {
    try {
      let existingUser = null;
      existingUser = await this.userModel
        .findOne({ emailID: data.email })
        .lean();
      console.log(
        '🚀 ~ auth.service.ts:124 ~ AuthService ~ register ~ existingUser:',
        existingUser,
      );
      const isExistingsUser = !!existingUser;
      if (isExistingsUser) {
        throw new BadRequestException(
          'User already exists with this email address',
        );
      }
      existingUser = await this.userModel.create({
        emailID: data.email,
        firstname: data.name.split(' ')[0] || '',
        lastname: data.name.split(' ')[1] || '',
        image: '',
        password: bcrypt.hashSync(data.password, 10),
      });
      // Save user token if not exists
      await this.userTokenModel.findOneAndUpdate(
        { emailID: data.email, source: Source.Manual },
        {
          userID: existingUser._id.toString(),
          emailID: data.email,
          accessToken: '',
          refreshToken: '',
          source: Source.Manual,
        },
        { upsert: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async facebookCallback(code: string, loggedInUser: JwtUserPayload = null) {
    const { accessToken, user } =
      await this.facebookAuthService.getTokens(code);

    let existingUser = loggedInUser
      ? await this.userModel.findById(loggedInUser.id).lean()
      : await this.userModel.findOne({ emailID: user.email }).lean();

    if (!existingUser) {
      existingUser = await this.userModel.create({
        emailID: user.email,
        firstname: user.name.split(' ')[0] || '',
        lastname: user.name.split(' ')[1] || '',
        image: user.picture.data.url || '',
      });
    }

    await this.userTokenModel.findOneAndUpdate(
      { emailID: user.email, source: Source.Facebook },
      {
        userID: existingUser._id.toString(),
        emailID: user.email,
        accessToken,
        source: Source.Facebook,
      },
      { upsert: true },
    );

    const jwtToken = await this.tokenService.generateToken({
      ...user,
      _id: existingUser._id.toString(),
    });

    return {
      jwtToken,
      type: loggedInUser
        ? 'linked-account'
        : existingUser
          ? 'old-account'
          : 'new-account',
    };
  }
}
