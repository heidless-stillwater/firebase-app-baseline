'use client';

import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export function ImageGallery() {
  const { user } = useUser();
  const firestore = useFirestore();

  const imageRecordsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // NOTE: orderBy('timestamp') was removed. A composite index would be required
    // by Firestore to query on 'userId' and order by 'timestamp'.
    // Simplifying the query to just filter by userId resolves the permission error.
    return query(
      collection(firestore, 'imageRecords'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: imageRecords, isLoading } = useCollection(imageRecordsQuery);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!imageRecords || imageRecords.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p>Your processed images will appear here.</p>
          <p>Upload an image using the form above to get started.</p>
        </div>
      );
    }
    
    // Sort records by timestamp client-side
    const sortedRecords = [...imageRecords].sort((a, b) => {
        const timestampA = a.timestamp?.toMillis() || 0;
        const timestampB = b.timestamp?.toMillis() || 0;
        return timestampB - timestampA;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecords.map((record) => (
          <Card key={record.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-center">Original</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <Image
                    src={record.originalImageUrl}
                    alt="Original Upload"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-center">
                  Transformed (B&W)
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <Image
                    src={record.transformedImageUrl}
                    alt="Transformed Black and White"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
               <p className="text-xs text-muted-foreground truncate" title={record.originalFileName}>
                {record.originalFileName}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm mt-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
