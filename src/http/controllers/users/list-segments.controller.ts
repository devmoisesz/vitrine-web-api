import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SegmentResponseSwaggerDto } from '@/http/zod/swagger/segments.swagger.dto';
import { Public } from '@/auth/public';
import { SegmentsService } from '@/use-cases/services/segments/segments.service';

@Controller('/segments')
@Public()
@ApiTags('Segments')
export class ListSegmentsController {
  constructor(private segments: SegmentsService) {}
  @Get()
  @ApiOkResponse({ type: [SegmentResponseSwaggerDto] })
  list() { return this.segments.list(); }
}
