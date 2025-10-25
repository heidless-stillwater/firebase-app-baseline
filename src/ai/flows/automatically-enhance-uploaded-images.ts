'use server';

/**
 * @fileOverview AI-powered image enhancement flow.
 *
 * - enhanceImage - A function that enhances the quality of an uploaded image.
 * - EnhanceImageInput - The input type for the enhanceImage function.
 * - EnhanceImageOutput - The return type for the enhanceImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to be enhanced, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;

const EnhanceImageOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      'The enhanced photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type EnhanceImageOutput = z.infer<typeof EnhanceImageOutputSchema>;

export async function enhanceImage(input: EnhanceImageInput): Promise<EnhanceImageOutput> {
  return enhanceImageFlow(input);
}

const enhanceImagePrompt = ai.definePrompt({
  name: 'enhanceImagePrompt',
  input: {schema: EnhanceImageInputSchema},
  output: {schema: EnhanceImageOutputSchema},
  prompt: `You are an AI image enhancement tool. Take the input image and enhance its quality, including upscaling and denoising.

Input Image: {{media url=photoDataUri}}

Output the enhanced image as a data URI.`,
});

const enhanceImageFlow = ai.defineFlow(
  {
    name: 'enhanceImageFlow',
    inputSchema: EnhanceImageInputSchema,
    outputSchema: EnhanceImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'enhance this image, upscale it and denoise it'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {enhancedPhotoDataUri: media!.url!};
  }
);
