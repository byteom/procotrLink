"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
export default function ResumePage() {
  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Improvement</CardTitle>
          <CardDescription>
            Tailored suggestions to make your resume stand out to employers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>This section will empower you by:</p>
          <ul className="list-disc pl-6">
            <li>Analyzing and grading your uploaded resume</li>
            <li>Giving instant feedback on formatting, keywords, and achievements</li>
            <li>Recommending improvements aligned to your target roles</li>
            <li>Providing professional resume templates</li>
          </ul>
          <p>Get noticed—coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
