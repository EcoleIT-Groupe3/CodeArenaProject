import { useEffect, useState, useRef } from 'react';
import { chatService, roomService } from '../services/api';

interface Message {
  id: string;
  message: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url?: string;
  };
}

interface RoomChatProps {
  roomId: string;
}

export default function RoomChat({ roomId }: RoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();

    const subscription = roomService.subscribeToChat(roomId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      await chatService.sendMessage(roomId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {msg.profile.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {msg.profile.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
