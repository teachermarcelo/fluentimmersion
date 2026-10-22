import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  Key,
  PlusCircle,
  Eye,
  FileText,
  Printer,
  Users,
  CheckCircle,
  Save,
  Code,
  ShieldAlert,
  Sparkles,
  Download,
  FolderUp,
  UploadCloud,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  GraduationCap,
  Smile,
  Mic,
  Briefcase,
  BookOpen,
  Database,
  Smartphone,
  Monitor,
  Copy,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Check,
  Zap,
  Share2,
  Send,
  QrCode,
  Phone,
  Mail,
  UserPlus,
  X,
  MessageCircle,
} from 'lucide-react';
import { CEFRLevel, SkillType, StudentAcademicRecord, Lesson, LessonCategory } from '../types';
import { STUDENT_ACADEMIC_RECORDS, TEACHER_MARCELO, ALL_LESSONS } from '../data/mockData';
import { sounds } from '../utils/audioEffects';
import { fireCelebrationConfetti } from '../utils/confetti';
import {
  SUPABASE_SQL_SCHEMA,
  getSupabaseClient,
  setSupabaseCredentials,
  clearSupabaseCredentials,
  syncStudentToSupabase,
} from '../lib/supabase';
import { InteractiveLessonViewer } from './InteractiveLessonViewer';
import { generateLessonWithAiOrFallback } from '../utils/lessonGenerator';
import {
  parseImportedLessonCode,
  getAllAvailableLessons,
  saveCustomLesson,
  deleteCustomLesson,
  saveAllLessonsSequence,
} from '../utils/lessonManager';
import {
  getTeacherStudentsRoster,
  deleteStudentPermanently,
} from '../utils/studentManager';

interface AdminViewProps {
  onAddCustomLesson: (lesson: Lesson) => void;
}

const TEMPLATES: {
  [key: string]: {
    title: string;
    level: CEFRLevel;
    skill: SkillType;
    category: LessonCategory;
    targetAudience: 'curriculum_adults' | 'kids' | 'pronunciation_lab';
    xp: number;
    html: string;
  };
} = {
  kids: {
    title: 'London Safari with Leo & Penny (Phonics & Animals)',
    level: 'A0',
    skill: 'listening',
    category: 'geral',
    targetAudience: 'kids',
    xp: 40,
    html: `<div style="font-family: 'Fredoka', cursive, system-ui, sans-serif; padding: 22px; background: linear-gradient(135deg, #f59e0b, #ec4899); border-radius: 20px; color: white; text-align: center;">
  <div style="font-size: 32px; margin-bottom: 8px;">🦁 🇬🇧 🐧</div>
  <h2 style="font-size: 24px; margin: 0 0 8px; font-weight: 800;">Leo the Lion's London Safari!</h2>
  <p style="font-size: 15px; margin-bottom: 16px; opacity: 0.95;">Vamos aprender os sons e palavras em inglês?</p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin: 16px 0;">
    <div style="background: rgba(255,255,255,0.25); padding: 12px; border-radius: 14px;">
      <span style="font-size: 26px;">🚌</span>
      <p style="margin: 4px 0 0; font-weight: bold; font-size: 14px;">Red Bus</p>
    </div>
    <div style="background: rgba(255,255,255,0.25); padding: 12px; border-radius: 14px;">
      <span style="font-size: 26px;">👑</span>
      <p style="margin: 4px 0 0; font-weight: bold; font-size: 14px;">Crown</p>
    </div>
    <div style="background: rgba(255,255,255,0.25); padding: 12px; border-radius: 14px;">
      <span style="font-size: 26px;">🍎</span>
      <p style="margin: 4px 0 0; font-weight: bold; font-size: 14px;">Apple</p>
    </div>
  </div>

  <div style="background: rgba(0,0,0,0.15); padding: 10px; border-radius: 12px; font-size: 12px;">
    ⭐ Dica do Teacher Marcelo: Ouça com atenção e repita em voz alta para ganhar 3 estrelas!
  </div>
</div>`,
  },
  adults_geral: {
    title: 'The Art of British Understatement & Etiquette',
    level: 'B1',
    skill: 'reading',
    category: 'geral',
    targetAudience: 'curriculum_adults',
    xp: 75,
    html: `<div style="font-family: system-ui, sans-serif; padding: 22px; background: linear-gradient(135deg, #0b1b3d, #1b365d); color: white; border-radius: 18px;">
  <span style="display: inline-block; padding: 4px 10px; background: rgba(200, 16, 46, 0.4); border-radius: 20px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">🇬🇧 IMERSÃO BRITÂNICA</span>
  <h2 style="color: #f59e0b; margin: 0 0 10px; font-size: 20px;">The Art of British Understatement</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
    No cotidiano do Reino Unido, a modéstia e a polidez são essenciais para uma comunicação natural.
  </p>
  
  <div style="background: rgba(255,255,255,0.08); border-left: 4px solid #c8102e; padding: 12px 16px; margin: 14px 0; border-radius: 8px;">
    <strong style="color: #67e8f9;">Expressão:</strong> <em>"It's not my cup of tea"</em><br />
    <span style="font-size: 12px; color: #cbd5e1;">Fonética IPA: /ɪts nɒt maɪ kʌp əv tiː/</span>
    <p style="margin: 6px 0 0; font-size: 13px;"><strong>Uso prático:</strong> "Não é do meu agrado / Não faz meu estilo".</p>
  </div>

  <div style="margin-top: 14px; padding: 10px; background: rgba(0,0,0,0.25); border-radius: 8px; font-size: 13px;">
    🎯 <strong>Desafio do Teacher Marcelo:</strong> Formule uma frase com um colega usando essa expressão de forma educada!
  </div>
</div>`,
  },
  business: {
    title: 'Executive Pitching & Stakeholder Negotiations',
    level: 'B2',
    skill: 'speaking',
    category: 'business',
    targetAudience: 'curriculum_adults',
    xp: 90,
    html: `<div style="font-family: system-ui, sans-serif; padding: 22px; background: linear-gradient(135deg, #0f172a, #1e3a8a); color: white; border-radius: 18px;">
  <span style="display: inline-block; padding: 4px 10px; background: #0284c7; border-radius: 20px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">💼 CANARY WHARF BUSINESS</span>
  <h2 style="color: #38bdf8; margin: 0 0 10px; font-size: 20px;">Canary Wharf Boardroom Negotiations</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Apresente métricas trimestrais com a postura e a diplomacia executiva britânica.</p>
  
  <div style="background: rgba(255,255,255,0.08); border-left: 4px solid #38bdf8; padding: 12px; margin: 14px 0; border-radius: 8px;">
    <strong>Frase-Chave:</strong> <em>"Let us circle back on the financial deliverables post-audit."</em><br/>
    <span style="font-size: 12px; color: #94a3b8;">IPA: /ˈsɜː.kəl bæk ɒn ðə faɪˈnæn.ʃəl dɪˈlɪv.ər.ə.bəlz/</span>
  </div>

  <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; font-size: 13px;">
    📊 <strong>Vocabulário Executivo:</strong> Deliverables (Entregáveis) • Post-audit (Pós-auditoria) • Stakeholders (Partes interessadas).
  </div>
</div>`,
  },
  biblico: {
    title: "The Lord's Prayer & Historic Rhetoric (Matthew 6)",
    level: 'B1',
    skill: 'reading',
    category: 'biblico',
    targetAudience: 'curriculum_adults',
    xp: 85,
    html: `<div style="font-family: system-ui, sans-serif; padding: 22px; background: linear-gradient(135deg, #2e1065, #4c1d95); color: white; border-radius: 18px;">
  <span style="display: inline-block; padding: 4px 10px; background: #9333ea; border-radius: 20px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">📖 INGLÊS BÍBLICO</span>
  <h2 style="color: #fbbf24; margin: 0 0 10px; font-size: 20px;">The Lord's Prayer (King James Version)</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #e9d5ff;">Estudo poético e histórico da oração cristã mais recitada em inglês clássico.</p>
  
  <div style="background: rgba(255,255,255,0.08); border-left: 4px solid #fbbf24; padding: 12px; margin: 14px 0; border-radius: 8px;">
    <em style="font-size: 15px;">"Our Father which art in heaven, Hallowed be thy name."</em><br/>
    <span style="font-size: 12px; color: #ddd6fe; display: block; margin-top: 4px;">Nota: <strong>'Hallowed'</strong> (/ˈhæl.əʊd/) = Consagrado, santificado e reverenciado.</span>
  </div>

  <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; font-size: 13px;">
    🕊️ <strong>Reflexão Pedagógica:</strong> Pratique a entonação solene e a pronúncia das vogais abertas britânicas.
  </div>
</div>`,
  },
  proficiencia: {
    title: 'Cambridge C1/C2: Negative Inversions for Band 9',
    level: 'C1',
    skill: 'writing',
    category: 'proficiencia',
    targetAudience: 'curriculum_adults',
    xp: 120,
    html: `<div style="font-family: system-ui, sans-serif; padding: 22px; background: linear-gradient(135deg, #1c1917, #44403c); color: white; border-radius: 18px;">
  <span style="display: inline-block; padding: 4px 10px; background: #e11d48; border-radius: 20px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">🎓 EXAMES & PROFICIÊNCIA</span>
  <h2 style="color: #f43f5e; margin: 0 0 10px; font-size: 20px;">IELTS & Cambridge: Negative Inversion Mastery</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #e7e5e4;">Estruturas sintáticas sofisticadas para alcançar pontuação máxima nas bancas de avaliação.</p>
  
  <div style="background: rgba(255,255,255,0.08); border-left: 4px solid #f43f5e; padding: 12px; margin: 14px 0; border-radius: 8px;">
    <strong>Fórmula Gramatical:</strong> Negative Adverb + Auxiliary Verb + Subject + Main Verb<br/>
    <em style="color: #fda4af;">"Rarely have we encountered such profound analytical rigor."</em>
  </div>

  <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; font-size: 13px;">
    ✍️ <strong>Exercício do Aluno:</strong> Reescreva "I have never seen such a view" usando "Never before...".
  </div>
</div>`,
  },
  speaking_lab: {
    title: 'RP Phonetics & Received Pronunciation Drill',
    level: 'B2',
    skill: 'speaking',
    category: 'geral',
    targetAudience: 'pronunciation_lab',
    xp: 80,
    html: `<div style="font-family: system-ui, sans-serif; padding: 22px; background: linear-gradient(135deg, #0b1b3d, #2563eb); color: white; border-radius: 18px;">
  <span style="display: inline-block; padding: 4px 10px; background: #3b82f6; border-radius: 20px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">🎙️ SPEAKING LAB & FONÉTICA</span>
  <h2 style="color: #67e8f9; margin: 0 0 10px; font-size: 20px;">The Oxford Glottal Stop & Pure Vowels</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #bfdbfe;">Treinamento da musculatura vocal para a entonação britânica padrão.</p>
  
  <div style="background: rgba(255,255,255,0.08); border-left: 4px solid #67e8f9; padding: 12px; margin: 14px 0; border-radius: 8px;">
    <strong>Frase de Treino:</strong> <em>"Water bottle in central London"</em><br/>
    <span style="font-size: 12px; color: #93c5fd;">IPA: /ˈwɔː.tər ˈbɒt.əl ɪn ˈsen.trəl ˈlʌn.dən/</span>
  </div>
</div>`,
  },
};

export const AdminView: React.FC<AdminViewProps> = ({ onAddCustomLesson }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminTab, setAdminTab] = useState<'cms' | 'sequence' | 'supabase' | 'students' | 'report' | 'password'>('cms');

  // Password Management State
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmPwdInput, setConfirmPwdInput] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destination / Audience targeting state
  const [targetAudience, setTargetAudience] = useState<'curriculum_adults' | 'kids' | 'pronunciation_lab'>('curriculum_adults');
  const [lessonOrderIndex, setLessonOrderIndex] = useState<number>(1);

  // Lesson Creator Fields
  const [lessonTitle, setLessonTitle] = useState('British Idioms in Daily Conversation');
  const [lessonCategory, setLessonCategory] = useState<LessonCategory>('business');
  const [lessonLevel, setLessonLevel] = useState<CEFRLevel>('B2');
  const [lessonSkill, setLessonSkill] = useState<SkillType>('reading');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonXp, setLessonXp] = useState(75);
  const [htmlContent, setHtmlContent] = useState(TEMPLATES.adults_geral.html);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // AI Lesson Generator
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenSuccess, setAiGenSuccess] = useState(false);
  const [aiGeneratorSourceMsg, setAiGeneratorSourceMsg] = useState('');

  // Import Code / Artifact Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawCode, setImportRawCode] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState('');

  // Live preview screen mode (Desktop vs Mobile Phone)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Sequence Manager state
  const [managedLessons, setManagedLessons] = useState<Lesson[]>(() => getAllAvailableLessons());
  const [sequenceFilter, setSequenceFilter] = useState<'all' | 'curriculum_adults' | 'kids' | 'business' | 'biblico' | 'proficiencia'>('all');

  // Supabase State & Config
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => {
    return localStorage.getItem('fluent_immersion_supabase_url') || 'https://nuyzvpkvawixidotuio.supabase.co';
  });
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => {
    return localStorage.getItem('fluent_immersion_supabase_key') || '';
  });
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const [students, setStudents] = useState<StudentAcademicRecord[]>(() => {
    return getTeacherStudentsRoster();
  });
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentAcademicRecord>(() => {
    const list = getTeacherStudentsRoster();
    return list[0] || STUDENT_ACADEMIC_RECORDS[0];
  });

  // Register Student Modal & Form State
  const [isRegisterStudentModalOpen, setIsRegisterStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState<CEFRLevel>('A1');
  const [newStudentTrack, setNewStudentTrack] = useState<'curriculum_adults' | 'kids' | 'business' | 'biblico' | 'proficiencia' | 'all_access'>('curriculum_adults');
  const [newStudentParentEmail, setNewStudentParentEmail] = useState('');
  const [newStudentNotes, setNewStudentNotes] = useState('');

  // Share Access Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingStudent, setSharingStudent] = useState<StudentAcademicRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSaveNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) {
      alert('Por favor preencha ao menos Nome e E-mail do aluno.');
      return;
    }

    const newStudent: StudentAcademicRecord = {
      id: `st-${Date.now()}`,
      name: newStudentName.trim(),
      email: newStudentEmail.trim(),
      phone: newStudentPhone.trim(),
      level: newStudentLevel,
      track: newStudentTrack,
      totalXp: 0, // Inicia 100% zerado
      speakingScore: 0, // Aguardando 1º áudio
      listeningScore: 0,
      readingScore: 0,
      writingScore: 0,
      attendanceRate: 100,
      lastActive: 'Aguardando 1º acesso',
      notes: newStudentNotes.trim() || `Matriculado na trilha ${newStudentTrack} pelo Teacher Marcelo.`,
      parentEmail: newStudentParentEmail.trim(),
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fluent_immersion_students', JSON.stringify(updated));
    }

    // Tentar salvar no Supabase se conectado
    try {
      await syncStudentToSupabase(newStudent);
    } catch (err) {
      console.warn('Erro ao sincronizar com Supabase:', err);
    }

    sounds.playSuccess();
    fireCelebrationConfetti();
    setIsRegisterStudentModalOpen(false);

    // Limpar formulário
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPhone('');
    setNewStudentParentEmail('');
    setNewStudentNotes('');

    // Abrir imediatamente o modal de compartilhamento para enviar pelo WhatsApp
    setSharingStudent(newStudent);
    setIsShareModalOpen(true);
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (confirm(`Deseja realmente remover a matrícula do aluno ${name}?`)) {
      await deleteStudentPermanently(id, name);
      const updated = getTeacherStudentsRoster();
      setStudents(updated);
      sounds.playPop();
    }
  };

  const getStudentInviteUrl = (st: StudentAcademicRecord) => {
    const origin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://ais-pre-cjqhrelkg2eqy43bpdj2bh-395073471759.us-west2.run.app';
    const params = new URLSearchParams();
    params.set('student', st.name);
    params.set('level', st.level);
    if (st.track) params.set('track', st.track);
    return `${origin}/?${params.toString()}`;
  };

  const handleCopyStudentLink = (st: StudentAcademicRecord) => {
    const url = getStudentInviteUrl(st);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    sounds.playPop();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareOnWhatsApp = (st: StudentAcademicRecord) => {
    const url = getStudentInviteUrl(st);
    const trackNames: Record<string, string> = {
      curriculum_adults: 'Inglês Geral (A0 ao C2)',
      kids: 'Fluent Kids (4 a 12 anos)',
      business: 'Business English Corporativo',
      biblico: 'Inglês Bíblico & Teológico',
      proficiencia: 'Preparatório Proficiência (IELTS/TOEFL)',
      all_access: 'Acesso Total VIP (Todas as Trilhas Liberadas)',
    };
    const trackLabel = (st.track && trackNames[st.track]) || 'Grade Curricular Completa';

    const message = `🇬🇧 *FLUENT IMMERSION • Convite Oficial de Acesso*\n\nOlá, *${st.name}*!\nSeu acesso oficial foi liberado pelo *Teacher Marcelo* na plataforma de imersão em Língua Inglesa!\n\n📌 *Nível Inicial:* ${st.level}\n🎯 *Trilha Pedagógica:* ${trackLabel}\n\n👉 *Acesse sua área de estudos pelo link exclusivo:*\n${url}\n\nBons estudos e conte com o Teacher Marcelo para qualquer dúvida no WhatsApp (${TEACHER_MARCELO.formattedPhone})!`;

    const cleanPhone = (st.phone || '').replace(/\D/g, '');
    const targetUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(targetUrl, '_blank');
  };

  // Auth submission (Uses stored password or default initial 123456)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = localStorage.getItem('fluent_immersion_admin_password') || '123456';
    if (passwordInput === storedPwd) {
      setIsAuthenticated(true);
      setAuthError('');
      sounds.playSuccess();
    } else {
      setAuthError('Senha incorreta! Digite a senha administrativa cadastrada.');
      sounds.playRetry();
    }
  };

  // Change password handler
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = localStorage.getItem('fluent_immersion_admin_password') || '123456';
    if (currentPwdInput !== storedPwd) {
      setPwdMsg({ type: 'error', text: 'A senha atual informada está incorreta.' });
      sounds.playRetry();
      return;
    }
    if (newPwdInput.length < 4) {
      setPwdMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 4 caracteres.' });
      sounds.playRetry();
      return;
    }
    if (newPwdInput !== confirmPwdInput) {
      setPwdMsg({ type: 'error', text: 'A confirmação da nova senha não confere.' });
      sounds.playRetry();
      return;
    }

    localStorage.setItem('fluent_immersion_admin_password', newPwdInput);
    setPwdMsg({ type: 'success', text: '✅ Senha administrativa alterada com sucesso!' });
    setCurrentPwdInput('');
    setNewPwdInput('');
    setConfirmPwdInput('');
    sounds.playSuccess();
    fireCelebrationConfetti();
  };

  // Reset password to default handler
  const handleResetPasswordToDefault = () => {
    if (confirm('Deseja realmente redefinir a senha para o padrão inicial do sistema (123456)?')) {
      localStorage.setItem('fluent_immersion_admin_password', '123456');
      setPwdMsg({ type: 'success', text: 'Senha restaurada com sucesso para o padrão inicial.' });
      sounds.playSuccess();
    }
  };

  // Helper to calculate next order index for current destination
  const getNextOrderIndex = (aud: 'curriculum_adults' | 'kids' | 'pronunciation_lab', cat: LessonCategory) => {
    const existing = managedLessons.filter((l) => {
      if (aud === 'kids') return l.targetAudience === 'kids';
      if (aud === 'pronunciation_lab') return l.targetAudience === 'pronunciation_lab';
      return l.targetAudience === 'curriculum_adults' && l.category === cat;
    });
    return existing.length + 1;
  };

  // Select destination and auto-configure sensible defaults
  const handleSelectDestination = (
    audience: 'curriculum_adults' | 'kids' | 'pronunciation_lab',
    category: LessonCategory
  ) => {
    setTargetAudience(audience);
    setLessonCategory(category);
    sounds.playPop();

    // Auto-update order index
    const nextIdx = getNextOrderIndex(audience, category);
    setLessonOrderIndex(nextIdx);

    // Apply template defaults
    if (audience === 'kids') {
      const t = TEMPLATES.kids;
      setLessonLevel('A0');
      setLessonSkill('listening');
      setLessonTitle(t.title);
      setLessonXp(t.xp);
      setHtmlContent(t.html);
    } else if (category === 'business') {
      const t = TEMPLATES.business;
      setLessonLevel('B2');
      setLessonSkill('speaking');
      setLessonTitle(t.title);
      setLessonXp(t.xp);
      setHtmlContent(t.html);
    } else if (category === 'biblico') {
      const t = TEMPLATES.biblico;
      setLessonLevel('B1');
      setLessonSkill('reading');
      setLessonTitle(t.title);
      setLessonXp(t.xp);
      setHtmlContent(t.html);
    } else if (category === 'proficiencia') {
      const t = TEMPLATES.proficiencia;
      setLessonLevel('C1');
      setLessonSkill('writing');
      setLessonTitle(t.title);
      setLessonXp(t.xp);
      setHtmlContent(t.html);
    } else if (audience === 'pronunciation_lab') {
      const t = TEMPLATES.speaking_lab;
      setLessonLevel('B1');
      setLessonSkill('speaking');
      setLessonTitle(t.title);
      setLessonXp(t.xp);
      setHtmlContent(t.html);
    } else {
      const t = TEMPLATES.adults_geral;
      setLessonLevel('B1');
      setLessonSkill('reading');
      setLessonTitle(t.title);
      setLessonXp(t.xp);
      setHtmlContent(t.html);
    }
  };

  // AI-Assisted Lesson Generator
  const handleGenerateWithAi = async () => {
    if (!aiTopicInput.trim()) {
      alert('Por favor, digite um tema ou vocabulário para a IA gerar a aula.');
      return;
    }
    setIsGeneratingAi(true);
    setAiGenSuccess(false);

    try {
      const generated = await generateLessonWithAiOrFallback({
        topic: aiTopicInput.trim(),
        level: lessonLevel,
        category: lessonCategory,
        targetAudience: targetAudience,
        skill: lessonSkill,
      });

      if (generated.title) setLessonTitle(generated.title);
      if (generated.htmlContent) setHtmlContent(generated.htmlContent);
      if (generated.xpReward) setLessonXp(generated.xpReward);
      if (generated.durationMinutes) setLessonDuration(generated.durationMinutes);

      setAiGeneratorSourceMsg(
        generated.source === 'gemini'
          ? '✨ Lição gerada com sucesso pela Inteligência Artificial Gemini!'
          : '🇬🇧 Lição gerada com sucesso pelo Motor Pedagógico Britânico de Imersão!'
      );

      sounds.playSuccess();
      fireCelebrationConfetti();
      setAiGenSuccess(true);
      setTimeout(() => setAiGenSuccess(false), 7000);
    } catch (e) {
      console.warn('Erro ao gerar lição:', e);
      sounds.playRetry();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Criar Nova Lição do Zero (reseta e carrega modelo limpo pedagógico britânico)
  const handleNewLessonFromScratch = () => {
    sounds.playPop();
    const nextOrder = managedLessons.length + 1;
    setLessonTitle('Nova Aula Interativa de Inglês Britânico');
    setLessonCategory('geral');
    setLessonLevel('A1');
    setLessonSkill('speaking');
    setLessonDuration(15);
    setLessonXp(50);
    setLessonOrderIndex(nextOrder);
    setHtmlContent(`<!-- ESTRUTURA BASE DA AULA BRITÂNICA • FLUENT IMMERSION -->
<div class="lesson-container" style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b;">
  <!-- Cabeçalho Pedagógico -->
  <header style="background: linear-gradient(135deg, #0b1b3d, #1e3a8a); color: white; padding: 28px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(11, 27, 61, 0.3); margin-bottom: 24px;">
    <div style="display: inline-block; background: #c8102e; color: white; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
      🇬🇧 Imersão Britânica • Nível A1
    </div>
    <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.2;">
      Greetings & Everyday Expressions
    </h1>
    <p style="font-size: 14px; opacity: 0.9; margin: 0; line-height: 1.5;">
      Aprenda saudações naturais britânicas, fonética prática e diálogos do dia a dia.
    </p>
  </header>

  <!-- Seção 1: Vocabulário -->
  <section style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 14px;">
      📚 1. Key Vocabulary (Vocabulário-Chave)
    </h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
        <span style="font-size: 16px; font-weight: 700; color: #0b1b3d; display: block;">Lovely to meet you</span>
        <span style="font-size: 12px; color: #64748b; font-family: monospace;">/ˈlʌv.li tuː miːt juː/</span>
        <p style="font-size: 13px; color: #334155; margin: 4px 0 0 0;">Muito prazer em conhecê-lo(a)</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
        <span style="font-size: 16px; font-weight: 700; color: #0b1b3d; display: block;">Have a good one</span>
        <span style="font-size: 12px; color: #64748b; font-family: monospace;">/hæv ə ɡʊd wʌn/</span>
        <p style="font-size: 13px; color: #334155; margin: 4px 0 0 0;">Tenha um bom dia / Até logo</p>
      </div>
    </div>
  </section>

  <!-- Seção 2: Diálogo -->
  <section style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 14px;">
      💬 2. Real Dialogue (Diálogo Real)
    </h2>
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 8px; margin-bottom: 10px;">
      <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
        <strong>Teacher Marcelo:</strong> "Good morning! Are you ready for today's immersion?"<br/>
        <em>(Bom dia! Você está pronto para a imersão de hoje?)</em>
      </p>
    </div>
    <div style="background: #fdf2f8; border-left: 4px solid #ec4899; padding: 14px; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #831843;">
        <strong>Student:</strong> "Yes, absolutely! Let's get started."<br/>
        <em>(Sim, com certeza! Vamos começar.)</em>
      </p>
    </div>
  </section>

  <!-- Seção 3: Desafio -->
  <section style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 10px;">
      ✍️ 3. Quick Challenge
    </h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">
      Qual expressão é tipicamente britânica para dizer que algo é ótimo?
    </p>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;">Brilliant!</button>
      <button style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;">Awesome dude!</button>
    </div>
  </section>
</div>`);
    fireCelebrationConfetti();
    setAiGeneratorSourceMsg('✨ Nova Lição iniciada do zero com modelo pedagógico britânico limpo!');
    setAiGenSuccess(true);
    setTimeout(() => setAiGenSuccess(false), 5000);
  };

  // Importar arquivo HTML diretamente do computador
  const processUploadedFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed = parseImportedLessonCode(content);
      const title = parsed.detectedTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setLessonTitle(title);
      setLessonLevel(parsed.detectedLevel);
      setLessonSkill(parsed.detectedSkill);
      setLessonDuration(parsed.detectedDuration);
      setLessonXp(parsed.detectedXp);
      setHtmlContent(content);
      setImportRawCode(content);

      sounds.playSuccess();
      fireCelebrationConfetti();
      setAiGeneratorSourceMsg(`📂 Arquivo "${file.name}" importado do computador com sucesso! (${(file.size / 1024).toFixed(1)} KB)`);
      setAiGenSuccess(true);
      setTimeout(() => setAiGenSuccess(false), 5000);
      setIsImportModalOpen(false);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    e.target.value = '';
  };

  // Import raw HTML / standalone React artifact code handler
  const handleImportRawCode = () => {
    if (!importRawCode.trim()) {
      alert('Por favor, cole o código da lição (HTML, React Artifact ou CSS/JS).');
      return;
    }

    const parsed = parseImportedLessonCode(importRawCode);
    setLessonTitle(parsed.detectedTitle);
    setLessonLevel(parsed.detectedLevel);
    setLessonSkill(parsed.detectedSkill);
    setLessonDuration(parsed.detectedDuration);
    setLessonXp(parsed.detectedXp);
    setHtmlContent(importRawCode);

    setImportStatusMsg(
      `✅ Código importado com sucesso! Título: "${parsed.detectedTitle}" • Nível: ${parsed.detectedLevel} • Duração: ${parsed.detectedDuration} min • ${parsed.isArtifact ? 'Artifact Interativo Detectado' : 'HTML Padrão'}.`
    );

    sounds.playSuccess();
    fireCelebrationConfetti();
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportStatusMsg('');
    }, 2200);
  };

  // Save lesson
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !htmlContent.trim()) {
      alert('Informe o título e o código da lição antes de salvar.');
      return;
    }

    const lessonIdToUse = editingLessonId || `custom-les-${Date.now()}`;

    const newLesson: Lesson = {
      id: lessonIdToUse,
      title: lessonTitle,
      level: lessonLevel,
      skill: lessonSkill,
      category: lessonCategory,
      targetAudience: targetAudience,
      orderIndex: lessonOrderIndex,
      durationMinutes: lessonDuration,
      xpReward: lessonXp,
      description: `Lição interativa da trilha [${targetAudience === 'kids' ? 'KIDS' : lessonCategory.toUpperCase()}] criada pelo Teacher Marcelo.`,
      iconName: targetAudience === 'kids' ? 'Sparkles' : 'Code',
      content: {
        readingText: 'Lição interativa oficial executada no visualizador da Fluent Immersion.',
      },
      customHtml: htmlContent,
    };

    saveCustomLesson(newLesson);
    onAddCustomLesson(newLesson);
    setEditingLessonId(null);
    const updated = getAllAvailableLessons();
    setManagedLessons(updated);
    sounds.playSuccess();
    fireCelebrationConfetti();
    alert(
      `Lição "${lessonTitle}" salva e publicada com sucesso na trilha [${
        targetAudience === 'kids' ? 'Fluent Kids' : lessonCategory.toUpperCase()
      }] na posição #${lessonOrderIndex}!`
    );
  };

  // Move lesson up/down in sequence
  const handleMoveLesson = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= managedLessons.length) return;

    const updated = [...managedLessons];
    const itemToMove = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = itemToMove;

    // Recalculate order indices
    updated.forEach((l, idx) => {
      l.orderIndex = idx + 1;
    });

    setManagedLessons(updated);
    saveAllLessonsSequence(updated);
    sounds.playPop();
  };

  // Direct sequence edit
  const handleSetDirectOrder = (lessonId: string, newOrder: number) => {
    const updated = managedLessons.map((l) => (l.id === lessonId ? { ...l, orderIndex: newOrder } : l));
    updated.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    setManagedLessons(updated);
    saveAllLessonsSequence(updated);
    sounds.playPop();
  };

  const handleDeleteLesson = (id: string) => {
    if (!confirm('Deseja realmente remover esta lição da grade?')) return;
    deleteCustomLesson(id);
    const remaining = getAllAvailableLessons().filter((l) => l.id !== id);
    setManagedLessons(remaining);
    saveAllLessonsSequence(remaining);
    sounds.playRetry();
  };

  // Load lesson back into editor
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonLevel(lesson.level);
    setLessonSkill(lesson.skill);
    setLessonCategory(lesson.category);
    setTargetAudience(lesson.targetAudience);
    setLessonOrderIndex(lesson.orderIndex);
    setLessonDuration(lesson.durationMinutes);
    setLessonXp(lesson.xpReward);
    setHtmlContent(lesson.customHtml || TEMPLATES.adults_geral.html);
    setAdminTab('cms');
    sounds.playPop();
  };

  // Supabase Credentials Save
  const handleSaveSupabaseConfig = () => {
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setSupabaseStatusMsg('Por favor, informe a URL e a Anon Key do seu projeto Supabase.');
      return;
    }
    setSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    const client = getSupabaseClient();
    if (client) {
      setSupabaseStatusMsg('✅ Conexão com Supabase configurada com sucesso! Sincronização em nuvem ativa.');
      sounds.playSuccess();
    } else {
      setSupabaseStatusMsg('⚠️ Credenciais salvas, mas verifique o formato da URL.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    sounds.playSuccess();
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // If not authenticated, show password prompt (without exposing the password)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 glass-card rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-6 text-center animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0b1b3d] to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Área do Administrador
          </h2>
          <p className="text-xs text-slate-500">
            Acesso restrito para gestão de aulas HTML, sequenciamento de trilhas e acompanhamento acadêmico pelo{' '}
            <strong>Teacher Marcelo</strong>.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Digite a senha de administrador"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>

          {authError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {authError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition"
          >
            Acessar Painel Admin
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Acesso restrito e protegido. Para alterar ou redefinir a senha, utilize a aba de segurança dentro do painel.
        </p>
      </div>
    );
  }

  // Filtered lessons for sequence manager
  const visibleLessonsInSequence = managedLessons.filter((l) => {
    if (sequenceFilter === 'all') return true;
    if (sequenceFilter === 'kids') return l.targetAudience === 'kids';
    if (sequenceFilter === 'curriculum_adults') return l.targetAudience === 'curriculum_adults' && l.category === 'geral';
    return l.category === sequenceFilter;
  });

  // Count lessons per track
  const countKids = managedLessons.filter((l) => l.targetAudience === 'kids').length;
  const countGeral = managedLessons.filter((l) => l.targetAudience === 'curriculum_adults' && l.category === 'geral').length;
  const countBusiness = managedLessons.filter((l) => l.category === 'business').length;
  const countBiblico = managedLessons.filter((l) => l.category === 'biblico').length;
  const countProf = managedLessons.filter((l) => l.category === 'proficiencia').length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#0b1b3d] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            Painel Central de Gestão & CMS Pedagógico
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">Administração • FLUENT IMMERSION</h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Direcionamento claro de aulas, reordenamento de sequência, integração com Supabase e relatórios.
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="flex flex-wrap gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setAdminTab('cms')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'cms' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            Criador de Lições (CMS)
          </button>

          <button
            onClick={() => setAdminTab('sequence')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'sequence' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 text-amber-300" />
            Reordenar Sequência
          </button>

          <button
            onClick={() => setAdminTab('supabase')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'supabase' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-300" />
            Banco de Dados (Supabase)
          </button>

          <button
            onClick={() => setAdminTab('students')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'students' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Alunos & Desempenho
          </button>

          <button
            onClick={() => setAdminTab('report')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'report' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            Relatório Oficial (PDF)
          </button>

          <button
            onClick={() => {
              setAdminTab('password');
              setPwdMsg(null);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'password'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-amber-300" />
            Alterar Senha
          </button>
        </div>
      </div>

      {/* Tab 1: CMS - Lesson Creator with Clear Destination Targeting */}
      {adminTab === 'cms' && (
        <div className="space-y-6">
          {/* PASSO 1: DIRECIONAMENTO E DESTINO CLARO */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-purple-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px]">1</span>
                  PASSO 1: ONDE A LIÇÃO SERÁ PUBLICADA? (DESTINO DO ALUNO)
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Escolha com clareza para qual seção e público esta aula será enviada
                </h3>
              </div>

              <div className="text-xs text-slate-500 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/60 font-semibold">
                📍 Destino Atual:{' '}
                <strong className="text-purple-700 dark:text-purple-300">
                  {targetAudience === 'kids'
                    ? '🧸 Fluent Kids (Infantil)'
                    : targetAudience === 'pronunciation_lab'
                    ? '🎙️ Speaking Lab'
                    : lessonCategory === 'business'
                    ? '💼 Business English'
                    : lessonCategory === 'biblico'
                    ? '📖 Inglês Bíblico'
                    : lessonCategory === 'proficiencia'
                    ? '🎓 Proficiência / Exames'
                    : '🇬🇧 Grade Regular A0-C2'}
                </strong>
              </div>
            </div>

            {/* 6 Destination Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Option 1: Fluent Kids */}
              <button
                type="button"
                onClick={() => handleSelectDestination('kids', 'geral')}
                className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                  targetAudience === 'kids'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shrink-0">
                    🦁
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        1. Fluent Kids
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded-full font-bold">
                        Infantil
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Aparece na aba Kids com jogos lúdicos, safari de Londres, fonética e recompensas em estrelas.
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                  <span>{countKids} lições já cadastradas</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 2: Curriculum Geral A0-C2 */}
              <button
                type="button"
                onClick={() => handleSelectDestination('curriculum_adults', 'geral')}
                className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                  targetAudience === 'curriculum_adults' && lessonCategory === 'geral'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-[#c8102e] shadow-md ring-2 ring-rose-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#c8102e] flex items-center justify-center text-xl shrink-0">
                    🇬🇧
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        2. Grade A0 ao C2
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 px-1.5 py-0.2 rounded-full font-bold">
                        Jovens/Adultos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Aparece no Currículo Principal nos níveis Starter (A0) até Domínio Fluente (C2).
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
                  <span>{countGeral} lições na grade geral</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 3: Business English */}
              <button
                type="button"
                onClick={() => handleSelectDestination('curriculum_adults', 'business')}
                className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                  targetAudience === 'curriculum_adults' && lessonCategory === 'business'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-md ring-2 ring-sky-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 flex items-center justify-center text-xl shrink-0">
                    💼
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        3. Business English
                      </span>
                      <span className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 px-1.5 py-0.2 rounded-full font-bold">
                        Executivo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Canary Wharf, apresentações executivas, negociações financeiras e e-mails formais.
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1">
                  <span>{countBusiness} lições corporativas</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 4: Inglês Bíblico */}
              <button
                type="button"
                onClick={() => handleSelectDestination('curriculum_adults', 'biblico')}
                className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                  targetAudience === 'curriculum_adults' && lessonCategory === 'biblico'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-md ring-2 ring-purple-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 flex items-center justify-center text-xl shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        4. Inglês Bíblico
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-1.5 py-0.2 rounded-full font-bold">
                        Faith & KJV
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Passagens bíblicas históricas, King James Version, orações e vocabulário teológico.
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                  <span>{countBiblico} lições bíblicas</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 5: Proficiência */}
              <button
                type="button"
                onClick={() => handleSelectDestination('curriculum_adults', 'proficiencia')}
                className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                  targetAudience === 'curriculum_adults' && lessonCategory === 'proficiencia'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-md ring-2 ring-rose-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 flex items-center justify-center text-xl shrink-0">
                    🎓
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        5. Proficiência
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 px-1.5 py-0.2 rounded-full font-bold">
                        IELTS / Cambridge
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Preparatórios para Band 7-9 no IELTS, exames Cambridge (FCE/CAE/CPE) e TOEFL iBT.
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
                  <span>{countProf} lições preparatórias</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 6: Speaking Lab */}
              <button
                type="button"
                onClick={() => handleSelectDestination('pronunciation_lab', 'geral')}
                className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                  targetAudience === 'pronunciation_lab'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 flex items-center justify-center text-xl shrink-0">
                    🎙️
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        6. Speaking Lab
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.2 rounded-full font-bold">
                        Fonética & IA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Drills dedicados de pronúncia em tempo real com avaliação de vogais e sotaque britânico.
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                  <span>Drills integrados</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>
          </div>

          {/* ASSISTENTE DE IA PARA GERAR LIÇÃO COM 1 CLIQUE */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <h3 className="text-sm sm:text-base font-black">
                ✨ Assistente de Geração de Lição com Inteligência Artificial
              </h3>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed">
              O Teacher Marcelo pode digitar apenas um tema (ex:{' '}
              <em>"Reunião de Vendas em Londres"</em>, <em>"Parábola do Filho Pródigo em KJV"</em> ou{' '}
              <em>"Safari dos Animais para Crianças"</em>) e a IA gera todo o HTML com estilos britânicos, IPA e exercícios!
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                placeholder="Digite o tema da aula que deseja criar..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando Lição com IA...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Gerar Lição Pronta
                  </>
                )}
              </button>
            </div>

            {aiGenSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-300" />
                {aiGeneratorSourceMsg || 'Lição gerada com sucesso e carregada no Editor HTML abaixo!'}
              </div>
            )}
          </div>

          {/* PASSO 2 & 3: FORMULÁRIO E EDITOR HTML + LIVE VIEWER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HTML Code Editor */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-600" />
                    Editor de Conteúdo & Parâmetros Pedagógicos
                  </h2>
                  <span className="text-xs text-purple-600 font-bold bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-full w-fit">
                    Passo 2 de 3
                  </span>
                </div>

                {/* BARRA DE AÇÕES RÁPIDAS PARA O TEACHER */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* 1. NOVA LIÇÃO DO ZERO */}
                  <button
                    type="button"
                    onClick={handleNewLessonFromScratch}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Limpar campos e criar uma lição nova do zero com estrutura pedagógica britânica"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Nova Lição (Do Zero)</span>
                  </button>

                  {/* 2. IMPORTAR DO COMPUTADOR (ARQUIVO .HTML) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Selecionar arquivo .html salvo no seu computador"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>📂 Importar do PC (.html)</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".html,.htm,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* 3. COLAR CÓDIGO / ARTIFACT */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setIsImportModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Abrir janela para colar código HTML ou Artifact"
                  >
                    <Code className="w-4 h-4" />
                    <span>📋 Colar Código / Artifact</span>
                  </button>

                  {/* 4. ATALHO PARA GERAR COM IA */}
                  <button
                    type="button"
                    onClick={() => {
                      const aiInput = document.querySelector('input[placeholder*="tema"]') as HTMLInputElement;
                      if (aiInput) {
                        aiInput.scrollIntoView({ behavior: 'smooth' });
                        aiInput.focus();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Rolar até o assistente de IA britânica"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ Gerar com IA</span>
                  </button>
                </div>
              </div>

              {/* Título e Ordem */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título da Lição:
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* ORDEM NA SEQUÊNCIA (Controle do Teacher) */}
                <div className="bg-purple-50 dark:bg-purple-950/40 p-2 rounded-xl border border-purple-200 dark:border-purple-800">
                  <label className="block text-[11px] font-extrabold text-purple-900 dark:text-purple-300 mb-1 flex items-center justify-between">
                    <span>Posição na Trilha:</span>
                    <span className="text-purple-600 font-mono">Aula #{lessonOrderIndex}</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLessonOrderIndex(Math.max(1, lessonOrderIndex - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border text-xs font-bold hover:bg-purple-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={lessonOrderIndex}
                      onChange={(e) => setLessonOrderIndex(Number(e.target.value))}
                      className="w-full text-center py-1 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-purple-700"
                    />
                    <button
                      type="button"
                      onClick={() => setLessonOrderIndex(lessonOrderIndex + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border text-xs font-bold hover:bg-purple-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* CEFR, Habilidade, Duração e XP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nível CEFR:
                  </label>
                  <select
                    value={lessonLevel}
                    onChange={(e) => setLessonLevel(e.target.value as CEFRLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Nível {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Habilidade:
                  </label>
                  <select
                    value={lessonSkill}
                    onChange={(e) => setLessonSkill(e.target.value as SkillType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="reading">Leitura (Reading)</option>
                    <option value="writing">Escrita (Writing)</option>
                    <option value="listening">Escuta (Listening)</option>
                    <option value="speaking">Fala (Speaking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duração:
                  </label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recompensa XP:
                  </label>
                  <input
                    type="number"
                    value={lessonXp}
                    onChange={(e) => setLessonXp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold font-bold text-amber-500"
                  />
                </div>
              </div>

              {/* Modelos rápidos */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Carregar Modelos Prontos por Categoria:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const t = TEMPLATES.kids;
                      setLessonTitle(t.title);
                      setLessonLevel(t.level);
                      setLessonSkill(t.skill);
                      setLessonCategory(t.category);
                      setTargetAudience(t.targetAudience);
                      setLessonXp(t.xp);
                      setHtmlContent(t.html);
                      sounds.playPop();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200 transition"
                  >
                    🦁 Modelo Kids
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = TEMPLATES.business;
                      setLessonTitle(t.title);
                      setLessonLevel(t.level);
                      setLessonSkill(t.skill);
                      setLessonCategory(t.category);
                      setTargetAudience(t.targetAudience);
                      setLessonXp(t.xp);
                      setHtmlContent(t.html);
                      sounds.playPop();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 hover:bg-sky-200 transition"
                  >
                    💼 Modelo Business
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = TEMPLATES.biblico;
                      setLessonTitle(t.title);
                      setLessonLevel(t.level);
                      setLessonSkill(t.skill);
                      setLessonCategory(t.category);
                      setTargetAudience(t.targetAudience);
                      setLessonXp(t.xp);
                      setHtmlContent(t.html);
                      sounds.playPop();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 hover:bg-purple-200 transition"
                  >
                    📖 Modelo Bíblico
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = TEMPLATES.proficiencia;
                      setLessonTitle(t.title);
                      setLessonLevel(t.level);
                      setLessonSkill(t.skill);
                      setLessonCategory(t.category);
                      setTargetAudience(t.targetAudience);
                      setLessonXp(t.xp);
                      setHtmlContent(t.html);
                      sounds.playPop();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 hover:bg-rose-200 transition"
                  >
                    🎓 Modelo Proficiência
                  </button>
                </div>
              </div>

              {/* Textarea HTML */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código HTML da Atividade (Renderizado no Visualizador do Aluno):
                </label>
                <textarea
                  rows={9}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleSaveLesson}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0b1b3d] hover:opacity-95 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                Publicar Lição na Seção Selecionada (Aula #{lessonOrderIndex})
              </button>
            </div>

            {/* Student Viewer Preview with Responsive Toggle */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Visualizador do Aluno (Live Student Viewer)
                  </h2>
                </div>

                {/* Desktop vs Mobile Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      previewDevice === 'mobile'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Celular
                  </button>
                </div>
              </div>

              {/* Interactive Preview Container with Full Script / Audio / CSS Isolation */}
              <div className="flex flex-col gap-3">
                <InteractiveLessonViewer
                  htmlContent={htmlContent}
                  title={lessonTitle}
                  xpReward={lessonXp}
                  deviceMode={previewDevice}
                  isStudentView={false}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 text-center">
                  O aluno terá exatamente esta experiência interativa ao abrir a aula pelo computador ou smartphone. Todos os áudios TTS nativos, flashcards, scripts e quizzes funcionam em tempo real!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sequence Manager (Reordenar Lições na Trilha Escolhida pelo Teacher) */}
      {adminTab === 'sequence' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-purple-600" />
                Organizador e Reordenador de Sequência de Lições
              </h2>
              <p className="text-xs text-slate-500">
                O Teacher Marcelo tem controle total do caminho de aprendizado. Use os botões <strong>Subir (↑)</strong>,{' '}
                <strong>Descer (↓)</strong> ou altere a numeração para reorganizar o fluxo dos estudantes.
              </p>
            </div>

            {/* Filter by destination/category */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
              {[
                { id: 'all', label: 'Todas as Lições' },
                { id: 'curriculum_adults', label: '🇬🇧 Grade A0-C2' },
                { id: 'kids', label: '🧸 Fluent Kids' },
                { id: 'business', label: '💼 Business' },
                { id: 'biblico', label: '📖 Bíblico' },
                { id: 'proficiencia', label: '🎓 Proficiência' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSequenceFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    sequenceFilter === f.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sequence List with Up / Down reordering and direct order editing */}
          <div className="space-y-3">
            {visibleLessonsInSequence.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Ordem</span>
                    <input
                      type="number"
                      min={1}
                      value={lesson.orderIndex || idx + 1}
                      onChange={(e) => handleSetDirectOrder(lesson.id, Number(e.target.value))}
                      className="w-12 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-black text-center text-sm border border-purple-200 dark:border-purple-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{lesson.title}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Nível {lesson.level} • {lesson.skill}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 uppercase">
                        {lesson.targetAudience === 'kids' ? '🧸 Kids' : lesson.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{lesson.description}</p>
                  </div>
                </div>

                {/* Reordering buttons & Edit action */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleMoveLesson(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Mover Lição para Cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveLesson(idx, 'down')}
                    disabled={idx === visibleLessonsInSequence.length - 1}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Mover Lição para Baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition"
                  >
                    Editar no CMS
                  </button>

                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Remover Lição"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Supabase & Database Integration Manager */}
      {adminTab === 'supabase' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Banco de Dados em Nuvem (PostgreSQL / Supabase)
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                Integração Oficial com Supabase & Tabelas Automáticas
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                O Supabase é a melhor escolha para o modelo de escola de idiomas da FLUENT IMMERSION, pois oferece{' '}
                <strong>PostgreSQL relacional</strong> com integridade entre alunos, notas e lições.
              </p>
            </div>
          </div>

          {/* Quick Setup Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                1. Conectar seu Projeto Supabase
              </h3>
              <p className="text-xs text-slate-500">
                Cole a <strong>URL do Projeto</strong> e a <strong>Anon Key Pública</strong> do seu painel Supabase:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SUPABASE_URL:
                  </label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SUPABASE_ANON_KEY:
                  </label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveSupabaseConfig}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ativar Supabase
                  </button>

                  <button
                    onClick={() => {
                      clearSupabaseCredentials();
                      setSupabaseUrlInput('');
                      setSupabaseKeyInput('');
                      setSupabaseStatusMsg('Credenciais removidas. Modo LocalStorage ativo.');
                    }}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-500 hover:bg-slate-100"
                  >
                    Limpar
                  </button>
                </div>

                {supabaseStatusMsg && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                    {supabaseStatusMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Script DDL Section */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  2. Criar as Tabelas no Supabase (1 Clique)
                </h3>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Script SQL
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Abra o <strong>SQL Editor</strong> do seu painel no Supabase, cole o código abaixo e clique em{' '}
                <strong>RUN</strong>. Ele cria todas as tabelas (<code>lessons</code>, <code>students</code>,{' '}
                <code>student_submissions</code>) com índices e segurança!
              </p>

              <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] h-44 overflow-y-auto border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Students Monitoring, Registration & Sharing */}
      {adminTab === 'students' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Header with Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Secretaria Acadêmica
                  </span>
                  <span className="text-xs text-slate-400">• Teacher Marcelo</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
                  <Users className="w-6 h-6 text-purple-600" />
                  Gestão & Matrícula de Alunos
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cadastre novos estudantes, gere links de acesso personalizados, envie convites no WhatsApp e emita boletins oficiais.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsRegisterStudentModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  + Cadastrar Novo Aluno
                </button>

                <button
                  onClick={() => {
                    const sampleStudent: StudentAcademicRecord = {
                      id: 'sample',
                      name: 'Estudante',
                      email: 'aluno@fluentimmersion.com',
                      level: 'A1',
                      totalXp: 0,
                      speakingScore: 0,
                      listeningScore: 0,
                      readingScore: 0,
                      writingScore: 0,
                      attendanceRate: 100,
                      lastActive: 'Agora',
                      notes: 'Link geral de acesso à plataforma.',
                      track: 'curriculum_adults',
                    };
                    setSharingStudent(sampleStudent);
                    setIsShareModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-purple-600" />
                  Link Geral da Escola
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Matrículas Ativas</span>
                <strong className="text-lg font-black text-slate-900 dark:text-white">{students.length} Alunos</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Frequência Média</span>
                <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1))}%
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block">Fala & Fonética</span>
                <strong className="text-lg font-black text-purple-700 dark:text-purple-300">
                  {Math.round(students.reduce((acc, s) => acc + s.speakingScore, 0) / (students.length || 1))}%
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">Acesso do Aluno</span>
                <strong className="text-xs font-bold text-blue-700 dark:text-blue-300 block mt-1">Sem senha complexa</strong>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-black text-[11px] text-slate-500">
                  <tr>
                    <th className="p-3 rounded-l-xl">Estudante</th>
                    <th className="p-3">Nível CEFR</th>
                    <th className="p-3">Trilha Designada</th>
                    <th className="p-3">Fala & Pronúncia</th>
                    <th className="p-3">Presença</th>
                    <th className="p-3 rounded-r-xl text-right">Ações de Acesso & Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{st.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{st.email}</div>
                        {st.phone && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{st.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                          {st.level}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {st.track === 'kids' && '🧸 Fluent Kids'}
                          {st.track === 'business' && '💼 Business English'}
                          {st.track === 'biblico' && '📖 Inglês Bíblico'}
                          {st.track === 'proficiencia' && '🏆 Proficiência'}
                          {st.track === 'all_access' && '🌟 VIP Acesso Total'}
                          {(!st.track || st.track === 'curriculum_adults') && '🎓 Adultos Geral (A0-C2)'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${st.speakingScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{st.speakingScore}%</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        {st.attendanceRate}%
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Share & WhatsApp Button */}
                          <button
                            onClick={() => {
                              setSharingStudent(st);
                              setIsShareModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                            title="Compartilhar Acesso / Enviar no WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Convidar</span>
                          </button>

                          {/* Report Button */}
                          <button
                            onClick={() => {
                              setSelectedStudentForReport(st);
                              setAdminTab('report');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                            title="Gerar Boletim Acadêmico PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Boletim</span>
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                            title="Excluir Aluno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Cadastrar Novo Aluno */}
          {isRegisterStudentModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
                <button
                  onClick={() => setIsRegisterStudentModalOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Matrícula de Novo Aluno
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cadastre os dados pedagógicos para gerar o link e QR Code de acesso instantâneo.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveNewStudent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome Completo do Aluno *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Ex: Beatriz Lima ou Enzo (Kids)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="aluno@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        WhatsApp (com DDD)
                      </label>
                      <input
                        type="text"
                        value={newStudentPhone}
                        onChange={(e) => setNewStudentPhone(e.target.value)}
                        placeholder="Ex: 4198778348"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nível CEFR Inicial
                      </label>
                      <select
                        value={newStudentLevel}
                        onChange={(e) => setNewStudentLevel(e.target.value as CEFRLevel)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                      >
                        <option value="A0">A0 - Principiante Absoluto</option>
                        <option value="A1">A1 - Iniciante / Básico</option>
                        <option value="A2">A2 - Elementar</option>
                        <option value="B1">B1 - Intermediário</option>
                        <option value="B2">B2 - Independente</option>
                        <option value="C1">C1 - Avançado</option>
                        <option value="C2">C2 - Domínio Pleno / Fluente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Trilha de Aprendizado
                      </label>
                      <select
                        value={newStudentTrack}
                        onChange={(e) => setNewStudentTrack(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                      >
                        <option value="curriculum_adults">🎓 Adultos Geral (A0 - C2)</option>
                        <option value="kids">🧸 Fluent Kids (4 a 12 anos)</option>
                        <option value="business">💼 Business English Corporativo</option>
                        <option value="biblico">📖 Inglês Bíblico & Teológico</option>
                        <option value="proficiencia">🏆 Preparatório Proficiência</option>
                        <option value="all_access">🌟 Acesso VIP Total (Todas as Trilhas Liberadas)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Responsável / E-mail dos Pais (opcional para Kids)
                    </label>
                    <input
                      type="email"
                      value={newStudentParentEmail}
                      onChange={(e) => setNewStudentParentEmail(e.target.value)}
                      placeholder="pais.aluno@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Observações Pedagógicas do Teacher Marcelo
                    </label>
                    <textarea
                      rows={2}
                      value={newStudentNotes}
                      onChange={(e) => setNewStudentNotes(e.target.value)}
                      placeholder="Ex: Foco em conversação britânica, preparação para viagem ou reforço de fonética."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsRegisterStudentModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Concluir Matrícula & Gerar Acesso
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Compartilhar Acesso com o Aluno */}
          {isShareModalOpen && sharingStudent && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Title */}
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0b1b3d] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#c8102e]">
                    🇬🇧
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Acesso Oficial do Aluno
                    </h3>
                    <p className="text-xs text-slate-500">
                      Liberado para <strong>{sharingStudent.name}</strong> • Nível <strong>{sharingStudent.level}</strong>
                    </p>
                  </div>
                </div>

                {/* 1. Botão Enviar pelo WhatsApp */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Send className="w-4 h-4" />
                      1. Enviar Direto no WhatsApp do Aluno (Recomendado)
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      1 Clique
                    </span>
                  </div>

                  <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                    Abre o WhatsApp com mensagem formatada oficial do Teacher Marcelo contendo o link exclusivo de acesso.
                  </p>

                  <button
                    onClick={() => handleShareOnWhatsApp(sharingStudent)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Convite no WhatsApp {sharingStudent.phone ? `(${sharingStudent.phone})` : ''}
                  </button>
                </div>

                {/* 2. Link Direto para Copiar */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Link Direto de Acesso do Aluno:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getStudentInviteUrl(sharingStudent)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
                    />
                    <button
                      onClick={() => handleCopyStudentLink(sharingStudent)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ao abrir esse link, a plataforma reconhece o aluno automaticamente sem exigir senhas complicadas.
                  </p>
                </div>

                {/* 3. QR Code para Apontar a Câmera */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-28 h-28 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        getStudentInviteUrl(sharingStudent)
                      )}`}
                      alt="QR Code de Acesso"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      3. QR Code de Acesso Rápido
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      O estudante ou responsável pode apontar a câmera do smartphone para o QR Code para abrir a plataforma instantaneamente na aula presencial ou em casa.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Exportable PDF Report */}
      {adminTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Printer className="w-5 h-5 text-purple-600" />
              Boletim Acadêmico Oficial • FLUENT IMMERSION
            </h2>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Imprimir / Salvar em PDF
            </button>
          </div>

          {/* Printable Report Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xl space-y-6 max-w-3xl mx-auto print-container">
            {/* Report Header */}
            <div className="flex items-center justify-between border-b-2 border-[#0b1b3d] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-[#c8102e]">
                  Official Academic Transcript
                </span>
                <h1 className="text-2xl font-black text-[#0b1b3d] dark:text-white">FLUENT IMMERSION</h1>
                <p className="text-xs text-slate-500">Direção Pedagógica: {TEACHER_MARCELO.name}</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-[#0b1b3d] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-[#c8102e]">
                🇬🇧
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Aluno:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{selectedStudentForReport.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nível CEFR:</span>
                <strong className="text-rose-600 text-sm font-black">{selectedStudentForReport.level}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">XP Acumulado:</span>
                <strong className="text-amber-500 text-sm">{selectedStudentForReport.totalXp} XP</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Frequência:</span>
                <strong className="text-emerald-600 text-sm">{selectedStudentForReport.attendanceRate}%</strong>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Avaliação de Competências (Escala 0 a 100):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-600 block">Speaking (Fala)</span>
                  <strong className="text-xl font-black text-blue-800 dark:text-blue-300">
                    {selectedStudentForReport.speakingScore}%
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-xs text-purple-600 block">Listening (Escuta)</span>
                  <strong className="text-xl font-black text-purple-800 dark:text-purple-300">
                    {selectedStudentForReport.listeningScore}%
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs text-emerald-600 block">Reading (Leitura)</span>
                  <strong className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                    {selectedStudentForReport.readingScore}%
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-xs text-amber-600 block">Writing (Escrita)</span>
                  <strong className="text-xl font-black text-amber-800 dark:text-amber-300">
                    {selectedStudentForReport.writingScore}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Teacher's Pedagogical Feedback */}
            <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Parecer Avaliativo do Professor:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                "{selectedStudentForReport.notes}"
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <p className="text-[11px] text-slate-400">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                <p className="text-[11px] text-slate-400">Autenticidade Verificada pela IA FLUENT IMMERSION</p>
              </div>

              <div className="text-center space-y-1">
                <div className="w-48 border-b-2 border-slate-800 dark:border-slate-400"></div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{TEACHER_MARCELO.name}</p>
                <p className="text-[10px] text-slate-500">{TEACHER_MARCELO.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Password Management & Reset */}
      {adminTab === 'password' && (
        <div className="max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6 animate-scale-up">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                Gestão de Senha de Administrador
              </h2>
              <p className="text-xs text-slate-500">
                Altere ou redefina a credencial de acesso ao painel do Teacher Marcelo.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Senha Atual:
              </label>
              <input
                type="password"
                value={currentPwdInput}
                onChange={(e) => setCurrentPwdInput(e.target.value)}
                placeholder="Digite a senha atual"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha:
                </label>
                <input
                  type="password"
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova Senha:
                </label>
                <input
                  type="password"
                  value={confirmPwdInput}
                  onChange={(e) => setConfirmPwdInput(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {pwdMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Nova Senha
            </button>
          </form>

          {/* Reset button section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 text-center sm:text-left">
              Esqueceu a senha alterada ou quer voltar ao estado inicial?
            </p>
            <button
              type="button"
              onClick={handleResetPasswordToDefault}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition"
            >
              Restaurar Senha Padrão
            </button>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR CÓDIGO / REACT ARTIFACT DE LIÇÃO COMPLETA */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setImportStatusMsg('');
              }}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Importar Código de Lição Completa
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cole código HTML standalone, React Artifacts (como a Lição de Datas), Web Apps ou scripts de TTS.
                </p>
              </div>
            </div>

            {/* Direct File Upload from PC (Drag and drop or Click) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processUploadedFile(file);
              }}
              onClick={() => modalFileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition cursor-pointer text-center space-y-2 ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 mx-auto flex items-center justify-center">
                <FolderUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  📂 Clique aqui para selecionar o arquivo <span className="text-purple-600 font-mono">.html</span> do seu computador
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ou arraste e solte o arquivo aqui dentro. O sistema lê o código e preenche os campos automaticamente!
                </p>
              </div>
              <input
                type="file"
                ref={modalFileInputRef}
                accept=".html,.htm,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Quick Helper Buttons to test with preloaded Artifacts */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-purple-900 dark:text-purple-200">
                <strong>💡 Exemplos Prontos:</strong> Teste o importador com os artefatos enviados:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/lessons/lesson-fruits-a0.html');
                      if (res.ok) {
                        const text = await res.text();
                        setImportRawCode(text);
                        sounds.playPop();
                      } else {
                        alert('Não foi possível carregar o arquivo pré-carregado. Cole o código diretamente abaixo.');
                      }
                    } catch (e) {
                      alert('Cole o código diretamente na caixa abaixo.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                >
                  🍎 Carregar Aula A0 (Fruits & Market)
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/lessons/lesson-13-dates-birthdays.html');
                      if (res.ok) {
                        const text = await res.text();
                        setImportRawCode(text);
                        sounds.playPop();
                      } else {
                        alert('Não foi possível carregar o arquivo pré-carregado. Cole o código diretamente abaixo.');
                      }
                    } catch (e) {
                      alert('Cole o código diretamente na caixa abaixo.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                >
                  📅 Carregar Aula 13 (Dates & Birthdays)
                </button>
              </div>
            </div>

            {/* Raw Code Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Código da Lição (HTML, React, Javascript, CSS):
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {importRawCode.length > 0 ? `${(importRawCode.length / 1024).toFixed(1)} KB colados` : 'Vazio'}
                </span>
              </div>
              <textarea
                rows={10}
                value={importRawCode}
                onChange={(e) => setImportRawCode(e.target.value)}
                placeholder="Cole o código aqui: <!DOCTYPE html><html>...<script type='module'>..."
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Feedback message */}
            {importStatusMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{importStatusMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleImportRawCode}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0b1b3d] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Importar e Carregar no Editor
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatusMsg('');
                }}
                className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
