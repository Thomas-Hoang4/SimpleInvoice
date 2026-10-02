import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when payload matches existing user', async () => {
      const payload = { sub: 'user-uuid-1', email: 'reviewer@simpleinvoice.dev' };
      const user = {
        id: 'user-uuid-1',
        email: 'reviewer@simpleinvoice.dev',
        fullname: 'Reviewer User',
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      const result = await strategy.validate(payload);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullname: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const payload = { sub: 'missing-uuid', email: 'ghost@example.com' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
