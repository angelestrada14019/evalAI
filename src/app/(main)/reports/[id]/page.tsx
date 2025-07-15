import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { FileDown } from 'lucide-react'
import Image from 'next/image'

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-secondary/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Individual Report</p>
              <CardTitle className="text-2xl">John Doe - Performance Review</CardTitle>
              <CardDescription>Generated on: April 3, 2024</CardDescription>
            </div>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <section className="flex items-center gap-6 mb-8">
            <Avatar className="h-24 w-24 border-4 border-card">
              <AvatarImage src="https://placehold.co/100x100.png" alt="John Doe" data-ai-hint="person" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">John Doe</h2>
              <p className="text-muted-foreground">Senior Software Engineer</p>
              <p className="text-sm text-muted-foreground mt-1">john.doe@acmeinc.com</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-5xl font-bold text-primary">92.5</p>
                <p className="text-sm font-semibold text-green-600">Expert</p>
            </div>
          </section>

          <Separator className="my-8" />
          
          <section>
            <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Category Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Image src="https://placehold.co/600x400.png" alt="Category Scores Chart" width={600} height={400} className="w-full h-auto rounded-md" data-ai-hint="bar chart" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Response Summary</CardTitle>
                    </CardHeader>
                     <CardContent>
                       <Image src="https://placehold.co/600x400.png" alt="Response Summary Chart" width={600} height={400} className="w-full h-auto rounded-md" data-ai-hint="pie chart" />
                    </CardContent>
                </Card>
            </div>
          </section>

          <Separator className="my-8" />

          <section>
             <h3 className="text-lg font-semibold mb-4">Manager&apos;s Feedback</h3>
             <div className="p-4 border rounded-md bg-secondary/30">
                <p className="text-muted-foreground italic">
                    &quot;John consistently delivers high-quality work and is a cornerstone of the team. His technical skills are exceptional. We will focus on developing leadership opportunities for him in the next quarter.&quot;
                </p>
             </div>
          </section>

        </CardContent>
      </Card>
    </div>
  )
}
