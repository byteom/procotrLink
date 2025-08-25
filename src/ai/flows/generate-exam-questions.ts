'use server';

/**
 * @fileOverview An AI agent for generating exam questions based on a topic and difficulty level.
 *
 * - generateExamQuestions - A function that handles the exam question generation process.
 * - GenerateExamQuestionsInput - The input type for the generateExamQuestions function.
 * - GenerateExamQuestionsOutput - The return type for the generateExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate exam questions.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the exam questions.'),
  numberOfQuestions: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('The number of questions to generate.'),
});
export type GenerateExamQuestionsInput = z.infer<
  typeof GenerateExamQuestionsInputSchema
>;

const GenerateExamQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated questions.'),
});
export type GenerateExamQuestionsOutput = z.infer<
  typeof GenerateExamQuestionsOutputSchema
>;

export async function generateExamQuestions(
  input: GenerateExamQuestionsInput
): Promise<GenerateExamQuestionsOutput> {
  return generateExamQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExamQuestionsPrompt',
  input: {schema: GenerateExamQuestionsInputSchema},
  output: {schema: GenerateExamQuestionsOutputSchema},
  prompt: `You are an expert in creating exam questions.

  Generate {{numberOfQuestions}} exam questions on the topic of {{{topic}}} with a difficulty level of {{{difficulty}}}.
  The questions should be suitable for assessing knowledge and understanding of the topic.
  Return the questions in an array.
  `,
});

const generateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateExamQuestionsFlow',
    inputSchema: GenerateExamQuestionsInputSchema,
    outputSchema: GenerateExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
