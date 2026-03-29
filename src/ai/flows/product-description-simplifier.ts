'use server';
/**
 * @fileOverview This file provides an AI tool to simplify complex technical product descriptions.
 *
 * - simplifyProductDescription - A function that simplifies technical product descriptions.
 * - ProductDescriptionSimplifierInput - The input type for the simplifyProductDescription function.
 * - ProductDescriptionSimplifierOutput - The return type for the simplifyProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDescriptionSimplifierInputSchema = z.object({
  technicalDescription: z
    .string()
    .describe(
      'A complex technical product description or specification that needs to be simplified.'
    ),
});
export type ProductDescriptionSimplifierInput = z.infer<
  typeof ProductDescriptionSimplifierInputSchema
>;

const ProductDescriptionSimplifierOutputSchema = z.object({
  simplifiedDescription: z
    .string()
    .describe(
      'The rephrased description, clear, simple, and jargon-free, suitable for middle-class customers and small businesses.'
    ),
});
export type ProductDescriptionSimplifierOutput = z.infer<
  typeof ProductDescriptionSimplifierOutputSchema
>;

export async function simplifyProductDescription(
  input: ProductDescriptionSimplifierInput
): Promise<ProductDescriptionSimplifierOutput> {
  return productDescriptionSimplifierFlow(input);
}

const simplifyProductDescriptionPrompt = ai.definePrompt({
  name: 'simplifyProductDescriptionPrompt',
  input: {schema: ProductDescriptionSimplifierInputSchema},
  output: {schema: ProductDescriptionSimplifierOutputSchema},
  prompt: `You are an expert content writer tasked with simplifying technical product descriptions.
Your goal is to rephrase complex technical product details and specifications into clear, simple, and jargon-free explanations.
Ensure the language is easily understandable and appealing to middle-class customers and small businesses.
Focus on benefits and practical use cases rather than intricate technical specifics.

Technical Description: """{{{technicalDescription}}}"""

Simplified Description:`,
});

const productDescriptionSimplifierFlow = ai.defineFlow(
  {
    name: 'productDescriptionSimplifierFlow',
    inputSchema: ProductDescriptionSimplifierInputSchema,
    outputSchema: ProductDescriptionSimplifierOutputSchema,
  },
  async input => {
    const {output} = await simplifyProductDescriptionPrompt(input);
    return output!;
  }
);
