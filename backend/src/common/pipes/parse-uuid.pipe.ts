import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUUID } from 'uuid';

/** Pipe that validates a string is a UUID v4; throws BadRequestException if invalid. */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  /** Validates the input string as a UUID; returns it unchanged or throws. */
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException(`Validation failed: "${value}" is not a valid UUID`);
    }
    return value;
  }
}
