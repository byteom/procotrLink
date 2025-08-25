
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, BookOpen, Calendar, School } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface ExamDetails {
    title: string;
    description: string;
}

export default function ExamTakerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [passingYear, setPassingYear] = useState('');


  useEffect(() => {
    if(!examId) return;

    const fetchExamDetails = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'exams', examId);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                const data = docSnap.data();
                setExamDetails({ title: data.title, description: data.description });
            } else {
                // Handle exam not found
                router.push('/');
            }
        } catch(error) {
            console.error("Error fetching exam details:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchExamDetails();
  }, [examId, router]);


  const startExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Store participant details in localStorage to be retrieved on the exam page
    localStorage.setItem('proctorlink-participant-name', fullName);
    localStorage.setItem('proctorlink-participant-email', email);
    localStorage.setItem('proctorlink-participant-college', collegeName);
    localStorage.setItem('proctorlink-participant-year', passingYear);
    router.push(`/exam/${examId}/take`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          {loading ? (
              <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full mx-auto" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
              </div>
          ) : (
            <>
                <CardTitle className="text-2xl">{examDetails?.title}</CardTitle>
                <CardDescription>
                    {examDetails?.description || 'Please enter your details to begin the exam.'}
                </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={startExam} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="collegeName" className="flex items-center"><School className="mr-2 h-4 w-4"/>College Name</Label>
                  <Input id="collegeName" placeholder="University of Example" required value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingYear" className="flex items-center"><Calendar className="mr-2 h-4 w-4"/>Passing Year</Label>
                  <Input id="passingYear" type="number" placeholder="e.g. 2025" required value={passingYear} onChange={e => setPassingYear(e.target.value)} />
                </div>
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
            <Button type="submit" className="w-full" disabled={loading}>
              Start Exam
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
