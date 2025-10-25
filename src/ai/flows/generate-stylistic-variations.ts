// The code is valid Typescript.
'use server';
/**
 * @fileOverview Generates stylistic variations of an image using generative AI.
 *
 * - generateStylisticVariations - A function that takes an image and generates stylistic variations of it.
 * - GenerateStylisticVariationsInput - The input type for the generateStylisticVariations function.
 * - GenerateStylisticVariationsOutput - The return type for the generateStylisticVariations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStylisticVariationsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to generate stylistic variations from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  prompt: z.string().describe('A text prompt describing the desired stylistic variations.'),
});
export type GenerateStylisticVariationsInput = z.infer<typeof GenerateStylisticVariationsInputSchema>;

const GenerateStylisticVariationsOutputSchema = z.object({
  stylisticVariations: z
    .array(z.string())
    .describe('An array of data URIs representing the stylistic variations of the image.'),
});
export type GenerateStylisticVariationsOutput = z.infer<typeof GenerateStylisticVariationsOutputSchema>;

export async function generateStylisticVariations(
  input: GenerateStylisticVariationsInput
): Promise<GenerateStylisticVariationsOutput> {
  return generateStylisticVariationsFlow(input);
}

const generateStylisticVariationsPrompt = ai.definePrompt({
  name: 'generateStylisticVariationsPrompt',
  input: {schema: GenerateStylisticVariationsInputSchema},
  output: {schema: GenerateStylisticVariationsOutputSchema},
  prompt: [
    {media: {url: '{{{photoDataUri}}}'}},
    {text: 'Generate an image of this character in the style of: {{{prompt}}}'},
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
  },
});

const generateStylisticVariationsFlow = ai.defineFlow(
  {
    name: 'generateStylisticVariationsFlow',
    inputSchema: GenerateStylisticVariationsInputSchema,
    outputSchema: GenerateStylisticVariationsOutputSchema,
  },
  async input => {
    const stylisticVariations: string[] = [];
    for (let i = 0; i < 3; i++) {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {media: {url: input.photoDataUri}},
          {text: `Generate an image of this character in the style of: ${input.prompt}`},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      });
      if (media?.url) {
        stylisticVariations.push(media.url);
      }
    }
    return {stylisticVariations};
  }
);
