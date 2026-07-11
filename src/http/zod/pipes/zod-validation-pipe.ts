import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import * as zod from "zod";

@Injectable()
export class ZodValidationPipes implements PipeTransform {
  constructor(private schema: zod.ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof zod.ZodError) {
        throw new BadRequestException({
          message: "Erro de validação nos dados enviados",
          statusCode: 400,
          errors: error.flatten().fieldErrors,
        });
      }

      throw new BadRequestException("Falha na validação dos dados");
    }
  }
}