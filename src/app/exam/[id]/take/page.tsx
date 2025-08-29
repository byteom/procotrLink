
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Camera, Timer, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
    timeLimit?: number;
}

interface Exam {
    title: string;
    timeLimit?: number;
    perQuestionTimer: boolean;
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
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const submitExam = useCallback(async () => {
      if (isSubmitting || !exam) return;
      setIsSubmitting(true);
      if(timerRef.current) clearInterval(timerRef.current);
      
      let score = 0;
      exam.questions.forEach((q, index) => {
          if(q.correctAnswer === answers[index]){
              score++;
          }
      });

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
  }, [exam, answers, examId, isSubmitting, router, toast, warningCount]);
  
  const goToQuestion = (index: number) => {
    if (exam && index >= 0 && index < exam.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
      if(currentQuestionIndex > 0){
          setCurrentQuestionIndex(prev => prev - 1);
      }
  }


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
                if (!examData.perQuestionTimer) {
                  setTimeLeft((examData.timeLimit || 30) * 60);
                }
            } else {
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

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions to start the exam.',
        });
      }
    };
    getCameraPermission();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(c => c + 1);
        setDialogMessage(`You have switched tabs. This is your warning #${warningCount + 1}.`);
        setShowWarningDialog(true);
        toast({ title: 'Warning: Tab Switch Detected', variant: 'destructive' });
      }
    };
    const handleCopyPaste = (e: ClipboardEvent) => { e.preventDefault(); setWarningCount(c => c + 1); toast({ title: 'Warning: Copy/Paste Disabled', variant: 'destructive' }); };

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
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [warningCount, toast]);

  // Timer logic
  useEffect(() => {
    if (loading || isSubmitting || !hasCameraPermission || !exam) return;

    if (timerRef.current) clearInterval(timerRef.current);

    let shouldAutoAdvance = false;

    if (exam.perQuestionTimer) {
      const questionTime = exam.questions[currentQuestionIndex]?.timeLimit || 60;
      if (timeLeft <= 0 || currentQuestionIndex !== answers.findIndex(a => a === null)) { // Reset timer for new questions
           setTimeLeft(questionTime);
      }
      shouldAutoAdvance = true;
    }

    if (timeLeft <= 0) {
      if(shouldAutoAdvance && currentQuestionIndex < exam.questions.length - 1) {
        handleNext();
      } else {
        submitExam();
      }
      return;
    }

    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);

    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isSubmitting, hasCameraPermission, exam, timeLeft, currentQuestionIndex, answers, submitExam, handleNext]);
  
  if (loading || !exam) {
      return <div className="flex items-center justify-center min-h-screen">Loading exam...</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
       {!hasCameraPermission && (
          <Card className="w-full max-w-4xl z-20 mb-4">
              <CardHeader><CardTitle>Camera & Microphone Required</CardTitle></CardHeader>
              <CardContent>
                  <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Action Required</AlertTitle>
                      <AlertDescription>
                         Please grant camera and microphone access in your browser to begin the exam.
                      </AlertDescription>
                  </Alert>
              </CardContent>
          </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 w-full max-w-7xl">
        <Card className="w-full z-10 order-2 lg:order-1">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle>{exam.title} - Question {currentQuestionIndex + 1}</CardTitle>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-medium text-primary">
                    <Timer className="h-6 w-6" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isSubmitting || !hasCameraPermission}>Submit Exam</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. You will not be able to change your answers after submitting.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={submitExam} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Yes, submit my exam'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            </CardHeader>
            <CardContent className="pt-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">{currentQuestion.questionText}</h2>
            
            <RadioGroup 
                className="space-y-4"
                onValueChange={(value) => {
                    const newAnswers = [...answers];
                    newAnswers[currentQuestionIndex] = value;
                    setAnswers(newAnswers);
                }}
                value={answers[currentQuestionIndex] || ''}
                disabled={!hasCameraPermission || isSubmitting}
            >
                {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base w-full cursor-pointer">{option}</Label>
                </div>
                ))}
            </RadioGroup>
            </CardContent>
             <CardFooter className="flex justify-between border-t pt-4">
                <Button onClick={handlePrev} disabled={currentQuestionIndex === 0 || isSubmitting}>
                    Previous
                </Button>
                {currentQuestionIndex < exam.questions.length - 1 ? (
                    <Button onClick={handleNext} disabled={isSubmitting || !hasCameraPermission}>
                        Next Question
                    </Button>
                ) : (
                     <Button onClick={submitExam} disabled={isSubmitting || !hasCameraPermission}>
                        {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
                    </Button>
                )}
            </CardFooter>
        </Card>

         <Card className="w-full z-10 order-1 lg:order-2">
            <CardHeader>
                <CardTitle>Question Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-5 gap-2">
                {exam.questions.map((_, index) => (
                    <Button
                        key={index}
                        variant={currentQuestionIndex === index ? 'default' : (answers[index] ? 'secondary' : 'outline')}
                        className={cn(
                          "h-10 w-10 p-0",
                          answers[index] && "border-green-500"
                        )}
                        onClick={() => goToQuestion(index)}
                    >
                        {answers[index] ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </Button>
                ))}
            </CardContent>
             <CardFooter className="flex-col gap-2 items-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-secondary border border-green-500"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div> Unanswered</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">#</div> Current</div>
                 <div className="flex items-center gap-2 mt-4 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{warningCount} Warnings</span>
                </div>
             </CardFooter>
        </Card>
      </div>


      <div className="fixed bottom-4 left-4 z-20">
        <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
           <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
           <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-md flex items-center gap-1">
             <Camera className="h-4 w-4" />
             <span className="text-xs">{hasCameraPermission ? 'ON' : 'OFF'}</span>
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
