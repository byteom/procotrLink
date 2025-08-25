

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, BookOpen, Clock, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

interface ExamDetails {
    title: string;
    description: string;
    questions: any[];
    timeLimit: number;
    allowedAttempts: number;
}

export default function ExamTakerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const { toast } = useToast();
  
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

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
                setExamDetails({ 
                    title: data.title, 
                    description: data.description,
                    questions: data.questions || [],
                    timeLimit: data.timeLimit || 30,
                    allowedAttempts: data.allowedAttempts || 1,
                });
            } else {
                // Handle exam not found
                toast({ variant: "destructive", title: "Not Found", description: "The exam you are looking for does not exist." });
                router.push('/');
            }
        } catch(error) {
            console.error("Error fetching exam details:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchExamDetails();
  }, [examId, router, toast]);


  const startExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!examDetails) return;
    
    setIsChecking(true);
    try {
        const submissionsRef = collection(db, "submissions");
        const q = query(submissionsRef, where("examId", "==", examId), where("participantEmail", "==", email));
        const querySnapshot = await getCountFromServer(q);
        const attemptCount = querySnapshot.data().count;

        if (attemptCount >= examDetails.allowedAttempts) {
            toast({
                variant: "destructive",
                title: "Attempts Exceeded",
                description: `You have already attempted this exam ${attemptCount} time(s). No more attempts are allowed.`,
            });
            return;
        }

        // Store participant details in localStorage to be retrieved on the exam page
        localStorage.setItem('proctorlink-participant-name', fullName);
        localStorage.setItem('proctorlink-participant-email', email);
        localStorage.setItem('proctorlink-participant-college', collegeName);
        localStorage.setItem('proctorlink-participant-year', passingYear);
        router.push(`/exam/${examId}/take`);
        
    } catch (error) {
        console.error("Error checking for previous submissions:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not verify your submission status. Please try again.",
        });
    } finally {
        setIsChecking(false);
    }
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
          <div className="grid grid-cols-3 gap-4 text-center mb-6 border-y py-4">
             <div>
                <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><Clock className="w-4 h-4"/> Time</dt>
                <dd className="font-semibold">{loading ? <Skeleton className="h-5 w-12 mx-auto mt-1" /> : `${examDetails?.timeLimit} mins`}</dd>
             </div>
             <div>
                <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><HelpCircle className="w-4 h-4"/> Questions</dt>
                <dd className="font-semibold">{loading ? <Skeleton className="h-5 w-12 mx-auto mt-1" /> : `${examDetails?.questions.length}`}</dd>
             </div>
             <div>
                <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><Repeat className="w-4 h-4"/> Attempts</dt>
                <dd className="font-semibold">{loading ? <Skeleton className="h-5 w-12 mx-auto mt-1" /> : `${examDetails?.allowedAttempts}`}</dd>
             </div>
          </div>
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
            <Button type="submit" className="w-full" disabled={loading || isChecking}>
              {isChecking ? 'Verifying...' : 'Start Exam'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
