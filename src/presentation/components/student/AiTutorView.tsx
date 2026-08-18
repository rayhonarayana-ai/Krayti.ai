/**
 * Qarayti.ai — AI Tutor View (Faheem Integration)
 * Integrated Moroccan AI Assistant for Student Portal
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  BookOpen,
  HelpCircle,
  Brain,
  CheckCircle2,
  Languages,
  Code,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';
import { FaheemService } from '../../../domain/services/faheem.service';
import { container } from '../../../core/di/container';
import { authService } from '../../../core/auth/auth.service';
import { EducationLanguage, EducationLevel, HighSchoolTrack } from '../../../domain/types/education.types';

export const AiTutorView: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'user' | 'faheem'; text: string; topic?: string; time: string }>
  >([
    {
      id: 'm1',
      sender: 'faheem',
      text: 'مرحباً يوسف! أنا معلمك الذكي "فهيم" الخاص بالبكالوريا المغربية (مسلك العلوم الرياضية). كيف يمكنني مساعدتك في درس اليوم (الأعداد العقدية، ثنائي القطب RC، أو المقالات الفلسفية)؟',
      time: '10:00 AM',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Mathématiques');
  const [selectedLang, setSelectedLang] = useState<EducationLanguage>(EducationLanguage.DARIJA);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputQuery.trim() || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text: inputQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery;
    setInputQuery('');
    setIsLoading(true);

    try {
      const faheemService = container.resolve<FaheemService>('FaheemService');
      const authUser = authService.getCurrentUser();
      const response = await faheemService.processQuery({
        sessionId: `faheem-session-${Date.now()}`,
        userId: authUser?.id || '',
        query: currentQuery,
        role: 'student',
        language: selectedLang,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          sender: 'faheem',
          text: response.content || 'عذراً يوسف، يمكنك إعادة طرح السؤال بوضوح وسأشرح لك بالتفصيل.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          sender: 'faheem',
          text: `[إجابة فهيم التوضيحية فـ ${selectedSubject}]:\nبخصوص سؤالك: "${currentQuery}"، فـ المقرر المغربي للبكالوريا نعتمد على الخطوات التالية:\n1) حساب المميز أو المعيار.\n2) تطبيق الخاصية المرجعية للوطني.\n3) التحقق من النتيجة.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'اشرح لي قانون موآفر (Formule de Moivre) بالدارجة المغربية',
    'كيفاش نحسب ثابتة الزمن \\tau لدارة RC؟',
    'اعطيني منهجية كتابة مقالة فلسفية لمفهوم الشخص',
    'تمرين تطبيقي سريعة في الأعداد العقدية مع التصحيح',
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                المعلم الذكي فهيم (Faheem AI Tutor)
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                مكَيّف مع البكالوريا المغربية
              </span>
            </div>
            <p className="text-xs text-slate-500">
              شرح المفاهيم بالدارجة المغربية والفرنسية، حل التمارين خطوة بخطوة، والإجابة الدقيقة حسب التوجيهات التربوية.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="Mathématiques">الرياضيات (Maths)</option>
            <option value="Physique-Chimie">الفيزياء والكيمياء (Physique)</option>
            <option value="SVT">علوم الحياة والأرض (SVT)</option>
            <option value="Philosophie">الفلسفة (Philosophie)</option>
            <option value="Français">اللغة الفرنسية (Français)</option>
            <option value="Anglais">اللغة الإنجليزية (English)</option>
          </select>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-700 text-xs font-semibold">
            <button
              onClick={() => setSelectedLang(EducationLanguage.DARIJA)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedLang === EducationLanguage.DARIJA
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الدارجة المغربية
            </button>
            <button
              onClick={() => setSelectedLang(EducationLanguage.FRENCH)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedLang === EducationLanguage.FRENCH
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Français
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Body */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-slate-700'
                  : 'bg-emerald-500 text-slate-950 shadow-md'
              }`}
            >
              {msg.sender === 'user' ? 'أنت' : 'F'}
            </div>

            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-[10px] text-slate-400 text-left">{msg.time}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-2xl ml-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center animate-pulse">
              F
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
              <span>فهيم يفكر ويستحضر التوجيهات التربوية الرسمية للبكالوريا...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200/50 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">أسئلة مقترحة:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputQuery(prompt)}
            className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="إدخال صوّتي (Voice Prompt)"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل فهيم عن أي خاصية، تمرين، أو ملخص درس في البكالوريا..."
            className="flex-1 text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={handleSend}
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
