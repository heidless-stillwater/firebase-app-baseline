'use client';

import * as React from 'react';
import Link from 'next/link';
import { AetheriaLogo } from '@/components/aetheria-logo';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ImageUploadButton } from './image-upload-button';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sparkles, Wand2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

interface ControlPanelProps {
  onImageSelect: (dataUrl: string, file: File) => void;
  onEnhance: () => void;
  onGenerateVariations: (prompt: string) => void;
  isImageSelected: boolean;
  isProcessing: boolean;
  imageHistory: any[];
  onSelectFromGallery: (image: any) => void;
  isLoadingHistory: boolean;
}

export function ControlPanel({
  onImageSelect,
  onEnhance,
  onGenerateVariations,
  isImageSelected,
  isProcessing,
  imageHistory,
  onSelectFromGallery,
  isLoadingHistory,
}: ControlPanelProps) {
  const [prompt, setPrompt] = React.useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt) {
      onGenerateVariations(prompt);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="hidden md:flex">
        <AetheriaLogo />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <div className="p-2">
          <SidebarGroup>
            <ImageUploadButton
              onImageSelect={onImageSelect}
              disabled={isProcessing}
            />
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
            <div className="space-y-4">
              <Button
                onClick={onEnhance}
                disabled={!isImageSelected || isProcessing}
                className="w-full"
                variant="secondary"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance Image
              </Button>

              <form onSubmit={handleGenerate} className="space-y-2">
                <Label htmlFor="prompt">Stylistic Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="e.g., vaporwave art"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!isImageSelected || isProcessing}
                />
                <Button
                  type="submit"
                  disabled={!isImageSelected || !prompt || isProcessing}
                  className="w-full"
                  variant="secondary"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Variations
                </Button>
              </form>
            </div>
          </SidebarGroup>
        </div>

        <SidebarSeparator />
        
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <ScrollArea className="h-full">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {isLoadingHistory ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-md" />
                  ))
                ) : (
                  imageHistory.map((image) => (
                    <button
                      key={image.id}
                      className="relative aspect-square w-full overflow-hidden rounded-md transition-transform hover:scale-105"
                      onClick={() => onSelectFromGallery(image)}
                    >
                      <Image
                        src={image.storageUrl}
                        alt={image.originalFileName}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-1 text-center text-xs text-muted-foreground">
          <p>
            Built with Firebase and Genkit.
          </p>
          <Link href="/contact" className="underline hover:text-foreground">
            Contact Us
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
