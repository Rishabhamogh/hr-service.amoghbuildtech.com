import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseErrorService } from './database-error.service';

describe('DatabaseErrorService', () => {
  let service: DatabaseErrorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseErrorService],
    }).compile();

    service = module.get<DatabaseErrorService>(DatabaseErrorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
