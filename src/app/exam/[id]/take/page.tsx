
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Camera, Timer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

interface Exam {
    title: string;
    timeLimit: number;
    questions: Question[];
}

export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
        try {
            const docRef = doc(db, "exams", examId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const examData = docSnap.data() as Exam;
                setExam(examData);
                setAnswers(new Array(examData.questions.length).fill(null));
                setTimeLeft((examData.timeLimit || 30) * 60);
            } else {
                console.log("No such document!");
                toast({ title: "Error", description: "Exam not found.", variant: "destructive" });
                router.push('/');
            }
        } catch (error) {
            console.error("Error fetching exam:", error);
            toast({ title: "Error", description: "Failed to load the exam.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchExam();
  }, [examId, router, toast]);

  // Proctoring features
  useEffect(() => {
    // 1. Camera Monitoring
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera access denied:", err);
        setDialogMessage("Camera access is required for this exam. Please enable camera access and refresh the page.");
        setShowWarningDialog(true);
      });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(c => c + 1);
        setDialogMessage(`You have switched tabs. This is your warning #${warningCount + 1}.`);
        setShowWarningDialog(true);
        toast({ title: 'Warning: Tab Switch Detected', variant: 'destructive' });
      }
    };
    
    const handleCopyPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        setWarningCount(c => c + 1);
        toast({ title: 'Warning: Copy/Paste Disabled', description: 'This action is not allowed during the exam.', variant: 'destructive' });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('copy', handleCopyPaste);
    window.addEventListener('paste', handleCopyPaste);
    window.addEventListener('cut', handleCopyPaste);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('cut', handleCopyPaste);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [warningCount, toast]);

  // Timer
  useEffect(() => {
    if (loading || isSubmitting) return;
    if (timeLeft <= 0) {
      submitExam();
      return;
    }
    const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, isSubmitting]);
  
  const submitExam = async () => {
      if (isSubmitting || !exam) return;
      setIsSubmitting(true);
      
      // Calculate score
      let score = 0;
      exam.questions.forEach((q, index) => {
          if(q.correctAnswer === answers[index]){
              score++;
          }
      });

      // Get participant details from local storage
      const participantName = localStorage.getItem('proctorlink-participant-name') || 'Anonymous';
      const participantEmail = localStorage.getItem('proctorlink-participant-email') || 'No Email';
      const collegeName = localStorage.getItem('proctorlink-participant-college') || 'N/A';
      const passingYear = localStorage.getItem('proctorlink-participant-year') || 'N/A';
      
      try {
        await addDoc(collection(db, 'submissions'), {
            examId,
            examTitle: exam.title,
            participantName,
            participantEmail,
            collegeName,
            passingYear,
            answers,
            score,
            totalQuestions: exam.questions.length,
            submittedAt: serverTimestamp(),
            warningCount,
        });
        
        // Clean up local storage
        localStorage.removeItem('proctorlink-participant-name');
        localStorage.removeItem('proctorlink-participant-email');
        localStorage.removeItem('proctorlink-participant-college');
        localStorage.removeItem('proctorlink-participant-year');
        
        router.push(`/exam/results?examId=${examId}`);

      } catch (error) {
        console.error("Error submitting exam:", error);
        toast({ title: "Submission Failed", description: "Could not submit your exam. Please try again.", variant: "destructive" });
        setIsSubmitting(false);
      }
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  if (loading || !exam) {
      return <div className="flex items-center justify-center min-h-screen">Loading exam...</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
      <Card className="w-full max-w-4xl z-10">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>{exam.title}</CardTitle>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-lg font-medium text-primary">
                <Timer className="h-6 w-6" />
                <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>{warningCount} Warnings</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
          <h2 className="text-xl md:text-2xl font-semibold mb-6">{currentQuestion.questionText}</h2>
          
          <RadioGroup 
            className="space-y-4"
            onValueChange={(value) => {
                const newAnswers = [...answers];
                newAnswers[currentQuestionIndex] = value;
                setAnswers(newAnswers);
            }}
            value={answers[currentQuestionIndex] || ''}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base w-full cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleNext} disabled={!answers[currentQuestionIndex] || isSubmitting}>
              {isSubmitting 
                ? 'Submitting...' 
                : (currentQuestionIndex < exam.questions.length - 1 ? 'Next Question' : 'Submit Exam')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4 z-20">
        <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
           <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
           <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-md flex items-center gap-1">
             <Camera className="h-4 w-4" />
             <span className="text-xs">ON</span>
           </div>
        </div>
      </div>

       <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Proctoring Warning</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningDialog(false)}>I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
