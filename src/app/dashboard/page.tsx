'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { collection, getDocs, query, orderBy, Timestamp, where,getCountFromServer } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Exam {
  id: string;
  title: string;
  status: 'Published' | 'Draft' | 'Archived';
  participants: number;
  createdAt: Timestamp;
}

export default function Dashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading exams...</div>
  }

  return (
    <>
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
      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>
            Manage your exams and view their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Participants</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 && !loading ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No exams found. Create one to get started!</TableCell>
                  </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>
                      <Badge variant={exam.status === 'Published' ? 'default' : (exam.status === 'Draft' ? 'secondary' : 'outline')}>{exam.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{exam.participants}</TableCell>
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
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
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
