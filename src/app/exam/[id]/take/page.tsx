'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

const mockExam = {
    title: 'React Fundamentals Quiz',
    timeLimit: 1, // in minutes
    questions: [
        {
            questionText: "What is JSX?",
            options: ["A JavaScript syntax extension", "A templating engine", "A CSS preprocessor", "A database query language"],
            correctAnswer: "A JavaScript syntax extension"
        },
        {
            questionText: "Which hook is used to perform side effects in a function component?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: "useEffect"
        },
        {
            questionText: "What is a component in React?",
            options: ["A function that returns HTML", "A reusable piece of UI", "A CSS class", "A JavaScript file"],
            correctAnswer: "A reusable piece of UI"
        }
    ]
};

export default function TakeExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(mockExam.timeLimit * 60);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

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
    if (timeLeft <= 0) {
      submitExam();
      return;
    }
    const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);
  
  const submitExam = () => {
      // Logic to submit exam and calculate score
      router.push('/exam/results');
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const currentQuestion = mockExam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockExam.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
      <Card className="w-full max-w-4xl z-10">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>{mockExam.title}</CardTitle>
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
          <p className="text-sm text-muted-foreground mb-4">Question {currentQuestionIndex + 1} of {mockExam.questions.length}</p>
          <h2 className="text-xl md:text-2xl font-semibold mb-6">{currentQuestion.questionText}</h2>
          
          <RadioGroup 
            className="space-y-4"
            onValueChange={(value) => {
                const newAnswers = [...answers];
                newAnswers[currentQuestionIndex] = value;
                setAnswers(newAnswers);
            }}
            value={answers[currentQuestionIndex]}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base w-full cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
              {currentQuestionIndex < mockExam.questions.length - 1 ? 'Next Question' : 'Submit Exam'}
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
