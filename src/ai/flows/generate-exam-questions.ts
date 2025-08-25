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

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  options: z
    .array(z.string())
    .length(4)
    .describe('An array of exactly 4 possible answer options.'),
  correctAnswer: z
    .string()
    .describe('The correct answer, which must be one of the strings from the options array.'),
});

const GenerateExamQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated questions, each with options and a correct answer.'),
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
  
  For each question, provide:
  1. The question text.
  2. An array of 4 multiple-choice options.
  3. The correct answer, which must exactly match one of the provided options.

  Return the result as an array of question objects.
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
