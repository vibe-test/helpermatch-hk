import express from 'express';
import { supabase } from '../db';
import { z } from 'zod';

const router = express.Router();

const MessageSchema = z.object({
    conversationId: z.string().optional(),
    receiverId: z.string(),
    content: z.string().min(1),
});

// Get all conversations for the current user
router.get('/conversations', async (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Fetch conversations where the user is either user1 or user2
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                user1:users!conversations_user1_id_fkey(id, name, email),
                user2:users!conversations_user2_id_fkey(id, name, email)
            `)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Simplify conversation data for frontend
        const result = conversations?.map(conv => {
            const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
            return {
                id: conv.id,
                otherUser,
                lastMessage: conv.last_message,
                updatedAt: conv.updated_at,
            };
        });

        res.json(result || []);
    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a specific conversation
router.get('/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Verify user is part of the conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .single();

        if (convError || !conversation) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages as read
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId);

        res.json(messages || []);
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/', async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Find or create conversation
        let { data: conversation, error: findError } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(user1_id.eq.${senderId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${senderId})`)
            .maybeSingle();

        if (findError) throw findError;

        if (!conversation) {
            const convId = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([
                    {
                        id: convId,
                        user1_id: senderId,
                        user2_id: receiverId,
                        last_message: content
                    }
                ])
                .select()
                .single();

            if (createError || !newConv) throw new Error(createError?.message || 'Failed to create conversation');
            conversation = newConv;
        } else {
            // Update last message and timestamp
            await supabase
                .from('conversations')
                .update({ last_message: content, updated_at: new Date().toISOString() })
                .eq('id', conversation.id);
        }

        if (!conversation) throw new Error('Conversation not found');

        // 2. Insert message
        const messageId = `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert([
                {
                    id: messageId,
                    conversation_id: conversation.id,
                    sender_id: senderId,
                    content: content,
                    is_read: false
                }
            ])
            .select()
            .single();

        if (msgError) throw msgError;

        res.status(201).json(message);
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
