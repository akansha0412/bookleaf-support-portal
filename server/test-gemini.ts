
import 'dotenv/config';
import { geminiService } from './src/services/gemini.service.js';

async function main() {
  try {
    const result = await geminiService.classifyTicket({
      subject: 'My ISBN is incorrect',
      description:
        'The ISBN displayed for my published book is incorrect, and this is affecting the book listing.',
    });

    console.log('Gemini classification:', result);
  } catch (error) {
    console.error(
      'Gemini test failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    process.exitCode = 1;
  }
}

await main();