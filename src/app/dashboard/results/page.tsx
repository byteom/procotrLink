
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { exportToExcel } from '@/lib/utils';

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
    const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('all');

    // Get unique passing years for filter dropdown
    const uniqueYears = Array.from(new Set(submissions.map(s => s.passingYear))).sort();

    const handleDownloadExcel = () => {
        const dataToExport = filteredSubmissions.length > 0 ? filteredSubmissions : submissions;
        if (dataToExport.length === 0) {
            alert('No data to export. Please ensure there are exam submissions.');
            return;
        }

        const filename = `${examTitle.replace(/\s+/g, '-').toLowerCase()}-results`;
        exportToExcel(dataToExport, filename);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedYear('all');
    };

    // Filter submissions based on search term and selected year
    useEffect(() => {
        let filtered = submissions;

        // Filter by search term (name, email, or college)
        if (searchTerm) {
            filtered = filtered.filter(submission => 
                submission.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by passing year
        if (selectedYear !== 'all') {
            filtered = filtered.filter(submission => submission.passingYear === selectedYear);
        }

        setFilteredSubmissions(filtered);
    }, [submissions, searchTerm, selectedYear]);

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
            <div className="flex flex-col gap-2">
                <h1 className="text-lg font-semibold md:text-2xl">Exam Results</h1>
                <div className="text-xs text-brand-primary/80 font-medium bg-brand-light/20 px-3 py-1 rounded-full inline-block w-fit">
                    📊 Powered by LogikSutra AI Recruitment - Advanced Analytics
                </div>
            </div>
            
            {examId ? (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-col gap-2">
                                <CardTitle>Results for: {examTitle}</CardTitle>
                                <CardDescription>Showing participant scores and statuses for the selected exam.</CardDescription>
                                <div className="text-xs text-brand-primary/70 font-medium bg-brand-light/10 px-2 py-1 rounded inline-block w-fit">
                                    🎯 LogikSutra AI Proctoring Results
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDownloadExcel}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    disabled={loading || submissions.length === 0}
                                >
                                    <Download className="h-4 w-4" />
                                    Download Excel
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, email, or college..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {uniqueYears.map(year => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {(searchTerm || selectedYear !== 'all') && (
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Results Summary */}
                        {!loading && (
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {filteredSubmissions.length} of {submissions.length} results
                                {(searchTerm || selectedYear !== 'all') && (
                                    <span className="ml-2 text-blue-600">
                                        (filtered)
                                    </span>
                                )}
                            </div>
                        )}
                    </CardContent>
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
                                ) : filteredSubmissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No results match your current filters.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubmissions.map(result => (
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
