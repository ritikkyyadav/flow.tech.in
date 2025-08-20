-- Create chat tables for AI assistant
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  last_message text,
  last_message_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('user','ai')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists chat_conversations_user_id_idx on public.chat_conversations(user_id);
create index if not exists chat_messages_conversation_id_idx on public.chat_messages(conversation_id);
create index if not exists chat_messages_user_id_idx on public.chat_messages(user_id);

-- Row Level Security
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Policies: only owner can access their data
create policy if not exists "conversations_select_own" on public.chat_conversations
  for select using (auth.uid() = user_id);

create policy if not exists "conversations_modify_own" on public.chat_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "messages_select_own" on public.chat_messages
  for select using (auth.uid() = user_id);

create policy if not exists "messages_modify_own" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger to maintain updated_at and last_message
create or replace function public.update_conversation_timestamp() returns trigger as $$
begin
  update public.chat_conversations
    set updated_at = now(),
        last_message = new.content,
        last_message_at = now()
    where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chat_messages_update_conv on public.chat_messages;
create trigger trg_chat_messages_update_conv
after insert on public.chat_messages
for each row execute function public.update_conversation_timestamp();
