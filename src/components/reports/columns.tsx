
"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Link } from "@/i18n/navigation"
import { MoreHorizontal } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "../ui/data-table-column-header"

export type Report = {
  id: string
  title: string
  date: string
  type: 'Aggregate' | 'Individual'
  status: 'Completed'
}

const statusVariant = (type: string): 'default' | 'secondary' => {
  return type === 'Aggregate' ? 'default' : 'secondary';
};

export const useReportColumns = (): ColumnDef<Report>[] => {
  const t = useTranslations('ReportsPage');
  const tDataTable = useTranslations('DataTable');

  return useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title={t('tableTitle')} tDataTable={tDataTable} />
      },
      cell: ({ row }) => {
        const report = row.original;
        return (
          <Link href={`/reports/${report.id}`} className="hover:underline font-medium">
            {report.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title={t('tableType')} tDataTable={tDataTable} />
      },
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.getValue("type"))}>
          {row.getValue("type")}
        </Badge>
      ),
      filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "date",
       header: ({ column }) => {
        return <DataTableColumnHeader column={column} title={t('tableDate')} tDataTable={tDataTable} />
      },
    },
    {
      accessorKey: "status",
       header: ({ column }) => {
        return <DataTableColumnHeader column={column} title={t('tableStatus')} tDataTable={tDataTable} />
      },
      cell: ({ row }) => <Badge variant="outline">{row.getValue("status")}</Badge>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t('tableActions')}</div>,
      cell: function Actions({ row }) {
        const report = row.original
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href={`/reports/${report.id}`}>{t('viewAction')}</Link></DropdownMenuItem>
                <DropdownMenuItem>{t('downloadAction')}</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">{t('deleteAction')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ], [t]);
}
