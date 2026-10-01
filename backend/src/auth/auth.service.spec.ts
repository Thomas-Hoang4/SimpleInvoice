import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'reviewer@101digital.io',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    fullname: 'Reviewer User',
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should validate credentials and return access token with user details', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.login({
        email: 'reviewer@101digital.io',
        password: 'Password123!',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'reviewer@101digital.io' },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        accessToken: 'mocked.jwt.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullname: mockUser.fullname,
          createdAt: mockUser.createdAt,
        },
      });
    });

    it('should throw UnauthorizedException when user email does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      await expect(
        service.login({
          email: 'reviewer@101digital.io',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUserById', () => {
    it('should return user details when ID exists', async () => {
      const publicUser = {
        id: mockUser.id,
        email: mockUser.email,
        fullname: mockUser.fullname,
        createdAt: mockUser.createdAt,
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(publicUser as any);

      const result = await service.validateUserById(mockUser.id);
      expect(result).toEqual(publicUser);
    });

    it('should throw UnauthorizedException when user ID does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.validateUserById('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
