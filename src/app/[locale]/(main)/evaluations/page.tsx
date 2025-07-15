
import { Link } from '@/navigation'
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
import { MoreHorizontal, PackagePlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getTranslations } from 'next-intl/server'
import { backend } from '@/services/backend/backend'
import type { Evaluation } from '@/services/backend/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function EvaluationsPage() {
  const t = await getTranslations('EvaluationsPage');
  const evaluations: Evaluation[] = await backend().getEvaluations();

  const statusVariant = (status: string) => {
    switch(status) {
        case 'Draft': return 'secondary';
        case 'Active': return 'default';
        case 'Archived': return 'outline';
        default: return 'outline';
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/evaluations/new">
              <PackagePlus className="mr-2 h-4 w-4" />
              {t('newEvaluationButton')}
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('listTitle')}</CardTitle>
            <CardDescription>{t('listDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>{t('tableTitle')}</TableHead>
                    <TableHead>{t('tableStatus')}</TableHead>
                    <TableHead>{t('tableResponses')}</TableHead>
                    <TableHead>{t('tableModified')}</TableHead>
                    <TableHead className="text-right">{t('tableActions')}</TableHead>
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
                         <TableCell>{evaluation.responses}</TableCell>
                        <TableCell>{format(new Date(evaluation.lastModified), 'PP')}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/evaluations/${evaluation.id}/build`}>{t('editAction')}</Link></DropdownMenuItem>
                            <DropdownMenuItem>{t('viewResponsesAction')}</DropdownMenuItem>
                             <DropdownMenuItem>{t('duplicateAction')}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">{t('deleteAction')}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
