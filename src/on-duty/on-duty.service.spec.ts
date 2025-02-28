import { Test, TestingModule } from '@nestjs/testing';
import { OnDutyService } from './on-duty.service';

describe('OnDutyService', () => {
  let service: OnDutyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnDutyService],
    }).compile();

    service = module.get<OnDutyService>(OnDutyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
