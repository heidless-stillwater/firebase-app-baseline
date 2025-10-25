'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ImageProcessor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Processor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept="image/*" />
        <Button disabled>Upload Images</Button>
      </CardContent>
    </Card>
  );
}
