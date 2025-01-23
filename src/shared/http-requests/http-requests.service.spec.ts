import { Test, TestingModule } from '@nestjs/testing';
import { HttpRequestsService } from './http-requests.service';

describe('HttpRequestsService', () => {
  let service: HttpRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpRequestsService],
    }).compile();

    service = module.get<HttpRequestsService>(HttpRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
