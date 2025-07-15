import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileDown, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const reports = [
  { id: 'REP-001', title: 'Q1 2024 Engineering Performance', date: '2024-04-05', type: 'Aggregate', status: 'Completed' },
  { id: 'REP-002', title: 'John Doe - Performance Review', date: '2024-04-03', type: 'Individual', status: 'Completed' },
  { id: 'REP-003', title: 'Sales Team Skills Assessment', date: '2024-03-28', type: 'Aggregate', status: 'Completed' },
  { id: 'REP-004', title: 'UX/UI Design Competency Report', date: '2024-03-15', type: 'Aggregate', status: 'Completed' },
  { id: 'REP-005', title: 'Jane Smith - Onboarding Evaluation', date: '2024-03-12', type: 'Individual', status: 'Completed' },
]

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button>
          <FileDown className="mr-2 h-4 w-4" /> Generate New Report
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  <Link href={`/reports/${report.id}`} className="hover:underline">
                    {report.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={report.type === 'Aggregate' ? 'default' : 'secondary'}>{report.type}</Badge>
                </TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Badge variant="outline">{report.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/reports/${report.id}`}>View</Link></DropdownMenuItem>
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
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
  )
}
