import { jest } from '@jest/globals';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch BadRequestException and format validation errors', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: ['dueDate must be on or after invoiceDate'],
      error: 'Bad Request',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['dueDate must be on or after invoiceDate'],
      error: 'Bad Request',
    });
  });

  it('should catch NotFoundException with string message', () => {
    const exception = new NotFoundException('Invoice not found');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Invoice not found',
      error: 'Not Found',
    });
  });

  it('should catch plain HttpException with string response', () => {
    const exception = new HttpException(
      'Forbidden Resource',
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 403,
      message: 'Forbidden Resource',
      error: 'Forbidden',
    });
  });

  it('should handle unhandled standard Error with 500 status code', () => {
    const error = new Error('Database connection failed');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Database connection failed',
      error: 'Internal Server Error',
    });
  });

  it('should handle unknown thrown object with 500 status code', () => {
    filter.catch('unknown string error', mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  });
});
