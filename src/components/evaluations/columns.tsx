
"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Evaluation } from "@/services/backend/types"
import { Link } from "@/i18n/navigation"
import { MoreHorizontal, Mail } from "lucide-react"
import { format } from "date-fns"
import type { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "../ui/data-table-column-header"

const statusVariant = (status: string): 'secondary' | 'default' | 'outline' => {
    switch (status) {
        case 'Draft': return 'secondary';
        case 'Active': return 'default';
        case 'Archived': return 'outline';
        default: return 'outline';
    }
};

interface UseEvaluationColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onDistribute?: (evaluation: Evaluation) => void;
}

export const useEvaluationColumns = ({ t, onDistribute }: UseEvaluationColumnsProps): ColumnDef<Evaluation>[] => {
    return useMemo(() => [
        {
            accessorKey: "title",
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={t('EvaluationsPage.tableTitle')} tDataTable={t} />
            },
            cell: ({ row }) => {
                const evaluation = row.original
                return (
                    <Link href={`/evaluations/${evaluation.id}/build`} className="hover:underline font-medium">
                        {evaluation.title}
                    </Link>
                )
            }
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={t('EvaluationsPage.tableStatus')} tDataTable={t} />
            },
            cell: ({ row }) => (
                <Badge variant={statusVariant(row.getValue("status"))}>
                    {row.getValue("status")}
                </Badge>
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "responses",
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={t('EvaluationsPage.tableResponses')} tDataTable={t} />
            },
            cell: ({ row }) => <div className="text-center">{row.getValue("responses")}</div>
        },
        {
            accessorKey: "lastModified",
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={t('EvaluationsPage.tableModified')} tDataTable={t} />
            },
            cell: ({ row }) => format(new Date(row.getValue("lastModified")), "PP")
        },
        {
            id: "actions",
            header: () => <div className="text-right">{t('EvaluationsPage.tableActions')}</div>,
            cell: function Actions({ row }) {
                const evaluation = row.original
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href={`/evaluations/${evaluation.id}/build`}>{t('EvaluationsPage.editAction')}</Link></DropdownMenuItem>
                                <DropdownMenuItem>{t('EvaluationsPage.viewResponsesAction')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {onDistribute && (
                                    <DropdownMenuItem onClick={() => onDistribute(evaluation)}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send to Contacts
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>{t('EvaluationsPage.duplicateAction')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">{t('EvaluationsPage.deleteAction')}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ], [t, onDistribute]);
}
