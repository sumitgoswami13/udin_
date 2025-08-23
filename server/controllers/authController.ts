import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types/api';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.registerUser(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };

      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };

      res.status(401).json(response);
    }
  }

  static async adminLogin(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.adminLogin(username, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'Admin login successful',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Admin login error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Admin login failed',
      };

      res.status(401).json(response);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshAccessToken(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Token refresh error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Token refresh failed',
      };

      res.status(401).json(response);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // In a more complex setup, you might want to blacklist the token
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      res.json(response);
    } catch (error) {
      console.error('Logout error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Logout failed',
      };

      res.status(500).json(response);
    }
  }
}