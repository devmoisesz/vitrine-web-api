import { Body, Controller, Delete, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { SegmentBodySwaggerDto } from '@/http/zod/swagger/segments.swagger.dto';
import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { segmentBodySchema, type SegmentBody } from '@/http/zod/schema/segments';
import { SegmentsService } from '@/use-cases/services/segments/segments.service';

@Controller('/segments')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiBearerAuth()
@ApiTags('Segments')
export class SegmentsController {
  constructor(private segments: SegmentsService) {}

  @Post()
  @ApiBody({ type: SegmentBodySwaggerDto })
  @ApiConflictResponse({ description: 'Nome ou slug já cadastrado.' })
  create(@Body(new ZodValidationPipes(segmentBodySchema)) body: SegmentBody) {
    return this.segments.save(body);
  }

  @Put(':id')
  @ApiBody({ type: SegmentBodySwaggerDto })
  @ApiConflictResponse({ description: 'Nome ou slug já cadastrado.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body(new ZodValidationPipes(segmentBodySchema)) body: SegmentBody) {
    return this.segments.save(body, id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiConflictResponse({ description: 'Segmento associado a lojas; remova as associações antes de excluir.' })
  delete(@Param('id', new ParseUUIDPipe()) id: string) { return this.segments.delete(id); }
}
