'use server';

/**
 * @fileOverview An AI agent for generating exam descriptions.
 *
 * - generateExamDescription - A function that generates a description for an exam based on a topic.
 * - GenerateExamDescriptionInput - The input type for the generateExamDescription function.
 * - GenerateExamDescriptionOutput - The return type for the generateExamDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamDescriptionInputSchema = z.object({
  topic: z.string().describe('The topic of the exam.'),
});
export type GenerateExamDescriptionInput = z.infer<
  typeof GenerateExamDescriptionInputSchema
>;

const GenerateExamDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated exam description.'),
});
export type GenerateExamDescriptionOutput = z.infer<
  typeof GenerateExamDescriptionOutputSchema
>;

export async function generateExamDescription(
  input: GenerateExamDescriptionInput
): Promise<GenerateExamDescriptionOutput> {
  return generateExamDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExamDescriptionPrompt',
  input: {schema: GenerateExamDescriptionInputSchema},
  output: {schema: GenerateExamDescriptionOutputSchema},
  prompt: `You are an expert in creating engaging educational content.

  Generate a brief, one-paragraph description for an exam on the topic of {{{topic}}}.
  
  The description should be interesting and clearly inform the student about what the exam will cover.
  `,
});

const generateExamDescriptionFlow = ai.defineFlow(
  {
    name: 'generateExamDescriptionFlow',
    inputSchema: GenerateExamDescriptionInputSchema,
    outputSchema: GenerateExamDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
