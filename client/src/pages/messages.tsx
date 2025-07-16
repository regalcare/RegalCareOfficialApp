import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Phone, Archive } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "/server/schema";
import { format } from "date-fns";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: { customerId: number | null; customerName: string; message: string; isFromCustomer: boolean }) => {
      await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Message> }) => {
      await apiRequest("PUT", `/api/messages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const filteredMessages = messages?.filter((message) =>
    message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      updateMessageMutation.mutate({
        id: message.id,
        data: { isRead: true }
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMessage) return;

    createMessageMutation.mutate({
      customerId: selectedMessage.customerId,
      customerName: selectedMessage.customerName,
      message: newMessage,
      isFromCustomer: false
    });
  };

  const getConversationMessages = (customerName: string) => {
    return messages?.filter(msg => msg.customerName === customerName)
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) || [];
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading messages...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
        <p className="text-gray-600">Customer communications and service requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="divide-y divide-gray-200">
                  {filteredMessages.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No messages found
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                        }`}
                        onClick={() => handleMessageSelect(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{message.customerName}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {message.createdAt ? format(new Date(message.createdAt), 'PPp') : 'Unknown time'}
                            </p>
                          </div>
                          {!message.isRead && (
                            <span className="w-3 h-3 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="h-full flex flex-col">
              {/* Message Header */}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedMessage.customerName}</CardTitle>
                    <p className="text-sm text-gray-600">Customer ID: {selectedMessage.customerId}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone size={16} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Message Thread */}
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {getConversationMessages(selectedMessage.customerName).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 ${
                            msg.isFromCustomer
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-primary text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.isFromCustomer ? 'text-gray-500' : 'text-blue-100'
                          }`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'PPp') : 'Unknown time'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex space-x-4 border-t pt-4">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <p className="text-gray-500 text-center">
                  Select a message to view the conversation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
