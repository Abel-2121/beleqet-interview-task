import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);
  private readonly openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateSummary(data: { title?: string; skills: string[]; experience: { role: string; company: string; description: string }[] }) {
    const prompt = `You are a professional CV writer. Write a concise 3-4 sentence professional summary for a job candidate.

Candidate Details:
${data.title ? `- Current title: ${data.title}` : ''}
- Skills: ${data.skills.join(', ') || 'Not specified'}
- Experience: ${data.experience.map(e => `  * ${e.role} at ${e.company}: ${e.description || 'No description'}`).join('\n') || 'No experience listed'}

Write a compelling professional summary in first person. Keep it under 100 words.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional CV writer. Respond with only the summary text, no extra formatting.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });
      return { summary: completion.choices[0]?.message?.content?.trim() || '' };
    } catch (err) {
      this.logger.error(`OpenAI summary generation failed: ${(err as Error).message}`);
      return { summary: '' };
    }
  }

  async improveDescription(data: { role: string; company: string; description: string }) {
    const prompt = `Rewrite the following job description bullet point to be more professional, impactful, and achievement-oriented. Use action verbs and quantify results where possible. Keep it to 1-2 sentences.

Role: ${data.role}
Company: ${data.company}
Original: ${data.description}

Improved version:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional CV writer. Respond with only the rewritten text, no extra formatting or labels.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      return { improved: completion.choices[0]?.message?.content?.trim() || '' };
    } catch (err) {
      this.logger.error(`OpenAI improve-description failed: ${(err as Error).message}`);
      return { improved: '' };
    }
  }

  async suggestSkills(data: { title?: string; experience: { role: string; company: string; description: string }[] }) {
    const prompt = `Based on the following job history, suggest 8-12 relevant skills the candidate should include on their CV. Return only a comma-separated list of skills, no other text.

${data.title ? `Current title: ${data.title}` : ''}
Experience:
${data.experience.map(e => `- ${e.role} at ${e.company}: ${e.description || ''}`).join('\n')}

Skills:`;


    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a career coach. Respond with only a comma-separated list of skills.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content?.trim() || '';
      const skills = text.split(',').map(s => s.trim()).filter(Boolean);
      return { skills };
    } catch (err) {
      this.logger.error(`OpenAI suggest-skills failed: ${(err as Error).message}`);
      return { skills: [] };
    }
  }
}
