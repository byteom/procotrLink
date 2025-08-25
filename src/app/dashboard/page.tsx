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
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
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
        const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const examsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Firestore returns a Timestamp object, let's keep it for now
          // and format it in the JSX
        } as Omit<Exam, 'status' | 'participants'> & { id: string, createdAt: Timestamp, questions: any[] }));
        
        // Let's add mock status and participants for now
        const formattedExams = examsData.map(exam => ({
            ...exam,
            status: 'Published', // Mock status
            participants: Math.floor(Math.random() * 100), // Mock participants
        }));

        setExams(formattedExams as Exam[]);

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

  if (loading) {
    return <div>Loading exams...</div>
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
                <TableHead>Participants</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>
                    <Badge variant={exam.status === 'Published' ? 'default' : (exam.status === 'Draft' ? 'secondary' : 'outline')}>{exam.status}</Badge>
                  </TableCell>
                  <TableCell>{exam.participants}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/results?examId=${exam.id}`)}>View Results</DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
