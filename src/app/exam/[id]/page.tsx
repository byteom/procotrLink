'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function ExamTakerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id;

  const startExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/exam/${examId}/take`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">React Fundamentals Quiz</CardTitle>
          <CardDescription>
            Please enter your details to begin the exam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={startExam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" required />
            </div>
            <div className="items-top flex space-x-2 pt-2">
              <Checkbox id="terms" required/>
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Agree to terms and conditions
                </label>
                <p className="text-sm text-muted-foreground">
                  You agree to our exam policies, including camera monitoring and anti-cheating measures.
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Start Exam
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
