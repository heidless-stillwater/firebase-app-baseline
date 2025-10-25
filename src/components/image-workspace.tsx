'use client';

import { ImageUp, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ImagePreview } from './image-preview';

interface ImageWorkspaceProps {
  originalImage: string | null;
  enhancedImage: string | null;
  variations: string[];
  isProcessing: boolean;
}

export function ImageWorkspace({
  originalImage,
  enhancedImage,
  variations,
  isProcessing,
}: ImageWorkspaceProps) {
  if (!originalImage) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <ImageUp className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          Upload an image to start
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the panel on the left to upload, enhance, and generate variations
          of your images.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="sr-only">Processing...</p>
        </div>
      )}
      <Tabs defaultValue="original" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="original">Original</TabsTrigger>
          <TabsTrigger value="enhanced" disabled={!enhancedImage}>
            Enhanced
          </TabsTrigger>
          <TabsTrigger value="variations" disabled={variations.length === 0}>
            Variations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="original" className="mt-4">
          <ImagePreview src={originalImage} alt="Original uploaded image" />
        </TabsContent>
        <TabsContent value="enhanced" className="mt-4">
          <ImagePreview src={enhancedImage} alt="AI Enhanced image" />
        </TabsContent>
        <TabsContent value="variations" className="mt-4">
          {variations.length > 0 && (
            <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full"
            >
              <CarouselContent>
                {variations.map((variation, index) => (
                  <CarouselItem key={index}>
                    <ImagePreview
                      src={variation}
                      alt={`Stylistic variation ${index + 1}`}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
