'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  performImageUpload,
  performImageEnhancement,
  performVariationGeneration,
} from '@/app/actions';
import { ControlPanel } from '@/components/control-panel';
import { ImageWorkspace } from '@/components/image-workspace';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';

export default function Home() {
  const [originalImage, setOriginalImage] = React.useState<{ id: string; url: string } | null>(null);
  const [enhancedImage, setEnhancedImage] = React.useState<string | null>(null);
  const [variations, setVariations] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const imagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'images'), orderBy('uploadDate', 'desc'));
  }, [firestore, user]);

  const { data: images, isLoading: isLoadingImages } = useCollection(imagesQuery);

  const enhancedImagesQuery = useMemoFirebase(() => {
    if (!user || !originalImage) return null;
    return query(collection(firestore, 'users', user.uid, 'images', originalImage.id, 'enhancedImages'), orderBy('enhancementDate', 'desc'));
  }, [firestore, user, originalImage]);

  const { data: enhancedImages } = useCollection(enhancedImagesQuery);

  const styleVariationsQuery = useMemoFirebase(() => {
    if (!user || !originalImage) return null;
    return query(collection(firestore, 'users', user.uid, 'images', originalImage.id, 'styleVariations'), orderBy('generationDate', 'desc'));
  }, [firestore, user, originalImage]);

  const { data: styleVariations } = useCollection(styleVariationsQuery);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  React.useEffect(() => {
    if (images && images.length > 0 && !originalImage) {
      const latestImage = images[0];
      setOriginalImage({ id: latestImage.id, url: latestImage.storageUrl });
    }
  }, [images, originalImage]);

  React.useEffect(() => {
    if (enhancedImages && enhancedImages.length > 0) {
      setEnhancedImage(enhancedImages[0].storageUrl);
    } else {
      setEnhancedImage(null);
    }
  }, [enhancedImages]);

  React.useEffect(() => {
    if (styleVariations) {
      setVariations(styleVariations.map(v => v.storageUrl));
    } else {
      setVariations([]);
    }
  }, [styleVariations]);


  const handleImageSelect = async (dataUrl: string, file: File) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const { id, url } = await performImageUpload(dataUrl, user.uid, file.name);
      setOriginalImage({ id, url });
      setEnhancedImage(null);
      setVariations([]);
      toast({
        title: 'Image Uploaded',
        description: 'Your image has been successfully uploaded and saved.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleEnhance = async () => {
    if (!originalImage || !user) return;
    setIsProcessing(true);
    try {
      const result = await performImageEnhancement(originalImage.url, user.uid, originalImage.id);
      setEnhancedImage(result);
      toast({
        title: 'Enhancement Complete',
        description: 'Your image has been successfully enhanced.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVariations = async (prompt: string) => {
    if (!originalImage || !user) return;
    setIsProcessing(true);
    try {
      const results = await performVariationGeneration(originalImage.url, prompt, user.uid, originalImage.id);
      setVariations(results);
      toast({
        title: 'Variations Generated',
        description: 'Stylistic variations have been created.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSelectFromGallery = (image: { id: string, storageUrl: string }) => {
    setOriginalImage({ id: image.id, url: image.storageUrl });
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main>
      <SidebarProvider>
        <ControlPanel
          onImageSelect={handleImageSelect}
          onEnhance={handleEnhance}
          onGenerateVariations={handleGenerateVariations}
          isImageSelected={!!originalImage}
          isProcessing={isProcessing}
          imageHistory={images || []}
          onSelectFromGallery={handleSelectFromGallery}
          isLoadingHistory={isLoadingImages}
        />
        <SidebarInset>
          <div className="p-4 md:p-8">
            <ImageWorkspace
              originalImage={originalImage?.url || null}
              enhancedImage={enhancedImage}
              variations={variations}
              isProcessing={isProcessing}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
