'use server';

import { enhanceImage } from '@/ai/flows/automatically-enhance-uploaded-images';
import { generateStylisticVariations } from '@/ai/flows/generate-stylistic-variations';

export async function performImageEnhancement(photoDataUri: string) {
  if (!photoDataUri) {
    throw new Error('No image data provided.');
  }
  try {
    const result = await enhanceImage({ photoDataUri });
    return result.enhancedPhotoDataUri;
  } catch (e: any) {
    console.error('Enhancement failed:', e);
    throw new Error(`Failed to enhance image: ${e.message}`);
  }
}

export async function performVariationGeneration(
  photoDataUri: string,
  prompt: string
) {
  if (!photoDataUri) {
    throw new Error('No image data provided.');
  }
  if (!prompt) {
    throw new Error('A prompt is required to generate variations.');
  }
  try {
    const result = await generateStylisticVariations({ photoDataUri, prompt });
    return result.stylisticVariations;
  } catch (e: any) {
    console.error('Variation generation failed:', e);
    throw new Error(`Failed to generate variations: ${e.message}`);
  }
}
