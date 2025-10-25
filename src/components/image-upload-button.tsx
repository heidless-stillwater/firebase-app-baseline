'use client';

import { useRef, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadButtonProps {
  onImageSelect: (dataUrl: string, file: File) => void;
  disabled?: boolean;
}

export function ImageUploadButton({
  onImageSelect,
  disabled,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelect(e.target.result as string, file);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
      <Button onClick={handleClick} disabled={disabled} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Upload Image
      </Button>
    </>
  );
}
