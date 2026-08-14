/**
 * Qarayti.ai — Teacher Portal: Sub-Module 8: Messaging & Parent/Student Communication
 * Direct messaging threads with parents and students, attachment sharing, and response logs.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { MessageSquare, Send, Paperclip, CheckCheck, User, Search } from 'lucide-react';

export const MessagingView: React.FC = () => {
  const { threads, sendTeacherMessage } = useTeacherPortal();
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    sendTeacherMessage(activeThread.id, messageInput);
    setMessageInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-lg font-serif italic text-[#EAE9E6]">Messagerie Pédagogique & Suivi Parent/Élève</h2>
        </div>
      </div>

      {/* Main Messaging Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px]">
        {/* Threads Sidebar */}
        <div className="bg-[#161920] border border-[#2D333D] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#2D333D]">
            <div className="text-xs font-mono font-bold text-[#8E9299] uppercase">Discussions Active ({threads.length})</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2D333D]">
            {threads.map((thread) => {
              const isSelected = thread.id === selectedThreadId;
              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-4 transition-all space-y-1 block ${
                    isSelected ? 'bg-[#0F1115] border-l-2 border-l-[#D4AF37]' : 'hover:bg-[#0F1115]/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-serif font-bold text-[#EAE9E6]">{thread.recipientName}</span>
                    <span className="text-[10px] font-mono text-[#8E9299]">{thread.lastTimestamp}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#D4AF37]">{thread.subjectName}</div>
                  <p className="text-xs font-mono text-[#8E9299] truncate">{thread.lastMessage}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-[#161920] border border-[#2D333D] flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Active Thread Header */}
              <div className="p-4 border-b border-[#2D333D] bg-[#0F1115] flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#EAE9E6]">{activeThread.recipientName}</h3>
                  <p className="text-[10px] font-mono text-[#8E9299]">{activeThread.recipientRoleOrChild}</p>
                </div>
                <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                  {activeThread.recipientType}
                </span>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0F1115]/40">
                {activeThread.messages.map((msg) => {
                  const isTeacher = msg.sender === 'TEACHER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 text-xs font-mono border ${
                          isTeacher
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#EAE9E6]'
                            : 'bg-[#161920] border-[#2D333D] text-[#EAE9E6]'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] font-mono text-[#8E9299] mt-1 flex items-center space-x-1">
                        <span>{msg.timestamp}</span>
                        {isTeacher && <CheckCheck className="w-3 h-3 text-[#10B981]" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSend} className="p-3 border-t border-[#2D333D] bg-[#0F1115] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Rédiger votre message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-[#161920] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-[#0F1115] font-bold p-2 hover:bg-[#b5942d] transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs font-mono text-[#8E9299]">
              Sélectionnez une discussion à afficher.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
