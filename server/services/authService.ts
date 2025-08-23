import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '30d';

  static generateTokens(user: IUser) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, this.JWT_SECRET) as any;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async registerUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    pinCode: string;
    password: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }]
      });

      if (existingUser) {
        throw new Error('User with this email or phone already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginUser(email: string, password: string) {
    try {
      // Find user with password field
      const user = await User.findOne({ email, isActive: true }).select('+password');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  static async adminLogin(username: string, password: string) {
    try {
      // Find admin user
      const admin = await User.findOne({
        $or: [{ email: username }, { phone: username }],
        role: 'admin',
        isActive: true
      }).select('+password');
      
      if (!admin) {
        throw new Error('Invalid admin credentials');
      }

      // Verify password
      const isValidPassword = await admin.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid admin credentials');
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate tokens with shorter expiry for admin
      const payload = {
        userId: admin._id,
        email: admin.email,
        role: admin.role,
      };

      const accessToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: '24h', // Shorter expiry for admin
      });

      return {
        user: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
        },
        accessToken,
      };
    } catch (error) {
      throw error;
    }
  }

  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}