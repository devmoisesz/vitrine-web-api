import { BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodError, ZodObject } from "zod";
import { fromZodError } from "zod-validation-error";
import { ZodSchema } from "zod/v4";

export class ZodValidationPipes implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: ZodObject) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
            message: "Validation failed",
            statusCode: 400,
            errors: fromZodError(error),
        });
      }

      throw new BadRequestException("Validation failed");
    }

    return value
  }
}