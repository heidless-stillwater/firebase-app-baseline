'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  performImageEnhancement,
  performVariationGeneration,
} from '@/app/actions';
import { ControlPanel } from '@/components/control-panel';
import { ImageWorkspace } from '@/components/image-workspace';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = React.useState<string | null>(null);
  const [variations, setVariations] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleImageSelect = (dataUrl: string) => {
    setOriginalImage(dataUrl);
    // Reset previous results when a new image is uploaded
    setEnhancedImage(null);
    setVariations([]);
  };

  const handleEnhance = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    try {
      const result = await performImageEnhancement(originalImage);
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
    if (!originalImage) return;
    setIsProcessing(true);
    try {
      const results = await performVariationGeneration(originalImage, prompt);
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
        />
        <SidebarInset>
          <div className="p-4 md:p-8">
            <ImageWorkspace
              originalImage={originalImage}
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
