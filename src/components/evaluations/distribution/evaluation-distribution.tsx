'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Users, Calendar, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { backend } from '@/services/backend/backend';
import { useTenant } from '@/context/tenant-context';
import type { Contact, ContactGroup, Evaluation } from '@/services/backend/types';

interface EvaluationDistributionProps {
  evaluation: Evaluation;
  isOpen: boolean;
  onClose: () => void;
}

interface EmailTemplate {
  subject: string;
  message: string;
  includeLink: boolean;
  includeInstructions: boolean;
}

interface DistributionSettings {
  recipientType: 'contacts' | 'groups' | 'all';
  selectedContacts: string[];
  selectedGroups: string[];
  emailTemplate: EmailTemplate;
  scheduleType: 'now' | 'scheduled';
  scheduledDate?: Date;
  scheduledTime?: string;
}

export function EvaluationDistribution({ evaluation, isOpen, onClose }: EvaluationDistributionProps) {
  const t = useTranslations('EvaluationDistribution');
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [settings, setSettings] = useState<DistributionSettings>({
    recipientType: 'groups',
    selectedContacts: [],
    selectedGroups: [],
    emailTemplate: {
      subject: `Evaluation: ${evaluation.title}`,
      message: `Hello,\n\nYou have been invited to complete an evaluation: "${evaluation.title}"\n\nPlease click the link below to get started:\n\n[EVALUATION_LINK]\n\nThank you for your participation.`,
      includeLink: true,
      includeInstructions: true,
    },
    scheduleType: 'now',
  });

  useEffect(() => {
    if (isOpen && currentTenant) {
      loadData();
    }
  }, [isOpen, currentTenant]);

  const loadData = async () => {
    if (!currentTenant) return;
    
    setIsLoading(true);
    try {
      const [contactsData, groupsData] = await Promise.all([
        backend().getContacts(currentTenant.id),
        backend().getContactGroups(currentTenant.id)
      ]);
      setContacts(contactsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load contacts and groups.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (!currentTenant) return;

    setIsSending(true);
    try {
      const distributionInput = {
        recipientType: settings.recipientType,
        contactIds: settings.selectedContacts,
        groupIds: settings.selectedGroups,
        subject: settings.emailTemplate.subject,
        message: settings.emailTemplate.message,
        includeLink: settings.emailTemplate.includeLink,
      };

      const result = await backend().distributeEvaluation(currentTenant.id, evaluation.id, distributionInput);
      
      toast({
        title: 'Success',
        description: `Evaluation sent to ${result.sentCount} recipients successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending evaluation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send evaluation.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!currentTenant || !settings.scheduledDate || !settings.scheduledTime) return;

    setIsSending(true);
    try {
      const scheduledAt = new Date(`${settings.scheduledDate.toISOString().split('T')[0]}T${settings.scheduledTime}`);
      
      const scheduleInput = {
        recipientType: settings.recipientType,
        contactIds: settings.selectedContacts,
        groupIds: settings.selectedGroups,
        subject: settings.emailTemplate.subject,
        message: settings.emailTemplate.message,
        scheduledAt,
        includeLink: settings.emailTemplate.includeLink,
      };

      const result = await backend().scheduleEvaluation(currentTenant.id, evaluation.id, scheduleInput);
      
      toast({
        title: 'Success',
        description: `Evaluation scheduled for ${scheduledAt.toLocaleString()}.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error scheduling evaluation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to schedule evaluation.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getRecipientCount = () => {
    switch (settings.recipientType) {
      case 'contacts':
        return settings.selectedContacts.length;
      case 'groups':
        return settings.selectedGroups.reduce((total, groupId) => {
          const group = groups.find(g => g.id === groupId);
          return total + (group?.contactCount || 0);
        }, 0);
      case 'all':
        return contacts.length;
      default:
        return 0;
    }
  };

  const updateSettings = (updates: Partial<DistributionSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateEmailTemplate = (updates: Partial<EmailTemplate>) => {
    setSettings(prev => ({
      ...prev,
      emailTemplate: { ...prev.emailTemplate, ...updates }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Distribute Evaluation: {evaluation.title}
          </DialogTitle>
          <DialogDescription>
            Send this evaluation to your contacts via email
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="recipients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="recipients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Recipients</CardTitle>
                <CardDescription>
                  Choose who will receive this evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-contacts"
                      checked={settings.recipientType === 'all'}
                      onCheckedChange={(checked) => 
                        checked && updateSettings({ recipientType: 'all' })
                      }
                    />
                    <Label htmlFor="all-contacts" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Contacts ({contacts.length})
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="specific-groups"
                      checked={settings.recipientType === 'groups'}
                      onCheckedChange={(checked) => 
                        checked && updateSettings({ recipientType: 'groups' })
                      }
                    />
                    <Label htmlFor="specific-groups">Specific Groups</Label>
                  </div>

                  {settings.recipientType === 'groups' && (
                    <div className="ml-6 space-y-2">
                      {groups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={settings.selectedGroups.includes(group.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateSettings({
                                  selectedGroups: [...settings.selectedGroups, group.id]
                                });
                              } else {
                                updateSettings({
                                  selectedGroups: settings.selectedGroups.filter(id => id !== group.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`group-${group.id}`} className="flex items-center gap-2">
                            {group.name}
                            <Badge variant="secondary" className="text-xs">
                              {group.contactCount}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="specific-contacts"
                      checked={settings.recipientType === 'contacts'}
                      onCheckedChange={(checked) => 
                        checked && updateSettings({ recipientType: 'contacts' })
                      }
                    />
                    <Label htmlFor="specific-contacts">Specific Contacts</Label>
                  </div>

                  {settings.recipientType === 'contacts' && (
                    <div className="ml-6">
                      <Select
                        value=""
                        onValueChange={(contactId) => {
                          if (!settings.selectedContacts.includes(contactId)) {
                            updateSettings({
                              selectedContacts: [...settings.selectedContacts, contactId]
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add contacts..." />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts
                            .filter(contact => !settings.selectedContacts.includes(contact.id))
                            .map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.firstName} {contact.lastName} ({contact.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {settings.selectedContacts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {settings.selectedContacts.map((contactId) => {
                            const contact = contacts.find(c => c.id === contactId);
                            return contact ? (
                              <div key={contactId} className="flex items-center justify-between bg-muted p-2 rounded">
                                <span className="text-sm">
                                  {contact.firstName} {contact.lastName} ({contact.email})
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateSettings({
                                    selectedContacts: settings.selectedContacts.filter(id => id !== contactId)
                                  })}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    Total recipients: <strong>{getRecipientCount()}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="message" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Message</CardTitle>
                <CardDescription>
                  Customize the email that will be sent to recipients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={settings.emailTemplate.subject}
                    onChange={(e) => updateEmailTemplate({ subject: e.target.value })}
                    placeholder="Evaluation: Your feedback is needed"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={settings.emailTemplate.message}
                    onChange={(e) => updateEmailTemplate({ message: e.target.value })}
                    placeholder="Enter your email message..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use [EVALUATION_LINK] to insert the evaluation link
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-link"
                      checked={settings.emailTemplate.includeLink}
                      onCheckedChange={(checked) => 
                        updateEmailTemplate({ includeLink: !!checked })
                      }
                    />
                    <Label htmlFor="include-link">Include evaluation link</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-instructions"
                      checked={settings.emailTemplate.includeInstructions}
                      onCheckedChange={(checked) => 
                        updateEmailTemplate({ includeInstructions: !!checked })
                      }
                    />
                    <Label htmlFor="include-instructions">Include completion instructions</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Delivery</CardTitle>
                <CardDescription>
                  Choose when to send this evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-now"
                      checked={settings.scheduleType === 'now'}
                      onCheckedChange={(checked) => 
                        checked && updateSettings({ scheduleType: 'now' })
                      }
                    />
                    <Label htmlFor="send-now" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send immediately
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule-later"
                      checked={settings.scheduleType === 'scheduled'}
                      onCheckedChange={(checked) => 
                        checked && updateSettings({ scheduleType: 'scheduled' })
                      }
                    />
                    <Label htmlFor="schedule-later" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule for later
                    </Label>
                  </div>

                  {settings.scheduleType === 'scheduled' && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schedule-date">Date</Label>
                        <Input
                          id="schedule-date"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => updateSettings({
                            scheduledDate: new Date(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="schedule-time">Time</Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          onChange={(e) => updateSettings({
                            scheduledTime: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {settings.scheduleType === 'scheduled' && settings.scheduledDate && settings.scheduledTime && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Scheduled for: <strong>
                        {new Date(`${settings.scheduledDate.toISOString().split('T')[0]}T${settings.scheduledTime}`).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {getRecipientCount()} recipients will receive this evaluation
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            
            {settings.scheduleType === 'now' ? (
              <Button 
                onClick={handleSendNow} 
                disabled={isSending || getRecipientCount() === 0}
              >
                {isSending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleSchedule} 
                disabled={isSending || getRecipientCount() === 0 || !settings.scheduledDate || !settings.scheduledTime}
              >
                {isSending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
