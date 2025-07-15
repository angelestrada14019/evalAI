import { SettingsNav } from '@/components/settings/settings-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, UserPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const teamMembers = [
  { name: 'Alice Johnson', email: 'alice@acme.com', role: 'Admin', fallback: 'AJ' },
  { name: 'Bob Williams', email: 'bob@acme.com', role: 'Editor', fallback: 'BW' },
  { name: 'Charlie Brown', email: 'charlie@acme.com', role: 'Reviewer', fallback: 'CB' },
  { name: 'Diana Prince', email: 'diana@acme.com', role: 'Participant', fallback: 'DP' },
]

export default function TeamSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and workspace settings.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SettingsNav />
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Invite and manage your team members.</CardDescription>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teamMembers.map(member => (
                            <TableRow key={member.email}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://placehold.co/100x100.png?text=${member.fallback}`} data-ai-hint="person" />
                                            <AvatarFallback>{member.fallback}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{member.role}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit role</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Remove from team</DropdownMenuItem>
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
      </div>
    </div>
  )
}
