import { supabase } from '@/integrations/supabase/client';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'ai';
  content: string;
  metadata?: any;
  created_at: string;
}

export const ChatService = {
  async createConversation(userId: string, title?: string) {
    const { data, error } = await (supabase as any)
      .from('chat_conversations')
      .insert({ user_id: userId, title: title || 'New chat' })
      .select('*')
      .single();
    if (error) throw error;
    return data as ChatConversation;
  },

  async getOrCreateConversation(userId: string, title?: string) {
    const { data, error } = await (supabase as any)
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && (error as any).code !== 'PGRST116') throw error;
    if (data) return data as ChatConversation;

    const { data: created, error: createError } = await (supabase as any)
      .from('chat_conversations')
      .insert({ user_id: userId, title: title || 'New chat' })
      .select('*')
      .single();
    if (createError) throw createError;
    return created as ChatConversation;
  },

  async listConversations(userId: string) {
    const { data, error } = await (supabase as any)
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ChatConversation[];
  },

  async getMessages(conversationId: string) {
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as ChatMessage[];
  },

  async addMessage(params: { conversationId: string; userId: string; role: 'user' | 'ai'; content: string; metadata?: any; }) {
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .insert({
        conversation_id: params.conversationId,
        user_id: params.userId,
        role: params.role,
        content: params.content,
        metadata: params.metadata || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as ChatMessage;
  }
};
