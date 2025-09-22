
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Link2, Tag, Trash2, Pause, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, where, getCountFromServer, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  title: string;
  status: 'Published' | 'Draft' | 'Archived';
  participants: number;
  createdAt: Timestamp;
  tags?: string[];
  isPaused?: boolean;
}

export default function Dashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);
  const [pausingExamId, setPausingExamId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsQuery = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(examsQuery);
        
        const examsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const exam = {
            id: doc.id,
            ...doc.data()
          } as Omit<Exam, 'status' | 'participants'> & { id: string, createdAt: Timestamp };

          // Fetch participant count
          const submissionsQuery = query(collection(db, "submissions"), where("examId", "==", doc.id));
          const submissionsSnapshot = await getCountFromServer(submissionsQuery);
          const participants = submissionsSnapshot.data().count;

          return {
            ...exam,
            participants,
            status: 'Published', // Mock status, can be developed further
            isPaused: exam.isPaused || false,
          } as Exam;
        }));

        setExams(examsData);

      } catch (error) {
        console.error("Error fetching exams: ", error);
        // Handle error (e.g., show a toast message)
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };
  
  const handleEdit = (id: string) => {
      router.push(`/dashboard/edit/${id}`);
  };

  const handleViewResults = (exam: Exam) => {
    router.push(`/dashboard/results?examId=${exam.id}&title=${encodeURIComponent(exam.title)}`);
  };

  const handleCopyLink = (examId: string) => {
    const link = `${window.location.origin}/exam/${examId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "The exam link has been copied to your clipboard.",
    });
  };

  const handleDeleteExam = async (examId: string) => {
    setDeletingExamId(examId);
    try {
      // Delete the exam document from Firestore
      await deleteDoc(doc(db, "exams", examId));
      
      // Remove the exam from the local state
      setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
      
      toast({
        title: "Exam Deleted!",
        description: "The exam has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting exam: ", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the exam. Please try again.",
      });
    } finally {
      setDeletingExamId(null);
    }
  };

  const handlePauseToggle = async (examId: string, currentPauseState: boolean) => {
    setPausingExamId(examId);
    try {
      const examRef = doc(db, "exams", examId);
      const newPauseState = !currentPauseState;
      
      await updateDoc(examRef, {
        isPaused: newPauseState,
        pausedAt: newPauseState ? new Date() : null
      });
      
      // Update the local state
      setExams(prevExams => 
        prevExams.map(exam => 
          exam.id === examId 
            ? { ...exam, isPaused: newPauseState }
            : exam
        )
      );
      
      toast({
        title: newPauseState ? "Exam Paused!" : "Exam Resumed!",
        description: newPauseState 
          ? "The exam has been paused. No new participants can enter." 
          : "The exam has been resumed. Participants can now enter again.",
      });
    } catch (error) {
      console.error("Error toggling exam pause state: ", error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "There was an error updating the exam status. Please try again.",
      });
    } finally {
      setPausingExamId(null);
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading exams...</div>
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">My Exams</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" className="h-8 gap-1">
              <Link href="/dashboard/create">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create Exam
                </span>
              </Link>
            </Button>
          </div>
        </div>
        <div className="text-xs text-brand-primary/80 font-medium bg-brand-light/20 px-3 py-1 rounded-full inline-block w-fit">
          🚀 Powered by LogikSutra AI Recruitment - Advanced Exam Management
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>
            Manage your exams and view their status.
          </CardDescription>
          <div className="text-xs text-brand-primary/70 font-medium bg-brand-light/10 px-2 py-1 rounded inline-block w-fit">
            📊 LogikSutra AI Analytics
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-center">Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 && !loading ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No exams found. Create one to get started!</TableCell>
                  </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                          {exam.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{exam.participants}</TableCell>
                    <TableCell>
                      <Badge variant={exam.isPaused ? "destructive" : "default"}>
                        {exam.isPaused ? "Paused" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(exam.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(exam.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewResults(exam)}>View Results</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(exam.id)}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handlePauseToggle(exam.id, exam.isPaused || false)}
                            disabled={pausingExamId === exam.id}
                          >
                            {exam.isPaused ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Resume Exam
                              </>
                            ) : (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Exam
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the exam "{exam.title}" 
                                  and remove all associated data including participant submissions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteExam(exam.id)}
                                  disabled={deletingExamId === exam.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingExamId === exam.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
