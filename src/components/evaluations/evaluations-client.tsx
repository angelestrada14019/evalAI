
'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/navigation';
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
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PackagePlus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import type { Evaluation } from '@/services/backend/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export function EvaluationsClient({ initialEvaluations }: { initialEvaluations: Evaluation[] }) {
  const t = useTranslations('EvaluationsPage');
  const [searchTerm, setSearchTerm] = useState('');

  const statusVariant = (status: string): 'secondary' | 'default' | 'outline' => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Active': return 'default';
      case 'Archived': return 'outline';
      default: return 'outline';
    }
  };

  const filteredEvaluations = useMemo(() => {
    if (!initialEvaluations) return [];
    if (!searchTerm) return initialEvaluations;
    return initialEvaluations.filter(evaluation =>
      evaluation.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, initialEvaluations]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
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
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="w-full appearance-none bg-background pl-8 md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                {filteredEvaluations.length > 0 ? (
                  filteredEvaluations.map((evaluation) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      {t('noResultsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
