"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
export default function LearningPathPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Path Generator</CardTitle>
          <CardDescription>
            Get a step-by-step personalized plan to master new skills or reach career goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>This future tool will help you:</p>
          <ul className="list-disc pl-6">
            <li>Set a goal (e.g., "Become a React Developer")</li>
            <li>Generate a week-by-week roadmap with actionable resources</li>
            <li>Track your progress and adjust milestones</li>
            <li>Get reminders, motivational tips, and community support</li>
          </ul>
          <p>Start your journey to mastery—coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
