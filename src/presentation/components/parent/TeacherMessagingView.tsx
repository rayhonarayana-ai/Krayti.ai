/**
 * Qarayti.ai — Parent Portal: Sub-Module 8: Teacher Messaging
 * Direct, secure messaging threads between Parents and Class Teachers/Professors.
 */

import React, { useState } from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import {
  MessageSquare,
  Send,
  User,
  Paperclip,
  CheckCheck,
  Clock,
  Shield,
} from 'lucide-react';

export const TeacherMessagingView: React.FC = () => {
  const { activeChild, teacherThreads, sendTeacherMessage } = useParentPortal();

  const childThreads = teacherThreads.filter((t) => t.childId === activeChild.id);
  const [activeThreadId, setActiveThreadId] = useState<string>(
    childThreads[0]?.id || ''
  );
  const [messageInput, setMessageInput] = useState<string>('');

  const activeThread = childThreads.find((t) => t.id === activeThreadId) || childThreads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeThread && messageInput.trim()) {
      sendTeacherMessage(activeThread.id, messageInput.trim());
      setMessageInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Messagerie Directe Parents-Enseignants
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Échanges sécurisés avec le corps professoral du Lycée. Respect des heures de permanence.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto">
          <Shield className="w-3.5 h-3.5" />
          <span>Canal Officiel Chiffré Qarayti</span>
        </div>
      </div>

      {/* Messaging Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thread List Sidebar (1 col) */}
        <div className="bg-[#161920] border border-[#2D333D] p-4 space-y-3">
          <h3 className="text-xs font-mono uppercase text-[#D4AF37] border-b border-[#2D333D] pb-2 font-bold">
            Professeurs de {activeChild.firstName}
          </h3>

          <div className="space-y-2">
            {childThreads.map((thread) => {
              const isSelected = thread.id === activeThread?.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-3 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0F1115] border-[#D4AF37]'
                      : 'bg-[#161920] border-[#2D333D] hover:border-[#8E9299]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={thread.teacherAvatar}
                      alt={thread.teacherName}
                      className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover"
                    />
                    <div className="space-y-0.5 overflow-hidden">
                      <h4 className="text-xs font-serif font-bold text-[#EAE9E6] truncate">
                        {thread.teacherName}
                      </h4>
                      <p className="text-[10px] font-mono text-[#D4AF37]">{thread.subject}</p>
                      <p className="text-[10px] font-serif italic text-[#8E9299] truncate">
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Conversation Main Panel (2 cols) */}
        <div className="md:col-span-2 bg-[#161920] border border-[#2D333D] flex flex-col justify-between h-[500px]">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#2D333D] bg-[#0F1115] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeThread.teacherAvatar}
                    alt={activeThread.teacherName}
                    className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#EAE9E6]">
                      {activeThread.teacherName}
                    </h3>
                    <p className="text-xs font-mono text-[#D4AF37]">{activeThread.subject}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#8E9299] bg-[#161920] px-2.5 py-1 border border-[#2D333D]">
                  Permanence: {activeThread.officeHours}
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0F1115]/50">
                {activeThread.messages.map((msg) => {
                  const isParent = msg.sender === 'PARENT';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 border text-xs ${
                          isParent
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#EAE9E6]'
                            : 'bg-[#161920] border-[#2D333D] text-[#EAE9E6]'
                        }`}
                      >
                        <p className="font-serif leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-end space-x-1 text-[9px] font-mono text-[#8E9299] pt-1">
                          <span>{msg.timestamp}</span>
                          {isParent && <CheckCheck className="w-3 h-3 text-[#D4AF37]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-[#2D333D] bg-[#0F1115] flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Écrire un message au professeur..."
                  className="flex-1 bg-[#161920] border border-[#2D333D] px-4 py-2 text-xs font-mono text-[#EAE9E6] focus:border-[#D4AF37] outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold text-xs font-mono uppercase flex items-center space-x-1 hover:bg-amber-400"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-[#8E9299]">
              Sélectionnez un professeur pour ouvrir une conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
