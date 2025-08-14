'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Upload, Users, Mail, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { backend } from '@/services/backend/backend';
import { useTenant } from '@/context/tenant-context';
import type { Contact, ContactGroup } from '@/services/backend/types';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function ContactsPage() {
  const t = useTranslations('ContactsPage');
  const tB = useTranslations('Breadcrumbs');
  const tContacts = useTranslations('ContactsPage');
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form states
  const [groupForm, setGroupForm] = useState({ name: '', description: '', tags: '' });
  const [contactForm, setContactForm] = useState({ 
    email: '', 
    firstName: '', 
    lastName: '', 
    groupIds: [] as string[] 
  });
  const [importData, setImportData] = useState('');

  const breadcrumbItems = [
    { label: tB('home'), href: '/dashboard' },
    { label: tB('contacts') },
  ];

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const loadData = async () => {
    if (!currentTenant) return;
    
    setIsLoading(true);
    try {
      const [contactsData, groupsData] = await Promise.all([
        backend().getContacts(currentTenant.id, selectedGroup === 'all' ? undefined : selectedGroup),
        backend().getContactGroups(currentTenant.id)
      ]);
      setContacts(contactsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load contacts and groups.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!currentTenant || !groupForm.name.trim()) return;

    try {
      const newGroup = await backend().createContactGroup(currentTenant.id, {
        name: groupForm.name,
        description: groupForm.description,
        tags: groupForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        contactCount: 0,
      });
      
      setGroups([...groups, newGroup]);
      setGroupForm({ name: '', description: '', tags: '' });
      setIsGroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Group "${newGroup.name}" created successfully.`,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create group.',
      });
    }
  };

  const handleCreateContact = async () => {
    if (!currentTenant || !contactForm.email.trim()) return;

    try {
      const newContact = await backend().createContact(currentTenant.id, {
        email: contactForm.email,
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        groupIds: contactForm.groupIds,
        customFields: {},
        status: 'active',
      });
      
      setContacts([...contacts, newContact]);
      setContactForm({ email: '', firstName: '', lastName: '', groupIds: [] });
      setIsContactDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Contact "${newContact.email}" created successfully.`,
      });
      
      // Reload to update group counts
      loadData();
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create contact.',
      });
    }
  };

  const handleImportContacts = async () => {
    if (!currentTenant || !importData.trim()) return;

    try {
      const lines = importData.trim().split('\n');
      const contactsToImport = lines.map(line => {
        const [email, firstName = '', lastName = ''] = line.split(',').map(s => s.trim());
        return {
          email,
          firstName,
          lastName,
          groupIds: selectedGroup !== 'all' ? [selectedGroup] : [],
          customFields: {},
          status: 'active' as const,
        };
      }).filter(contact => contact.email);

      const importedContacts = await backend().importContacts(currentTenant.id, contactsToImport);
      
      setContacts([...contacts, ...importedContacts]);
      setImportData('');
      setIsImportDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `${importedContacts.length} contacts imported successfully.`,
      });
      
      loadData();
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to import contacts.',
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!currentTenant) return;

    try {
      await backend().deleteContactGroup(currentTenant.id, groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      
      toast({
        title: 'Success',
        description: 'Group deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete group.',
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!currentTenant) return;

    try {
      await backend().deleteContact(currentTenant.id, contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      
      toast({
        title: 'Success',
        description: 'Contact deleted successfully.',
      });
      
      loadData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete contact.',
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Contacts</DialogTitle>
                <DialogDescription>
                  Import contacts from CSV format. One contact per line: email,firstName,lastName
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="john@example.com,John,Doe&#10;jane@example.com,Jane,Smith"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={8}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportContacts}>Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Create a new contact and assign them to groups.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('firstName')}</Label>
                  <Input
                    id="firstName"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                    placeholder={t('firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('lastName')}</Label>
                  <Input
                    id="lastName"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>
                </div>
                <div>
                  <Label>Groups</Label>
                  <Select
                    value={contactForm.groupIds[0] || ''}
                    onValueChange={(value) => setContactForm({...contactForm, groupIds: value ? [value] : []})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectGroup')} />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContact}>Create Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedGroup} onValueChange={setSelectedGroup} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Contacts ({contacts.length})</TabsTrigger>
            {groups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.name} ({group.contactCount})
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Contact Group</DialogTitle>
                <DialogDescription>
                  Create a new group to organize your contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">{t('groupName')} *</Label>
                  <Input
                    id="groupName"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                    placeholder={t('groupNamePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">{t('description')}</Label>
                  <Textarea
                    id="groupDescription"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                    placeholder={t('groupDescriptionPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="groupTags">Tags (comma separated)</Label>
                  <Input
                    id="groupTags"
                    value={groupForm.tags}
                    onChange={(e) => setGroupForm({...groupForm, tags: e.target.value})}
                    placeholder="marketing, team, internal"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-between items-center">
          <Input
            placeholder={t('searchContacts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <ContactsTable 
            contacts={filteredContacts} 
            groups={groups}
            onDeleteContact={handleDeleteContact}
          />
        </TabsContent>

        {groups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Group
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {group.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {group.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
            </Card>
            <ContactsTable 
              contacts={filteredContacts.filter(contact => contact.groupIds.includes(group.id))} 
              groups={groups}
              onDeleteContact={handleDeleteContact}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ContactsTable({ 
  contacts, 
  groups, 
  onDeleteContact 
}: { 
  contacts: Contact[]; 
  groups: ContactGroup[];
  onDeleteContact: (id: string) => void;
}) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {contact.firstName || contact.lastName 
                      ? `${contact.firstName} ${contact.lastName}`.trim()
                      : 'No name'
                    }
                  </div>
                </div>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {contact.groupIds.map((groupId) => {
                    const group = groups.find(g => g.id === groupId);
                    return group ? (
                      <Badge key={groupId} variant="outline" className="text-xs">
                        {group.name}
                      </Badge>
                    ) : null;
                  })}
                  {contact.groupIds.length === 0 && (
                    <span className="text-muted-foreground text-sm">No groups</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={contact.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {contact.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onDeleteContact(contact.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {contacts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No contacts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
