import { Test, TestingModule } from '@nestjs/testing';
import { OnDutyController } from './hr-status.controller';

describe('OnDutyController', () => {
  let controller: OnDutyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnDutyController],
    }).compile();

    controller = module.get<OnDutyController>(OnDutyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
