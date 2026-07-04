'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { MessageSquare, Send, Loader } from 'lucide-react';

interface ChatRoom {
  id: string;
  gigTitle: string;
  participants: { id: string; firstName: string; lastName: string }[];
  lastMessage?: { content: string; createdAt: string };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    api.getChatRooms()
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setLoadingMessages(true);
    try {
      const msgs = await api.getChatMessages(room.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-brandGreen" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Messages</h1>
        <p className="text-muted mt-2">Chat with clients and freelancers on active contracts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[400px]">
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-semibold text-sm text-ink">Conversations</div>
          {rooms.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted text-center">No conversations yet</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-gray-50 ${selectedRoom?.id === room.id ? 'bg-brandGreen/5' : ''}`}
              >
                <p className="text-sm font-medium text-ink truncate">{room.gigTitle}</p>
                {room.lastMessage && (
                  <p className="text-xs text-muted truncate mt-0.5">{room.lastMessage.content}</p>
                )}
              </button>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-border flex flex-col">
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-muted">
              <MessageSquare className="w-8 h-8 mr-2 opacity-40" />
              Select a conversation
            </div>
          ) : loadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin text-brandGreen" />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border font-semibold text-sm text-ink">
                {selectedRoom.gigTitle}
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted text-center py-8">No messages yet. Real-time chat uses WebSocket at /chat namespace.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-semibold text-ink">{msg.sender.firstName}: </span>
                      <span className="text-muted">{msg.content}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    disabled
                    placeholder="Real-time messaging via WebSocket (coming soon in UI)"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-gray-50"
                  />
                  <button disabled className="p-2 bg-brandGreen/30 text-white rounded-lg">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
