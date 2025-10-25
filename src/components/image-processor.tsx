'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirebaseApp } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ImageProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const { user } = useUser();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setOriginalImageUrl(URL.createObjectURL(file)); // Create local URL for preview
    } else {
      setSelectedFile(null);
      setOriginalImageUrl(null);
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
    const filePath = `user-uploads/${user.uid}/${Date.now()}-original-${selectedFile.name}`;
    const storageRef = ref(storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // We'll use this URL in the next steps.
      console.log('File available at', downloadURL);
      setOriginalImageUrl(downloadURL); // Update with the permanent URL

      toast({
        title: 'Upload Successful',
        description: 'Original image has been uploaded to Firebase Storage.',
      });
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An unknown error occurred.',
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

        {originalImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <Image
              src={originalImageUrl}
              alt="Selected preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Upload Image
        </Button>
      </CardContent>
    </Card>
  );
}
