import { Test, TestingModule } from '@nestjs/testing';
import { HRStausService } from './hr-status.service';

describe('OnDutyService', () => {
  let service: HRStausService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HRStausService],
    }).compile();

    service = module.get<HRStausService>(HRStausService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
