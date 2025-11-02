import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare } from "lucide-react";
import { NewTicket } from "@/components/NewTicket";

const Tickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState([
    { id: "#T-001", customer: "John Doe", subject: "Order not received", priority: "High", status: "Open", created: "2024-01-15", updated: "2024-01-15" },
    { id: "#T-002", customer: "Jane Smith", subject: "Product defect", priority: "Medium", status: "In Progress", created: "2024-01-14", updated: "2024-01-15" },
    { id: "#T-003", customer: "Bob Johnson", subject: "Refund request", priority: "Low", status: "Resolved", created: "2024-01-13", updated: "2024-01-14" },
    { id: "#T-004", customer: "Alice Brown", subject: "Login issues", priority: "High", status: "Open", created: "2024-01-12", updated: "2024-01-12" },
    { id: "#T-005", customer: "Charlie Wilson", subject: "Shipping inquiry", priority: "Medium", status: "In Progress", created: "2024-01-11", updated: "2024-01-13" },
  ]);

  const filteredTickets = tickets.filter(ticket =>
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTicketCreate = (newTicket: any) => {
    setTickets([newTicket, ...tickets]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-2">Manage customer support requests and inquiries</p>
        </div>
        <NewTicket onTicketCreate={handleTicketCreate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-sm text-gray-600">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">45</div>
            <p className="text-sm text-gray-600">Resolved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-600">2.5h</div>
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ticket Management</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Ticket ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-blue-600">{ticket.id}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{ticket.customer}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{ticket.subject}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{ticket.created}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;
