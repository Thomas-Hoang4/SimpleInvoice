import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    validateUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should delegate login to AuthService and return response', async () => {
      const loginDto = {
        email: 'reviewer@simpleinvoice.dev',
        password: 'Password123!',
      };
      const expectedResponse = {
        accessToken: 'mocked.jwt.token',
        user: {
          id: 'user-uuid-1',
          email: 'reviewer@simpleinvoice.dev',
          fullname: 'Reviewer User',
          createdAt: new Date('2026-10-01T00:00:00.000Z'),
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should delegate getProfile to AuthService with user id', async () => {
      const userParam = { id: 'user-uuid-1' };
      const expectedUser = {
        id: 'user-uuid-1',
        email: 'reviewer@simpleinvoice.dev',
        fullname: 'Reviewer User',
        createdAt: new Date(),
      };

      jest
        .spyOn(authService, 'validateUserById')
        .mockResolvedValue(expectedUser);

      const result = await controller.getProfile(userParam);
      expect(authService.validateUserById).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toEqual(expectedUser);
    });
  });
});
