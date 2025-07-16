
"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Evaluation } from "@/services/backend/types"
import { Link } from "@/navigation"
import { MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import type { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
}

export const useEvaluationColumns = ({ t }: UseEvaluationColumnsProps): ColumnDef<Evaluation>[] => {
    const tEvals = useTranslations('EvaluationsPage');
    const tDataTable = useTranslations('DataTable');

    return useMemo(() => [
        {
            accessorKey: "title",
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={tEvals('tableTitle')} tDataTable={tDataTable} />
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
                return <DataTableColumnHeader column={column} title={tEvals('tableStatus')} tDataTable={tDataTable} />
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
                return <DataTableColumnHeader column={column} title={tEvals('tableResponses')} tDataTable={tDataTable} />
            },
            cell: ({ row }) => <div className="text-center">{row.getValue("responses")}</div>
        },
        {
            accessorKey: "lastModified",
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={tEvals('tableModified')} tDataTable={tDataTable} />
            },
            cell: ({ row }) => format(new Date(row.getValue("lastModified")), "PP")
        },
        {
            id: "actions",
            header: () => <div className="text-right">{tEvals('tableActions')}</div>,
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
                                <DropdownMenuItem asChild><Link href={`/evaluations/${evaluation.id}/build`}>{tEvals('editAction')}</Link></DropdownMenuItem>
                                <DropdownMenuItem>{tEvals('viewResponsesAction')}</DropdownMenuItem>
                                <DropdownMenuItem>{tEvals('duplicateAction')}</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">{tEvals('deleteAction')}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ], [tEvals, tDataTable]);
}
