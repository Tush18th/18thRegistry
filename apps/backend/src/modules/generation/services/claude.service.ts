import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || 'mock-key';
  }

  async generateModule(systemPrompt: string, userPrompt: string): Promise<any> {
    if (this.apiKey === 'mock-key') {
      this.logger.warn('Using Mock AI Response (No API Key configured)');
      return this.getMockResponse();
    }

    try {
      this.logger.log(`Calling Claude 3.5 Sonnet... (Token Limit: 4096)`);
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          timeout: 60000, // 60s timeout for large generations
        }
      );

      const content = response.data.content[0].text;
      try {
        return JSON.parse(content);
      } catch (parseError) {
        this.logger.error('Failed to parse Claude JSON response:', content);
        throw new Error('AI returned malformed JSON structure');
      }
    } catch (error) {
      const errorData = error.response?.data || error.message;
      this.logger.error('Claude API call failed:', errorData);
      throw new Error(`AI Generation failed: ${error.message}`);
    }
  }

  private getMockResponse() {
    // Return a valid structured response for testing when no API key exists
    return {
      files: [
        {
          path: 'registration.php',
          content: '<?php \\Magento\\Framework\\Component\\ComponentRegistrar::register(\\Magento\\Framework\\Component\\ComponentRegistrar::MODULE, "Mock_Module", __DIR__);'
        },
        {
          path: 'etc/module.xml',
          content: '<?xml version="1.0"?><config><module name="Mock_Module" setup_version="1.0.0"/></config>'
        }
      ]
    };
  }
}
