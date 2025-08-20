import { useState, useEffect, useRef, useCallback, useLayoutEffect, memo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAI } from '@/contexts/AIContext';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, Paperclip, X, FileText, Loader2, History } from 'lucide-react';
import { ChatService, ChatConversation } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

interface PremiumAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: Date;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  uploading?: boolean;
  error?: boolean;
}

// Premium minimalist AI chat interface (no quick action toggles)
export const PremiumAIChat = ({ isOpen, onClose }: PremiumAIChatProps) => {
  const { makeAIRequest, isFeatureEnabled } = useAI();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'ai',
    content: "Hi! I'm Flow AI. Ask anything about your finances, transactions, budgets or insights and I'll help instantly.",
    createdAt: new Date()
  }]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [persistenceEnabled, setPersistenceEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[][]>([]); // list of past conversations (simple)
  const [acceptAttr, setAcceptAttr] = useState<string>('image/*,.pdf,.csv,.txt,.xlsx,.xls,.json,.doc,.docx');
  const [dataContext, setDataContext] = useState<string>('');
  const [lastContextAt, setLastContextAt] = useState<number>(0);

  // Auto grow textarea height
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Build lightweight financial context (recent aggregates) — refreshed every 2 minutes while chat open
  useEffect(() => {
    if (!isOpen || !user) return;
    const load = async () => {
      const now = Date.now();
      if (now - lastContextAt < 120000 && dataContext) return; // cache for 2 min
      try {
        const userId = user.id;
        // Recent 50 transactions summary
        const { data: tx, error: txErr } = await (supabase as any)
          .from('transactions')
          .select('amount, category, type, date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(50);
        if (txErr) throw txErr;
        // Recent 20 invoices summary
        const { data: inv, error: invErr } = await (supabase as any)
          .from('invoices')
          .select('total, status, due_date')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (invErr) throw invErr;

        const spend = (tx||[]).filter((t:any)=>t.type==='expense').reduce((s:number,t:any)=>s+Number(t.amount||0),0);
        const income = (tx||[]).filter((t:any)=>t.type==='income').reduce((s:number,t:any)=>s+Number(t.amount||0),0);
        const topCats = Object.entries((tx||[]).reduce((acc:any,t:any)=>{acc[t.category]= (acc[t.category]||0)+Number(t.amount||0);return acc;},{}))
          .sort((a:any,b:any)=>b[1]-a[1]).slice(0,5).map(([c,v])=>`${c}:${v}`).join(', ');
        const openInvoices = (inv||[]).filter((i:any)=>i.status && i.status.toLowerCase()!=='paid');
        const overdue = openInvoices.filter((i:any)=> i.due_date && new Date(i.due_date) < new Date());
        const invoiceTotal = (inv||[]).reduce((s:number,i:any)=> s+Number(i.total||0),0);
        const ctx = `User financial snapshot: income_total=${income.toFixed(2)}, expense_total=${spend.toFixed(2)}, net=${(income-spend).toFixed(2)}, top_categories=${topCats || 'n/a'}, invoices_total=${invoiceTotal.toFixed(2)}, open_invoices=${openInvoices.length}, overdue_invoices=${overdue.length}.`;
        setDataContext(ctx);
        setLastContextAt(now);
      } catch (e) {
        // ignore silently; keep previous context
      }
    };
    load();
    const id = setInterval(load, 120000);
    return () => clearInterval(id);
  }, [isOpen, user, lastContextAt, dataContext]);

  // Bootstrap a persistent conversation & load previous messages
  useEffect(() => {
    const init = async () => {
      if (!isOpen || !user) return;
      try {
        const convo = await ChatService.getOrCreateConversation(user.id, 'Flow Chat');
        setConversation(convo);
        const past = await ChatService.getMessages(convo.id);
        if (past.length) {
          setMessages(past.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.created_at),
            attachmentUrl: m.metadata?.attachmentUrl,
            attachmentName: m.metadata?.attachmentName,
            attachmentType: m.metadata?.attachmentType
          })));
        }
        // Load limited previous conversations list (titles) – simplified as we have only latest via service
        setPersistenceEnabled(true);
      } catch (e) {
        console.warn('Chat persistence unavailable – falling back to localStorage', e);
        setPersistenceEnabled(false);
        if (user) {
          const ls = localStorage.getItem(`flow-premium-chat-${user.id}`);
            if (ls) {
              try {
                const parsed = JSON.parse(ls);
                setMessages(parsed.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })));
              } catch {}
            }
        }
      }
    };
    init();
  }, [isOpen, user]);

  const send = useCallback(async () => {
    const text = value.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: new Date() };
    setMessages(prev => {
      const next = [...prev, userMsg];
      if (!persistenceEnabled && user) localStorage.setItem(`flow-premium-chat-${user.id}`, JSON.stringify(next));
      return next;
    });
    setValue('');
    setLoading(true);
    try {
      let reply: string;
    if (isFeatureEnabled('chatAssistant')) {
        reply = await makeAIRequest({
      prompt: `You are Flow AI, a concise financial copilot. Use the provided structured snapshot to ground insights. ${dataContext}\nUser query: ${text}`,
          provider: 'google',
          model: 'gemini-pro',
          tokens: 0,
          cost: 0
        });
      } else {
        reply = genericFallback(text);
      }
      const aiMessage: ChatMessage = { id: crypto.randomUUID(), role: 'ai', content: reply, createdAt: new Date() };
      setMessages(prev => {
        const next = [...prev, aiMessage];
        if (!persistenceEnabled && user) localStorage.setItem(`flow-premium-chat-${user.id}`, JSON.stringify(next));
        return next;
      });
      // Persist both messages if enabled
      if (persistenceEnabled && user && conversation) {
        try {
          await ChatService.addMessage({ conversationId: conversation.id, userId: user.id, role: 'user', content: userMsg.content });
          await ChatService.addMessage({ conversationId: conversation.id, userId: user.id, role: 'ai', content: aiMessage.content });
        } catch (e) {
          console.warn('Failed to persist messages', e);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content: 'There was an issue answering. Please try again.', createdAt: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [value, loading, isFeatureEnabled, makeAIRequest]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const toggleRecord = () => {
    setRecording(r => !r);
    if (!recording) {
      setTimeout(() => {
        setRecording(false);
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: 'Voice note (demo captured)', createdAt: new Date() }]);
      }, 2600);
    }
  };

  const MAX_FILE_SIZE_MB = 10; // allow larger PDFs
  const bucket = 'chat-attachments';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setShowAttach(false);
    setUploading(true);
    const fileArr = Array.from(files).slice(0, 6); // cap multi-upload
  for (const file of fileArr) {
      const tooBig = file.size / (1024 * 1024) > MAX_FILE_SIZE_MB;
      const tempId = crypto.randomUUID();
      const tempMessage: ChatMessage = {
        id: tempId,
        role: 'user',
        content: tooBig ? `File too large (${formatSize(file.size)})` : file.name,
        createdAt: new Date(),
        attachmentName: file.name,
        attachmentType: file.type,
        uploading: !tooBig,
        error: tooBig
      };
      setMessages(prev => [...prev, tempMessage]);
      if (tooBig) continue;
      try {
        const path = `${user?.id || 'anon'}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, attachmentUrl: data.publicUrl, uploading: false } : m));
        if (persistenceEnabled && user && conversation) {
          try {
            await ChatService.addMessage({ conversationId: conversation.id, userId: user.id, role: 'user', content: file.name, metadata: { attachmentUrl: data.publicUrl, attachmentName: file.name, attachmentType: file.type } });
          } catch (e) { console.warn('Persist attachment failed', e); }
        }
      } catch (e: any) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, content: `Upload failed: ${e.message || 'error'}`, uploading: false, error: true } : m));
      }
    }
    setUploading(false);
  };

  const setAcceptAndPick = (type: 'image' | 'document' | 'data' | 'text' | 'any') => {
    const mapping: Record<string,string> = {
      image: 'image/*',
      document: '.pdf,.doc,.docx',
      data: '.csv,.xlsx,.xls',
      text: '.txt,.json',
      any: 'image/*,.pdf,.csv,.txt,.xlsx,.xls,.json,.doc,.docx'
    };
    const next = mapping[type] || mapping.any;
    setAcceptAttr(next);
    // Slight timeout to ensure React applies attribute before opening dialog
    setTimeout(() => fileInputRef.current?.click(), 10);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return; // moving inside
    setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + 'B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + 'KB';
    return (kb / 1024).toFixed(2) + 'MB';
  };

  const ChatBubble = memo(({ m }: { m: ChatMessage }) => {
    const bubbleBase = 'rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-[0_4px_18px_-4px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-md max-w-[70ch]';
    const bubbleStyle = m.role === 'user'
      ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-500 text-white ring-blue-400/20 dark:from-blue-600/70 dark:via-indigo-600/70 dark:to-indigo-500/70'
      : 'bg-white/90 text-gray-900 ring-black/10 dark:bg-white/6 dark:text-white/90 dark:ring-white/10';
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 14, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: .45, ease: [0.22,1,0.36,1] }}
        className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        {m.role === 'ai' && (
          <div className="mr-3 flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-600/30">
            <Bot className="size-4 text-white" />
          </div>
        )}
        <div className={`${bubbleBase} ${bubbleStyle} ${m.error ? 'ring-rose-400/60' : ''}`}>
          <div className="whitespace-pre-wrap break-words">{m.content}</div>
          {m.attachmentUrl && (
            <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-white/10 dark:ring-white/10">
              {m.attachmentType?.startsWith('image/') ? (
                <img src={m.attachmentUrl} alt={m.attachmentName} className="max-h-60 w-full object-contain" />
              ) : (
                <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-2 text-xs text-gray-700 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/10">
                  <FileText className="size-4 text-blue-600 dark:text-blue-300" /> {m.attachmentName}
                </a>
              )}
            </div>
          )}
          {m.uploading && (
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 dark:text-white/50">
              <Loader2 className="size-3 animate-spin" /> Uploading...
            </div>
          )}
          <div className="mt-2 text-[10px] tracking-wide text-gray-500 dark:text-white/40">
            {m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[75vh] p-0 overflow-hidden border-0 bg-transparent" hideClose>
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: [0.22,1,0.36,1] }} className="relative flex h-full w-full flex-col rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[rgba(17,25,40,0.65)] backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-orange-500 dark:from-blue-500 dark:via-indigo-500 dark:to-orange-400 shadow-lg shadow-indigo-600/30 ring-1 ring-black/10 dark:ring-white/10">
                <Bot className="size-6 text-white drop-shadow" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-white/70">FLOW AI</p>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 dark:from-blue-300 dark:via-white dark:to-orange-200 bg-clip-text text-transparent">Financial Copilot</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(h => !h)} className="rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/70 transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60">
                <span className="flex items-center gap-1"><History className="size-3" /> History</span>
              </button>
              <button onClick={onClose} className="group rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/70 transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60">
                <span className="flex items-center gap-1"><X className="size-3" /> <span>Close</span></span>
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="relative z-10 flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {showHistory && !loading && (
              <div className="mb-4 flex flex-wrap gap-2 text-[10px] text-gray-500 dark:text-white/40">
                <span className="font-semibold">Conversation:</span>
                <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-1">{conversation?.title || 'Current'}</span>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map(m => <ChatBubble key={m.id} m={m} />)}
              {loading && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex w-full justify-start"
                >
                  <div className="mr-3 flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-600/30">
                    <Bot className="size-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-black/5 dark:bg-white/10 px-5 py-4 text-sm ring-1 ring-black/10 dark:ring-white/10 backdrop-blur-md">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500/60 dark:bg-white/50 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500/60 dark:bg-white/50 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500/60 dark:bg-white/50 [animation-delay:240ms]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {dragActive && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-3xl border-2 border-dashed border-blue-400/50 bg-blue-500/5 backdrop-blur-sm">
                <p className="text-xs font-medium tracking-wide text-blue-200/80">Drop files to upload</p>
              </div>
            )}
          </div>

          <div className="relative z-10 border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-5 pb-5 pt-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <button aria-label="Attach files" onClick={() => setShowAttach(v => !v)} className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/5 text-gray-600 ring-1 ring-black/10 dark:bg-white/10 dark:text-white/70 dark:ring-white/10 backdrop-blur transition hover:bg-black/10 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60">
                  <Paperclip className="size-5" />
                </button>
                {showAttach && (
                  <div className="absolute bottom-14 left-0 w-64 rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[rgba(25,33,55,0.95)] p-2 shadow-2xl backdrop-blur-2xl" role="menu" aria-label="Attachment options">
                    <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-gray-500 dark:text-white/40">Add Attachment</p>
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <button onClick={() => setAcceptAndPick('image')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10" role="menuitem">
                        <span className="inline-block h-2 w-2 rounded-full bg-pink-500" /> Image
                      </button>
                      <button onClick={() => setAcceptAndPick('document')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10" role="menuitem">
                        <FileText className="size-4 text-blue-600 dark:text-blue-300" /> PDF / Doc
                      </button>
                      <button onClick={() => setAcceptAndPick('data')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10" role="menuitem">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> CSV / XLSX
                      </button>
                      <button onClick={() => setAcceptAndPick('text')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10" role="menuitem">
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" /> Text / JSON
                      </button>
                    </div>
                    <button onClick={() => setAcceptAndPick('any')} className="w-full rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2 text-center text-[11px] font-medium text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20">Browse Any</button>
                    <p className="px-2 pt-2 text-[10px] text-gray-500 dark:text-white/30">Up to 6 files • {MAX_FILE_SIZE_MB}MB each • Drag & drop supported</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" multiple accept={acceptAttr} className="hidden" onChange={e => handleFiles(e.target.files)} />
              </div>
              <div className="flex-1 flex flex-col">
                <div className={`relative flex items-center min-h-12 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 focus-within:ring-2 focus-within:ring-blue-400/60 bg-black/5 dark:bg-white/5 backdrop-blur-md transition px-3 ${recording ? 'outline outline-2 outline-rose-400/60' : ''}`}> 
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Ask anything about your finances..."
                    className="block max-h-40 w-full resize-none bg-transparent pr-24 py-3 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button aria-label="Record voice" onClick={toggleRecord} className={`flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 dark:text-white/70 transition hover:text-gray-900 dark:hover:text-white ${recording ? 'animate-pulse bg-rose-500/70 text-white ring-1 ring-rose-300/50' : 'bg-black/5 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/10 hover:bg-black/10 dark:hover:bg-white/20'}`}> <Mic className="size-4" /> </button>
                    <button aria-label="Send message" disabled={!value.trim() || loading} onClick={send} className="group flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 text-white shadow-md shadow-indigo-600/30 transition hover:brightness-110 disabled:opacity-40 ring-1 ring-blue-400/20">
                      <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-y-1">
                  <p className="text-[10px] tracking-wider text-gray-500 dark:text-white/40">Model: {isFeatureEnabled('chatAssistant') ? 'Gemini (live)' : 'Local heuristic'} {uploading && <span className="inline-flex items-center gap-1 ml-1"><Loader2 className="size-3 animate-spin" /> Uploading</span>}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/30">Enter ⏎ to send • Shift+Enter newline • Drop files to upload</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

function genericFallback(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes('budget')) return 'Consider a 50/30/20 allocation: essentials, discretionary, savings. I can outline a custom breakdown — ask "create a monthly plan".';
  if (lower.includes('spend') || lower.includes('expense')) return 'Focus on top 3 categories: subscriptions, dining, transport. Trimming 8–12% there improves monthly surplus meaningfully.';
  if (lower.includes('save')) return 'Automate transfers to a high-yield account right after income posts; treat savings as a fixed expense.';
  if (lower.includes('trend')) return 'Month-over-month variation typically stabilizes when you track recurring vs variable flows separately — want a quick template?';
  return 'I can analyze spending patterns, budgets, savings rate, runway forecasts & more. Try: "What are my largest variable costs?"';
}

export default PremiumAIChat;
