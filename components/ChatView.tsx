import React, { useState, useEffect, useRef } from 'react';

interface ChatViewProps {
    user: any;
    targetUserId?: string | null;
}

const ChatView: React.FC<ChatViewProps> = ({ user, targetUserId }) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (targetUserId && user && conversations.length > 0) {
            // Check if we already have a conversation with this user
            const existingConv = conversations.find(c => c.otherUser.id === targetUserId);
            if (existingConv) {
                setSelectedConversation(existingConv);
            } else {
                // If not, we might need to create one or just show a placeholder
                // For now, let's just create a dummy "new chat" UI
            }
        }
    }, [targetUserId, conversations, user]);

    const fetchConversations = async () => {
        try {
            const res = await fetch(`/api/messages/conversations?userId=${user.id}`);
            const data = await res.json();
            setConversations(data);
            setLoading(false);

            // If we have a targetUserId, try to select it
            if (targetUserId) {
                const existingConv = data.find((c: any) => c.otherUser.id === targetUserId);
                if (existingConv) {
                    setSelectedConversation(existingConv);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await fetch(`/api/messages/${conversationId}?userId=${user.id}`);
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const receiverId = selectedConversation ? selectedConversation.otherUser.id : targetUserId;
        if (!receiverId) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId,
                    content: newMessage
                })
            });

            if (res.ok) {
                setNewMessage('');
                if (selectedConversation) {
                    fetchMessages(selectedConversation.id);
                } else {
                    // New conversation created
                    await fetchConversations();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading chats...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 h-[80vh]">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex h-full overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <h2 className="text-xl font-black text-gray-900">Conversations</h2>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversations.length > 0 ? (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-6 flex items-center gap-4 transition-all hover:bg-white ${selectedConversation?.id === conv.id ? 'bg-white shadow-sm z-10' : ''}`}
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {conv.otherUser.name[0]}
                                    </div>
                                    <div className="text-left flex-grow min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-gray-900 truncate">{conv.otherUser.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                    </div>
                                    {selectedConversation?.id === conv.id && (
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-400">
                                <p className="text-sm font-bold uppercase tracking-widest mb-2">No active chats</p>
                                <p className="text-xs">Start messaging from job posts or profiles</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-grow flex flex-col bg-white">
                    {selectedConversation || targetUserId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-white/50 backdrop-blur-md">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {(selectedConversation?.otherUser?.name || 'User')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedConversation?.otherUser?.name || 'New Message'}</h3>
                                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        Active Now
                                    </span>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium ${msg.sender_id === user.id
                                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100'
                                                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <div className={`text-[9px] mt-1 font-bold uppercase ${msg.sender_id === user.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-gray-100 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Type your message here..."
                                        className="flex-grow bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-blue-600 text-white px-8 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center p-10 bg-gray-50/30">
                            <div>
                                <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Select a Conversation</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                                    Choose an existing user from the list or start a new chat from search results.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatView;
