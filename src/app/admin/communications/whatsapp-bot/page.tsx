"use client";

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Phone,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

export default function WhatsAppBotSimulatorPage() {
  const [messages, setMessages] = useState<Array<{ sender: 'PARENT' | 'BOT'; text: string; time: string }>>([
    {
      sender: 'BOT',
      text: "👋 Welcome to Crayon Box School 2-Way Assistant! Reply with FEES, ATTENDANCE, HOMEWORK, or BUS.",
      time: '10:00 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const parentMsg = {
      sender: 'PARENT' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, parentMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('From', '+919810022334');
      formData.append('Body', textToSend);

      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        body: formData
      });

      const xmlText = await res.text();
      // Extract Body from TwiML XML
      const match = xmlText.match(/<Body>([\s\S]*?)<\/Body>/);
      const botReply = match ? match[1] : "Message received.";

      setMessages((prev) => [
        ...prev,
        {
          sender: 'BOT',
          text: botReply.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'BOT', text: 'Error connecting to chatbot webhook.', time: 'Now' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <VastuModuleBanner
        badgeText="CONVERSATIONAL AI & MESSAGING"
        title="2-Way WhatsApp Interactive Chatbot Simulator"
        description="Simulate parent keyword queries (FEES, ATTENDANCE, HOMEWORK, BUS) against live database triggers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Keyword Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-600" /> Supported Chatbot Intents
            </h3>
            <p className="text-xs text-stone-500">
              Parents can text keywords directly on WhatsApp to query their child's records:
            </p>

            <div className="space-y-2 pt-2">
              {[
                { label: 'Check Pending Fees', query: 'FEES', desc: 'Fetches invoices & Razorpay link' },
                { label: 'Check Attendance', query: 'ATTENDANCE', desc: 'Calculates monthly % and muster' },
                { label: 'Today\'s Homework', query: 'HOMEWORK', desc: 'Reads daily digital diary' },
                { label: 'Track School Bus', query: 'BUS', desc: 'Live GPS ETA & Driver Phone' },
                { label: 'Main Menu', query: 'MENU', desc: 'Lists all available commands' }
              ].map((k) => (
                <button
                  key={k.query}
                  onClick={() => handleSend(k.query)}
                  className="w-full text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 transition text-xs cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-stone-800">{k.label}</span>
                    <span className="block text-[10px] text-stone-400">{k.desc}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    "{k.query}"
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* WhatsApp Mobile Chat Simulator (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-0 border-stone-300 shadow-lg overflow-hidden flex flex-col h-[550px] bg-[#EFEAE2]">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs border border-emerald-400/40">
                  CBS
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">Crayon Box School Assistant</h4>
                  <span className="text-[10px] text-emerald-200 font-medium">Official WhatsApp Business Verified</span>
                </div>
              </div>
              <Phone className="w-4 h-4 text-emerald-200" />
            </div>

            {/* Chat Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'PARENT' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                      m.sender === 'PARENT'
                        ? 'bg-[#E7FFDB] text-stone-900 rounded-tr-none'
                        : 'bg-white text-stone-900 rounded-tl-none'
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="text-[9px] text-stone-400 text-right mt-1 font-mono">
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white p-2.5 rounded-2xl text-xs text-stone-400 italic shadow-2xs">
                    Assistant is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type FEES, ATTENDANCE, HOMEWORK, or BUS..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
              <Button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="bg-[#075E54] hover:bg-[#064C44] text-white p-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
