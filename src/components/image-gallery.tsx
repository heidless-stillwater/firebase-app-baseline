'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ImageGallery() {
  return (
    <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm mt-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Your processed images will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
