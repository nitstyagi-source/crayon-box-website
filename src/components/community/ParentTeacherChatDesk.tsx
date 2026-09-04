"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Clock,
  Send,
  Languages,
  Sparkles,
  Search,
  Check,
  CheckCheck,
  Moon,
  Sun,
  Lock,
  User,
  PhoneOff,
  Smile,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  getChatThreadsAction,
  getThreadMessagesAction,
  sendChatMessageAction,
  ChatThread,
  ChatMessage
} from '@/app/actions/parent-chat-actions';

const INITIAL_DEMO_THREADS: ChatThread[] = [
  {
    id: 'thread-01',
    student_id: 'stu-01',
    student_name: 'Aarav Sharma',
    grade_section: 'Class 5-A',
    teacher_name: 'Dr. Sunita Rao (Class Teacher)',
    parent_name: 'Rajesh Sharma (Father)',
    parent_phone: '+91 98112 34567',
    quiet_hours_enabled: true,
    last_message_text: 'Thank you maam, Aarav will submit the Science fair model tomorrow morning.',
    last_message_at: new Date().toISOString(),
    unread_count: 1
  },
  {
    id: 'thread-02',
    student_id: 'stu-02',
    student_name: 'Ananya Verma',
    grade_section: 'Class 3-B',
    teacher_name: 'Pooja Aggarwal (Class Teacher)',
    parent_name: 'Vikram Verma (Father)',
    parent_phone: '+91 98112 99887',
    quiet_hours_enabled: true,
    last_message_text: 'Please note that Ananya has a mild cold and will not participate in swimming today.',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 0
  },
  {
    id: 'thread-03',
    student_id: 'stu-03',
    student_name: 'Vihaan Tyagi',
    grade_section: 'Class 8-A',
    teacher_name: 'Manish Tyagi (Math Faculty)',
    parent_name: 'Nitin Tyagi (Father)',
    parent_phone: '+91 99990 12345',
    quiet_hours_enabled: true,
    last_message_text: 'Sir, could you share the reference worksheet for quadratic equations?',
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 0
  }
];

const INITIAL_DEMO_MSGS: ChatMessage[] = [
  {
    id: 'msg-1',
    thread_id: 'thread-01',
    sender_role: 'TEACHER',
    sender_name: 'Dr. Sunita Rao',
    content: 'Dear Mr. Sharma, Aarav did exceptionally well in today\'s robotics lab demonstration.',
    translated_content: 'प्रिय श्री शर्मा, आरव ने आज की रोबोटिक्स लैब प्रदर्शन में असाधारण प्रदर्शन किया।',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_read: true
  },
  {
    id: 'msg-2',
    thread_id: 'thread-01',
    sender_role: 'PARENT',
    sender_name: 'Rajesh Sharma',
    content: 'Thank you ma\'am, Aarav will submit the Science fair model tomorrow morning.',
    translated_content: 'धन्यवाद मैम, आरव कल सुबह विज्ञान मेले का मॉडल जमा करेगा।',
    created_at: new Date(Date.now() - 900000).toISOString(),
    is_read: true
  }
];

export function ParentTeacherChatDesk() {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_DEMO_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-01');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_DEMO_MSGS);
  const [inputMessage, setInputMessage] = useState('');
  const [showTranslations, setShowTranslations] = useState(false);
  const [senderRole, setSenderRole] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickReplies = [
    "Thank you for the update. I have noted this in the class register.",
    "Aarav is performing wonderfully in today's activities!",
    "Please ensure the homework worksheet is completed by Friday.",
    "I will discuss this in person during the upcoming PTM slot."
  ];

  const loadThreads = async () => {
    setIsLoading(true);
    const res = await getChatThreadsAction();
    if (res.success && res.threads) {
      setThreads(res.threads);
      if (res.threads.length > 0 && !activeThreadId) {
        setActiveThreadId(res.threads[0].id);
      }
    }
    setIsLoading(false);
  };

  const loadMessages = async (threadId: string) => {
    const res = await getThreadMessagesAction(threadId);
    if (res.success && res.messages) {
      setMessages(res.messages);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    setIsSending(true);

    const activeThread = threads.find((t) => t.id === activeThreadId);
    const senderName = senderRole === 'TEACHER'
      ? (activeThread?.teacher_name || 'Class Teacher')
      : (activeThread?.parent_name || 'Parent');

    const res = await sendChatMessageAction({
      threadId: activeThreadId,
      senderRole,
      senderName,
      content: inputMessage
    });

    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message!]);
      setInputMessage('');
    }

    setIsSending(false);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const filteredThreads = threads.filter(
    (t) =>
      t.student_name.toLowerCase().includes(search.toLowerCase()) ||
      t.parent_name.toLowerCase().includes(search.toLowerCase()) ||
      t.grade_section.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Teacher-Parent Encrypted In-App Chat with Privacy Shield
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Phone Number Masked
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Direct two-way classroom messaging without exposing personal teacher mobile numbers. Enforces statutory quiet hours with built-in English ↔ Hindi translation.
            </p>
          </div>
        </div>

        {/* Quiet Hours Status Pill */}
        <div className="flex items-center gap-2 bg-white border border-[#E8DFC8] px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs">
          <Moon className="w-4 h-4 text-indigo-600" />
          <span>Quiet Hours: 04:30 PM – 08:00 AM</span>
        </div>
      </div>

      {/* Main Chat Layout: Left Threads Roster & Right Interactive Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Left: Chat Thread Selector (4 cols) */}
        <div className="lg:col-span-4 border border-[#E8DFC8] rounded-2xl bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#E8DFC8] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Active Student Chats
              </h4>
              <span className="text-[11px] text-stone-500 font-semibold font-mono">
                {threads.length} Threads
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search student or parent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs border-[#E8DFC8] h-8"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E8DFC8]">
            {filteredThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`w-full text-left p-3.5 transition flex items-start justify-between gap-2 ${
                  activeThreadId === t.id
                    ? 'bg-amber-50/60 border-l-4 border-[#D97706]'
                    : 'hover:bg-stone-50'
                }`}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-xs truncate">
                      {t.student_name}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                      {t.grade_section}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {t.parent_name}
                  </div>
                  <p className="text-[11px] text-stone-600 truncate italic">
                    {t.last_message_text}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block font-medium">
                    {new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {t.unread_count > 0 && (
                    <span className="inline-block mt-1 w-4 h-4 bg-[#D97706] text-white text-[10px] font-bold rounded-full text-center leading-4">
                      {t.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Message Window (8 cols) */}
        <div className="lg:col-span-8 border border-[#E8DFC8] rounded-2xl bg-white shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          {activeThread ? (
            <div className="p-3.5 border-b border-[#E8DFC8] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-[#D97706] border border-amber-200 flex items-center justify-center font-bold text-sm">
                  {activeThread.student_name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>{activeThread.student_name} ({activeThread.grade_section})</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Encrypted Channel
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {activeThread.parent_name} • <PhoneOff className="w-3 h-3 inline text-stone-400 mr-0.5" /> Mobile masked
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Role Switcher for Pair Testing */}
                <div className="flex items-center border border-[#E8DFC8] rounded-lg p-0.5 bg-white text-[11px]">
                  <button
                    onClick={() => setSenderRole('TEACHER')}
                    className={`px-2 py-1 rounded font-semibold transition ${
                      senderRole === 'TEACHER'
                        ? 'bg-amber-100 text-[#D97706]'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Teacher View
                  </button>
                  <button
                    onClick={() => setSenderRole('PARENT')}
                    className={`px-2 py-1 rounded font-semibold transition ${
                      senderRole === 'PARENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Parent View
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTranslations(!showTranslations)}
                  className={`text-xs h-8 border-[#E8DFC8] ${showTranslations ? 'bg-amber-100 text-[#D97706]' : 'bg-white'}`}
                >
                  <Languages className="w-3.5 h-3.5 mr-1" />
                  {showTranslations ? 'Hide Hindi' : 'Translate'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-[#E8DFC8] bg-[#FAF7F2] text-xs text-stone-500">
              Select a conversation thread
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF9]">
            {messages.map((m) => {
              const isTeacher = m.sender_role === 'TEACHER';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-stone-400 font-semibold mb-1 px-1">
                    {m.sender_name} ({isTeacher ? 'Faculty' : 'Parent'})
                  </div>
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs space-y-1.5 shadow-2xs ${
                      isTeacher
                        ? 'bg-[#FAF7F2] text-stone-900 border border-[#E8DFC8] rounded-tr-none'
                        : 'bg-white text-stone-900 border border-emerald-200 rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{m.content}</p>

                    {showTranslations && m.translated_content && (
                      <div className="pt-1 border-t border-stone-200/60 text-[11px] text-stone-600 font-serif italic">
                        {m.translated_content}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[10px] text-stone-400 pt-0.5">
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Bar */}
          <div className="p-2 border-t border-[#E8DFC8] bg-white overflow-x-auto flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-stone-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D97706]" /> Quick:
            </span>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => setInputMessage(reply)}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-stone-900 text-[11px] whitespace-nowrap transition border border-stone-200"
              >
                {reply.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[#E8DFC8] bg-[#FAF7F2] flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={`Type a secure message as ${senderRole === 'TEACHER' ? 'Teacher' : 'Parent'}...`}
              className="text-xs bg-white border-[#E8DFC8]"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSending || !inputMessage.trim()}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold shadow-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
