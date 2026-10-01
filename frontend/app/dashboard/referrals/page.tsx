'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Briefcase,
  ExternalLink,
  Mail,
  Copy,
  Linkedin,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { demoCompanies } from '@/lib/demo-data';
import type { ReferralContact } from '@/lib/types';

export default function ReferralsPage() {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState(demoCompanies[0]);
  const [requestDialog, setRequestDialog] = useState<ReferralContact | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestedContacts, setRequestedContacts] = useState<string[]>([]);

  const handleOpenRequest = (contact: ReferralContact) => {
    const message = `Hi ${contact.name}, I'm interested in a role at ${contact.company}. I noticed your experience in ${contact.relevance}. Would you be open to sharing any advice about the role or referring a suitable candidate? Thank you.`;
    setRequestMessage(message);
    setRequestDialog(contact);
  };

  const handleSendRequest = () => {
    if (requestDialog) {
      setRequestedContacts([...requestedContacts, requestDialog.id]);
      toast({
        title: 'Referral request ready',
        description: 'Review and send this message through the contact\'s public profile. CareerPilot AI does not send messages automatically.',
      });
      setRequestDialog(null);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(requestMessage);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals"
        description="Find referral contacts at your target companies"
        badge={<DemoBadge />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Company List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Companies</h2>
          {demoCompanies.map((company) => (
            <Card
              key={company.id}
              className={`cursor-pointer border-border transition-all hover:shadow-sm ${
                selectedCompany?.id === company.id ? 'ring-2 ring-accent/20' : ''
              }`}
              onClick={() => setSelectedCompany(company)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.openJobs} open jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Details */}
        <div className="space-y-6 lg:col-span-2">
          {selectedCompany && (
            <>
              {/* Company Info */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Building2 className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground">{selectedCompany.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" /> {selectedCompany.website}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {selectedCompany.location}
                        </span>
                        <span>{selectedCompany.industry}</span>
                        {selectedCompany.employeeCount && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {selectedCompany.employeeCount}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-foreground">{selectedCompany.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leadership */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Leadership</CardTitle>
                  <CardDescription>Public company leadership information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedCompany.leadership.map((leader, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent/10 text-accent text-xs">
                            {leader.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{leader.name}</p>
                          <p className="text-xs text-muted-foreground">{leader.role}</p>
                        </div>
                        {leader.profileUrl && (
                          <a href={`https://${leader.profileUrl}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Referral Contacts */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Referral Contacts</CardTitle>
                  <CardDescription>
                    Public profiles — reach out for advice or referrals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedCompany.referralContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent/10 text-accent text-sm">
                            {contact.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{contact.relevance}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {requestedContacts.includes(contact.id) ? (
                          <Badge className="border-0 bg-success/15 text-success gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Requested
                          </Badge>
                        ) : contact.connectionStatus === 'connected' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Linkedin className="h-3 w-3" /> Connected
                          </Badge>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => handleOpenRequest(contact)}
                          disabled={requestedContacts.includes(contact.id)}
                        >
                          <Mail className="h-3.5 w-3.5" /> Request Referral
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Privacy Notice */}
              <div className="rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground">
                CareerPilot AI only displays publicly available or user-authorized information.
                Private phone numbers, email addresses, and restricted data are never exposed.
                You must review and send referral messages yourself.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Referral Request Dialog */}
      <Dialog open={!!requestDialog} onOpenChange={(open) => !open && setRequestDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Referral Request Message</DialogTitle>
            <DialogDescription>
              Review and edit this message before sending it through the contact&apos;s public profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopyMessage}>
                <Copy className="h-3.5 w-3.5" /> Copy Message
              </Button>
              <span className="text-xs text-muted-foreground">
                {requestMessage.length} characters
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest} className="gap-2">
              <UserPlus className="h-4 w-4" /> Mark as Requested
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
