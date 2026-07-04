import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CvService } from './cv.service';

@ApiTags('cv')
@Controller('cv')
export class CvController {
  constructor(private readonly svc: CvService) {}

  /** POST /cv/generate-summary — Generate a professional summary from experience and skills */
  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate a professional summary from experience and skills' })
  generateSummary(@Body() data: { title?: string; skills: string[]; experience: { role: string; company: string; description: string }[] }) {
    return this.svc.generateSummary(data);
  }

  /** POST /cv/improve-description — Rewrite a job description to be more professional and impactful */
  @Post('improve-description')
  @ApiOperation({ summary: 'Improve/rewrite a job description bullet point' })
  improveDescription(@Body() data: { role: string; company: string; description: string }) {
    return this.svc.improveDescription(data);
  }

  /** POST /cv/suggest-skills — Suggest relevant skills based on the candidate's experience */
  @Post('suggest-skills')
  @ApiOperation({ summary: 'Suggest relevant skills based on experience' })
  suggestSkills(@Body() data: { title?: string; experience: { role: string; company: string; description: string }[] }) {
    return this.svc.suggestSkills(data);
  }
}
