
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface Submission {
  id: string;
  participantName: string;
  participantEmail: string;
  collegeName: string;
  passingYear: string;
  score: string;
  totalQuestions: number;
  status: 'Completed'; // Assuming all fetched are completed
  submittedAt: string;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const examId = searchParams.get('examId');
    const examTitle = searchParams.get('title') || 'Exam';

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!examId) {
            setLoading(false);
            return;
        };

        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "submissions"),
                    where("examId", "==", examId)
                );
                const querySnapshot = await getDocs(q);
                const resultsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const submittedAt = data.submittedAt as Timestamp;
                    return {
                        id: doc.id,
                        participantName: data.participantName,
                        participantEmail: data.participantEmail,
                        collegeName: data.collegeName,
                        passingYear: data.passingYear,
                        score: `${data.score}/${data.totalQuestions}`,
                        totalQuestions: data.totalQuestions,
                        status: 'Completed',
                        submittedAt: submittedAt ? submittedAt.toDate().toLocaleString() : 'N/A',
                    } as Submission;
                });
                setSubmissions(resultsData);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [examId]);

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Exam Results</h1>
            
            {examId ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Results for: {examTitle}</CardTitle>
                        <CardDescription>Showing participant scores and statuses for the selected exam.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Participant Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>College</TableHead>
                                    <TableHead>Passing Year</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">Loading results...</TableCell>
                                    </TableRow>
                                ) : submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No submissions yet for this exam.</TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map(result => (
                                        <TableRow key={result.id}>
                                            <TableCell className="font-medium">{result.participantName}</TableCell>
                                            <TableCell>{result.participantEmail}</TableCell>
                                            <TableCell>{result.collegeName}</TableCell>
                                            <TableCell>{result.passingYear}</TableCell>
                                            <TableCell>{result.score}</TableCell>
                                            <TableCell>
                                                <Badge variant={result.status === 'Completed' ? 'default' : 'secondary'}>{result.status}</Badge>
                                            </TableCell>
                                            <TableCell>{result.submittedAt}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Exam Selected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Please go to the dashboard and select "View Results" for a specific exam to see the results.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
