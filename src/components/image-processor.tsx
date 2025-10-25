'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirebaseApp, useFirestore } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

// Helper function to resize image using Canvas
const resizeImage = (file: File, maxWidth: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let newWidth = img.width;
        let newHeight = img.height;

        if (img.width > maxWidth) {
          const scale = maxWidth / img.width;
          newWidth = img.width * scale;
          newHeight = img.height * scale;
        }
        

        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, file.type);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export function ImageProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const { user } = useUser();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setOriginalImageUrl(URL.createObjectURL(file)); // Create local URL for preview
      setTransformedImageUrl(null); // Reset transformed image on new file selection
    } else {
      setSelectedFile(null);
      setOriginalImageUrl(null);
      setTransformedImageUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'No file selected or user not logged in.',
      });
      return;
    }
    setIsUploading(true);

    const storage = getStorage(firebaseApp);
    const timestamp = Date.now();
    const originalFileName = selectedFile.name;

    try {
      // 1. Upload original image
      const originalPath = `user-uploads/${user.uid}/${timestamp}-original-${originalFileName}`;
      const originalStorageRef = ref(storage, originalPath);
      const originalSnapshot = await uploadBytes(originalStorageRef, selectedFile);
      const originalDownloadURL = await getDownloadURL(originalSnapshot.ref);
      setOriginalImageUrl(originalDownloadURL);

      toast({
        title: 'Original Image Uploaded',
        description: 'Now processing and uploading the transformed version.',
      });

      // 2. Resize image
      const transformedBlob = await resizeImage(selectedFile, 400);

      // 3. Upload transformed image
      const transformedPath = `user-uploads/${user.uid}/${timestamp}-transformed-${originalFileName}`;
      const transformedStorageRef = ref(storage, transformedPath);
      const transformedSnapshot = await uploadBytes(transformedStorageRef, transformedBlob);
      const transformedDownloadURL = await getDownloadURL(transformedSnapshot.ref);
      setTransformedImageUrl(transformedDownloadURL);

      // 4. Save record to Firestore
      const imageRecordData = {
        userId: user.uid,
        originalImageUrl: originalDownloadURL,
        transformedImageUrl: transformedDownloadURL,
        originalFileName: originalFileName,
        timestamp: serverTimestamp(),
      };
      
      const collectionRef = collection(firestore, 'imageRecords');

      addDoc(collectionRef, imageRecordData)
        .then(() => {
          toast({
            title: 'Upload Complete',
            description: 'Original and transformed images have been saved.',
          });
        })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: imageRecordData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      // This will now only catch errors from storage uploads or resizing
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An unknown error occurred during the process.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Image Processor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="image-upload" className="font-medium text-sm">
            Select Image
          </label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {originalImageUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-center">Original</h3>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image
                  src={originalImageUrl}
                  alt="Original preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {transformedImageUrl && (
             <div className="space-y-2">
               <h3 className="text-sm font-medium text-center">Transformed (400px)</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <Image
                    src={transformedImageUrl}
                    alt="Transformed preview"
                    fill
                    className="object-contain"
                  />
                </div>
            </div>
          )}
        </div>


        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          { isUploading ? 'Uploading...' : 'Upload and Process Image'}
        </Button>
      </CardContent>
    </Card>
  );
}
