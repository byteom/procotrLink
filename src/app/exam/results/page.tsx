'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ExamResultsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Exam Completed!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Thank you for taking the exam. Your results have been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">You may now close this window.</p>
          <Button asChild>
            <Link href="/">Back to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
