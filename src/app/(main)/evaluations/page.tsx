import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PackagePlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const evaluations = [
  { id: 'eval_001', title: 'Q3 2024 Engineering Performance Review', status: 'Active', responses: 45, lastModified: '2024-07-15' },
  { id: 'eval_002', title: 'New Hire Onboarding Survey', status: 'Active', responses: 120, lastModified: '2024-07-12' },
  { id: 'eval_003', title: 'UX/UI Design Competency Matrix', status: 'Draft', responses: 0, lastModified: '2024-07-18' },
  { id: 'eval_004', title: 'Sales Team Q2 Skills Assessment', status: 'Archived', responses: 88, lastModified: '2024-06-28' },
  { id: 'eval_005', title: 'Annual Employee Satisfaction Poll', status: 'Active', responses: 350, lastModified: '2024-07-01' },
];

const statusVariant = (status: string): 'secondary' | 'default' | 'outline' => {
  switch (status) {
    case 'Draft': return 'secondary';
    case 'Active': return 'default';
    case 'Archived': return 'outline';
    default: return 'outline';
  }
};

export default function EvaluationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">Evaluations</h1>
            <p className="text-muted-foreground">Manage all your evaluation forms here.</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/evaluations/new">
                <PackagePlus className="mr-2 h-4 w-4" />
                New Evaluation
            </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Responses</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell className="font-medium">
                  <Link href={`/evaluations/${evaluation.id}/build`} className="hover:underline">
                    {evaluation.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(evaluation.status)}>{evaluation.status}</Badge>
                </TableCell>
                <TableCell className="text-center">{evaluation.responses}</TableCell>
                <TableCell>{evaluation.lastModified}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/evaluations/${evaluation.id}/build`}>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem>View Responses</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
