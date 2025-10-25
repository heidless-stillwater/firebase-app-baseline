'use server';

import { enhanceImage } from '@/ai/flows/automatically-enhance-uploaded-images';
import { generateStylisticVariations } from '@/ai/flows/generate-stylistic-variations';
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

async function uploadToStorage(dataUrl: string, userId: string): Promise<string> {
  const { firebaseApp } = initializeFirebase();
  const storage = getStorage(firebaseApp);
  const fileExtension = dataUrl.split(';')[0].split('/')[1];
  const storageRef = ref(storage, `images/${userId}/${Date.now()}.${fileExtension}`);
  const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(snapshot.ref);
}

export async function performImageUpload(dataUrl: string, userId: string, fileName: string): Promise<{ id: string; url: string }> {
  const { firestore } = initializeFirebase();
  const storageUrl = await uploadToStorage(dataUrl, userId);

  const imageDocRef = await addDoc(collection(firestore, 'users', userId, 'images'), {
    originalFileName: fileName,
    uploadDate: serverTimestamp(),
    storageUrl,
    mimeType: dataUrl.split(';')[0].split(':')[1],
    userId,
  });

  return { id: imageDocRef.id, url: storageUrl };
}


export async function performImageEnhancement(
  photoDataUri: string,
  userId: string,
  imageId: string
): Promise<string> {
  if (!photoDataUri) {
    throw new Error('No image data provided.');
  }
  try {
    const { firestore } = initializeFirebase();
    const result = await enhanceImage({ photoDataUri });
    const enhancedUrl = await uploadToStorage(result.enhancedPhotoDataUri, userId);

    await addDoc(
      collection(firestore, 'users', userId, 'images', imageId, 'enhancedImages'),
      {
        enhancementType: 'upscale_denoise',
        enhancementDate: serverTimestamp(),
        storageUrl: enhancedUrl,
        mimeType: result.enhancedPhotoDataUri.split(';')[0].split(':')[1],
      }
    );

    return enhancedUrl;
  } catch (e: any) {
    console.error('Enhancement failed:', e);
    throw new Error(`Failed to enhance image: ${e.message}`);
  }
}

export async function performVariationGeneration(
  photoDataUri: string,
  prompt: string,
  userId: string,
  imageId: string
): Promise<string[]> {
  if (!photoDataUri) {
    throw new Error('No image data provided.');
  }
  if (!prompt) {
    throw new Error('A prompt is required to generate variations.');
  }
  try {
    const { firestore } = initializeFirebase();
    const result = await generateStylisticVariations({ photoDataUri, prompt });

    const variationUrls = await Promise.all(
      result.stylisticVariations.map(async (variationDataUri) => {
        const url = await uploadToStorage(variationDataUri, userId);
        await addDoc(
          collection(firestore, 'users', userId, 'images', imageId, 'styleVariations'),
          {
            styleName: prompt,
            generationDate: serverTimestamp(),
            storageUrl: url,
            mimeType: variationDataUri.split(';')[0].split(':')[1],
          }
        );
        return url;
      })
    );

    return variationUrls;
  } catch (e: any) {
    console.error('Variation generation failed:', e);
    throw new Error(`Failed to generate variations: ${e.message}`);
  }
}

async function uploadFileToStorage(file: File, userId: string | 'anonymous'): Promise<string> {
  const { firebaseApp } = initializeFirebase();
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `attachments/${userId}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function submitContactForm(formData: FormData): Promise<{ success: boolean; message: string }> {
  const { firestore } = initializeFirebase();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const attachment = formData.get('attachment') as File;
  // This is a public form, so we can't assume a user is logged in.
  // We'll use 'anonymous' as the user ID for storage.
  const userId = 'anonymous';

  try {
    let attachmentUrl: string | null = null;
    if (attachment && attachment.size > 0) {
      attachmentUrl = await uploadFileToStorage(attachment, userId);
    }

    await addDoc(collection(firestore, 'contacts'), {
      name,
      email,
      message,
      attachmentUrl,
      submittedAt: serverTimestamp(),
    });

    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error: any) {
    console.error('Contact form submission failed:', error);
    return { success: false, message: `Failed to send message: ${error.message}` };
  }
}
