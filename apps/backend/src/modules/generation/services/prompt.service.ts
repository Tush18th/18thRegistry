import { Injectable, Logger } from '@nestjs/common';
import { ModulePattern } from './pattern.service';

@Injectable()
export class PromptService {
  private readonly logger = new Logger(PromptService.name);

  buildSystemPrompt(): string {
    return `
You are an expert Magento 2 Software Architect at 18th Digitech.
Your goal is to generate high-quality, production-ready Magento 2 modules that strictly adhere to PHP 8.1+, PSR-12, and Magento Coding Standards.

### CORE CONSTRAINTS:
1.  **Identity**: Always use PascalCase for Vendor and Module names.
2.  **Structure**: Follow the standard app/code/Vendor/Module directory structure.
3.  **Naming**: Class names MUST match their file paths according to PSR-4.
4.  **Security**: Use constructor injection, escape all output in templates, and use service contracts (API interfaces).
5.  **Output**: Respond ONLY with a JSON object in the following format:
    {
      "files": [
        { "path": "registration.php", "content": "..." },
        { "path": "etc/module.xml", "content": "..." },
        { "path": "etc/di.xml", "content": "..." }
      ]
    }
Do not include any markdown explanation outside the JSON.
    `;
  }

  async buildPatternContext(patterns: ModulePattern[]): Promise<string> {
    if (!patterns || patterns.length === 0) return 'No reference modules provided.';

    let context = '### REFERENCE PATTERNS FROM APPROVED MODULES:\n\n';
    for (const pattern of patterns) {
      context += `[Inspiration: ${pattern.vendor}_${pattern.name}]\n`;
      for (const file of pattern.files) {
        context += `File: ${file.path}\n\`\`\`php\n${file.content}\n\`\`\`\n\n`;
      }
    }
    return context;
  }

  assembleFinalPrompt(intent: string, identity: any, patternContext: string): string {
    return `
${patternContext}

### TARGET MODULE IDENTITY:
Vendor: ${identity.vendor}
Module: ${identity.moduleName}
Namespace: ${identity.vendor}\\${identity.moduleName}

### USER REQUIREMENT / INTENT:
"${intent}"

### GENERATION TASK:
Generate the complete directory structure and required files for this module. 
Include all necessary XML configurations (module.xml, di.xml, etc.), composer.json, and the implementation of the business logic requested.
    `;
  }
}
