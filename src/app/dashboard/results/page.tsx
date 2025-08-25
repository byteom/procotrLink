'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration. In a real app, you'd fetch this from your database.
const mockResults = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', score: '9/10', status: 'Completed', submittedAt: new Date().toLocaleString() },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', score: '7/10', status: 'Completed', submittedAt: new Date().toLocaleString() },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', score: 'N/A', status: 'In Progress', submittedAt: '-' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', score: '10/10', status: 'Completed', submittedAt: new Date().toLocaleString() },
];


function ResultsContent() {
    const searchParams = useSearchParams();
    const examId = searchParams.get('examId');
    const examTitle = searchParams.get('title') || 'Exam'; // In a real app, fetch title using examId
    
    // Here you would fetch actual results based on the examId
    // For now, we'll just display mock data if an examId is present
    const results = examId ? mockResults : [];

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
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map(result => (
                                    <TableRow key={result.id}>
                                        <TableCell className="font-medium">{result.name}</TableCell>
                                        <TableCell>{result.email}</TableCell>
                                        <TableCell>{result.score}</TableCell>
                                        <TableCell>
                                            <Badge variant={result.status === 'Completed' ? 'default' : 'secondary'}>{result.status}</Badge>
                                        </TableCell>
                                        <TableCell>{result.submittedAt}</TableCell>
                                    </TableRow>
                                ))}
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
        <Suspense fallback={<div>Loading...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
