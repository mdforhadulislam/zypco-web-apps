"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";

export default function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Using generic API service since we don't have a specific contact service
      const response = await apiService.get("/contacts", { limit: 50 });
      if (response.success) {
        setContacts(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch contacts");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (contact: any) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  const handleMarkAsRead = async (contact: any) => {
    try {
      const response = await apiService.patch(`/contacts/${contact._id}`, { 
        status: "read" 
      });
      if (response.success) {
        toast.success("Contact marked as read");
        fetchContacts();
      } else {
        toast.error(response.message || "Failed to update contact");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      unread: "secondary",
      read: "outline",
      responded: "default",
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status || "unread"}
      </Badge>
    );
  };

  const getSubjectIcon = (subject: string) => {
    if (subject?.toLowerCase().includes("support")) return <AlertCircle className="h-4 w-4" />;
    if (subject?.toLowerCase().includes("inquiry")) return <MessageCircle className="h-4 w-4" />;
    return <Mail className="h-4 w-4" />;
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          {getSubjectIcon(row.subject)}
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "createdAt",
      label: "Received",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const ContactDetails = ({ contact }: { contact: any }) => (
    <div className="space-y-6" data-testid="contact-details">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{contact.subject || "Contact Message"}</h3>
        {getStatusBadge(contact.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="font-medium">{contact.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="font-medium">{contact.email}</p>
        </div>
        {contact.phone && (
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="font-medium">{contact.phone}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-500">Received</label>
          <p className="font-medium">{new Date(contact.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {contact.message && (
        <div>
          <label className="text-sm font-medium text-gray-500">Message</label>
          <div className="mt-1 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-2 pt-4 border-t">
        {contact.status !== "read" && (
          <Button 
            onClick={() => handleMarkAsRead(contact)}
            className="flex items-center space-x-2"
            data-testid="mark-read-btn"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark as Read</span>
          </Button>
        )}
        <Button 
          variant="outline"
          className="flex items-center space-x-2"
          onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
          data-testid="reply-email-btn"
        >
          <Mail className="h-4 w-4" />
          <span>Reply via Email</span>
        </Button>
        {contact.phone && (
          <Button 
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
            data-testid="call-btn"
          >
            <Phone className="h-4 w-4" />
            <span>Call</span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div className="space-y-6" data-testid="contact-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">
            View and manage customer inquiries and support requests
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter((contact: any) => contact.status === "unread" || !contact.status).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Responded</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter((contact: any) => contact.status === "responded").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter((contact: any) => {
                      const contactDate = new Date(contact.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return contactDate >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          title="Contact Messages"
          data={contacts}
          columns={columns}
          searchKeys={["name", "email", "subject", "message"]}
          onView={handleView}
          loading={loading}
          actions={[
            {
              label: "View Message",
              onClick: handleView,
              variant: "default",
            },
            {
              label: "Mark as Read",
              onClick: handleMarkAsRead,
              variant: "default",
              condition: (contact) => contact.status !== "read",
            },
            {
              label: "Reply",
              onClick: (contact) => window.open(`mailto:${contact.email}`, '_blank'),
              variant: "default",
            },
          ]}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Message Details</DialogTitle>
            </DialogHeader>
            {selectedContact && <ContactDetails contact={selectedContact} />}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {contacts.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No contact messages</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Contact messages will appear here when customers reach out.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}