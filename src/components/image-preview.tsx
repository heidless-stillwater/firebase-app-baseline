'use client';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

interface ImagePreviewProps {
  src: string | null;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  if (!src) {
    return <Skeleton className="aspect-video w-full rounded-lg bg-muted/30" />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-card">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
