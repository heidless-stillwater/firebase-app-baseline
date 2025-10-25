'use client';

import * as React from 'react';
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

interface ControlPanelProps {
  onImageSelect: (dataUrl: string) => void;
  onEnhance: () => void;
  onGenerateVariations: (prompt: string) => void;
  isImageSelected: boolean;
  isProcessing: boolean;
}

export function ControlPanel({
  onImageSelect,
  onEnhance,
  onGenerateVariations,
  isImageSelected,
  isProcessing,
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
      <SidebarHeader>
        <AetheriaLogo />
      </SidebarHeader>
      <SidebarContent className="p-2">
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
      </SidebarContent>
      <SidebarFooter>
        <p className="text-center text-xs text-muted-foreground">
          Built with Firebase and Genkit.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
