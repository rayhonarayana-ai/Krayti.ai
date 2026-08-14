/**
 * Qarayti.ai — Authentication & Login Modal Panel
 * Provides real Supabase authentication (Sign In / Sign Up) & Foundation Role Testing
 */

import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  UserCheck, 
  Mail, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  KeyRound, 
  UserPlus, 
  Building2, 
  GraduationCap, 
  School, 
  ShieldCheck, 
  Users,
  AlertCircle
} from 'lucide-react';
import { authService } from '../../core/auth/auth.service';
import { UserRole, AuthSession } from '../../domain/types/auth.types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [session, setSession] = useState<AuthSession | null>(authService.getCurrentSession());
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [activeSubTab, setActiveSubTab] = useState<'supabase' | 'foundation'>('supabase');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribe((newSession) => {
      setSession(newSession);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await authService.signInWithPassword(email, password);
      setSuccessMsg('تم تسجيل الدخول بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      let msg = err.message || 'حدث خطأ أثناء تسجيل الدخول';
      if (err.code === 'email_not_confirmed' || msg.includes('Email not confirmed')) {
        msg = 'البريد الإلكتروني غير مؤكد بعد. يرجى تأكيده من بريدك الإلكتروني.';
      } else if (err.code === 'invalid_credentials' || msg.includes('Invalid login credentials')) {
        msg = 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.';
      } else if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
        msg = 'تعذر الاتصال بالخدمة. يرجى التأكد من الاتصال بالشبكة والخادم.';
      }
      setErrorMsg(msg);
      console.error('[AUTH_ERROR_DIAGNOSTIC]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const resSession = await authService.signUp(email, password);
      if (resSession) {
        setSuccessMsg('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
        setTimeout(() => onClose(), 1000);
      } else {
        setSuccessMsg('تم إنشاء الحساب. إذا كان تأكيد البريد مفعلاً، يرجى مراجعة بريدك الإلكتروني.');
      }
    } catch (err: any) {
      let msg = err.message || 'حدث خطأ أثناء إنشاء الحساب';
      if (err.code === 'over_email_send_rate_limit') {
        msg = 'تجاوزت الحد المسموح لإرسال رسائل التأكيد. يرجى الانتظار قليلاً.';
      } else if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
        msg = 'تعذر الاتصال بالخدمة. يرجى التأكد من الاتصال بالشبكة والخادم.';
      }
      setErrorMsg(msg);
      console.error('[AUTH_ERROR_DIAGNOSTIC]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setSuccessMsg('تم تسجيل الخروج بنجاح.');
    } catch (err: any) {
      setErrorMsg(err.message || 'خطأ أثناء تسجيل الخروج');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetFoundationRole = (role: UserRole) => {
    authService.setFoundationSession(role);
    setSuccessMsg(`تم تفعيل جلسة الأساس لدور: ${role}`);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#0F1115] border border-[#2D333D] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-[#EAE9E6] relative"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="bg-[#161920] px-6 py-4 border-b border-[#2D333D] flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg font-bold text-[#EAE9E6]">
                لوحة المصادقة وتسجيل الدخول
              </h3>
              <p className="text-[11px] font-mono text-[#8E9299]">
                Qarayti.ai Auth & Session Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9299] hover:text-[#EAE9E6] p-1.5 rounded-lg hover:bg-[#2D333D]/50 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Status Header */}
        {session ? (
          <div className="bg-emerald-950/30 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-400">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>نشط حالياً: <strong className="text-[#EAE9E6]">{session.user.fullName}</strong> ({session.user.role})</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-xs bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 px-2.5 py-1 rounded transition-colors flex items-center space-x-1 space-x-reverse"
            >
              <LogOut className="w-3 h-3" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <div className="bg-amber-950/20 border-b border-amber-500/20 px-6 py-2.5 text-xs font-mono text-amber-300/80 flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>لم يتم تسجيل الدخول بعد (وضع الضيف / Anonymous Session)</span>
          </div>
        )}

        {/* Navigation Tabs (Supabase Auth vs Foundation Dev Session) */}
        <div className="flex border-b border-[#2D333D] bg-[#12141a]">
          <button
            onClick={() => setActiveSubTab('supabase')}
            className={`flex-1 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors flex items-center justify-center space-x-2 space-x-reverse ${
              activeSubTab === 'supabase'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#161920] font-bold'
                : 'border-transparent text-[#8E9299] hover:text-[#EAE9E6]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>حساب Supabase الحقيقي</span>
          </button>
          <button
            onClick={() => setActiveSubTab('foundation')}
            className={`flex-1 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors flex items-center justify-center space-x-2 space-x-reverse ${
              activeSubTab === 'foundation'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#161920] font-bold'
                : 'border-transparent text-[#8E9299] hover:text-[#EAE9E6]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>جلسات الاختبار السريعة</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-start space-x-2 space-x-reverse animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-start space-x-2 space-x-reverse animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {activeSubTab === 'supabase' ? (
            <div>
              {/* Toggle Signin vs Signup */}
              <div className="flex items-center justify-between bg-[#161920] p-1 rounded-lg border border-[#2D333D] mb-4">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 text-xs font-mono rounded-md transition-all flex items-center justify-center space-x-1.5 space-x-reverse ${
                    mode === 'signin'
                      ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow'
                      : 'text-[#8E9299] hover:text-[#EAE9E6]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 text-xs font-mono rounded-md transition-all flex items-center justify-center space-x-1.5 space-x-reverse ${
                    mode === 'signup'
                      ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow'
                      : 'text-[#8E9299] hover:text-[#EAE9E6]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إنشاء حساب</span>
                </button>
              </div>

              <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#8E9299] uppercase tracking-wider mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auditor.qarayti@gmail.com"
                      className="w-full bg-[#161920] border border-[#2D333D] focus:border-[#D4AF37] rounded-lg px-3.5 py-2.5 text-xs text-[#EAE9E6] pl-10 focus:outline-none transition-colors font-mono"
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-[#8E9299] absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8E9299] uppercase tracking-wider mb-1.5">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#161920] border border-[#2D333D] focus:border-[#D4AF37] rounded-lg px-3.5 py-2.5 text-xs text-[#EAE9E6] pl-10 focus:outline-none transition-colors font-mono"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-[#8E9299] absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#0F1115] font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#0F1115] border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>{mode === 'signin' ? 'تسجيل الدخول الآن' : 'إنشاء حساب جديد'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#8E9299] leading-relaxed mb-3">
                اختر أدناه أحد أدوار المنظومة التعليمية للتنقل السريع واختبار الصلاحيات (RBAC Inspector):
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => handleSetFoundationRole(UserRole.SUPER_ADMIN)}
                  className="flex items-center justify-between p-3 bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/60 rounded-lg text-xs transition-colors group text-right"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-[#0F1115] transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#EAE9E6] font-serif">Super Admin (مسؤول النظام)</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">Full System Authorization</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded">اختيار</span>
                </button>

                <button
                  onClick={() => handleSetFoundationRole(UserRole.STUDENT)}
                  className="flex items-center justify-between p-3 bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/60 rounded-lg text-xs transition-colors group text-right"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-[#0F1115] transition-colors">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#EAE9E6] font-serif">Student (طالب - تلميذ)</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">High School Math Track</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded">اختيار</span>
                </button>

                <button
                  onClick={() => handleSetFoundationRole(UserRole.TEACHER)}
                  className="flex items-center justify-between p-3 bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/60 rounded-lg text-xs transition-colors group text-right"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-[#0F1115] transition-colors">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#EAE9E6] font-serif">Teacher (أستاذ)</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">Course & Assessment Creator</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded">اختيار</span>
                </button>

                <button
                  onClick={() => handleSetFoundationRole(UserRole.SCHOOL_ADMIN)}
                  className="flex items-center justify-between p-3 bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/60 rounded-lg text-xs transition-colors group text-right"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-[#0F1115] transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#EAE9E6] font-serif">School Admin (مدير مؤسسة)</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">School OS Management</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded">اختيار</span>
                </button>

                <button
                  onClick={() => handleSetFoundationRole(UserRole.PARENT)}
                  className="flex items-center justify-between p-3 bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/60 rounded-lg text-xs transition-colors group text-right"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-[#0F1115] transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#EAE9E6] font-serif">Parent (ولي أمر)</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">Parent Portal & Progress Tracking</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded">اختيار</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#161920] px-6 py-3 border-t border-[#2D333D] flex items-center justify-between text-[11px] font-mono text-[#8E9299]">
          <span>نظام المصادقة في Qarayti.ai</span>
          <span>نظام المصادقة الصارم بـ Supabase SDK & JWT</span>
        </div>
      </div>
    </div>
  );
};
