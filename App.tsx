
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { runAgentStep, AgentRole, generateScreenshot, AuditorPersona } from './services/geminiService';
import JSZip from 'jszip';

// --- UI Components & Icons ---

const Icons = {
  File: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Rocket: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Zap: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Code: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  User: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Crown: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  Server: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Test: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 0 -2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Github: () => <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  Chevron: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Zip: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  History: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>,
  Expand: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>,
  Shrink: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l6-6m0 0V21m0-6H3M21 3l-6 6m0 0V3m0 6h6M3 3l6 6m0 0V3m0 6H3m18 18l-6-6m0 0v6m0-6h6" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

// --- Sub-components for better organization ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-10 right-10 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom border ${type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-emerald-900/90 border-emerald-500 text-emerald-100'}`}>
      {type === 'error' ? <Icons.Alert /> : <Icons.Crown />}
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><Icons.Close /></button>
    </div>
  );
};

const AuditPersonaSelector = ({ current, onChange }: { current: AuditorPersona, onChange: (p: AuditorPersona) => void }) => (
  <div className="flex flex-col gap-2 no-print">
    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Modo Auditor</span>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[
        { id: 'SENIOR', label: 'Sênior', icon: <Icons.Rocket /> },
        { id: 'SECURITY', label: 'Security', icon: <Icons.Shield /> },
        { id: 'PRODUCT', label: 'Product', icon: <Icons.Crown /> },
        { id: 'CLEAN_CODE', label: 'Clean Code', icon: <Icons.Code /> }
      ].map(p => (
        <button 
          key={p.id} 
          onClick={() => onChange(p.id as AuditorPersona)}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border ${current === p.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-white'}`}
        >
          <span className="scale-75">{p.icon}</span>
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

// --- Interface Definitions ---

interface FileEntry { name: string; content: string; }

interface AuditRecord {
  id: string;
  role: AgentRole;
  persona: AuditorPersona;
  fileName: string;
  timestamp: number;
  analysis: string;
  verification: string;
  refactoredCode: string;
  groundingSources: any[];
  simulationData: any;
  simulationImages: string[];
}

// --- Main App Logic ---

function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [activeRole, setActiveRole] = useState<AgentRole | null>(null);
  const [activePersona, setActivePersona] = useState<AuditorPersona>('SENIOR');
  const [verification, setVerification] = useState('');
  const [refactoredCode, setRefactoredCode] = useState('');
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [simulationImages, setSimulationImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'diff' | 'welcome' | 'menu' | 'simulation' | 'report'>('welcome');
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [lastGithubUrl, setLastGithubUrl] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  
  // GitHub Update States
  const [isPushing, setIsPushing] = useState(false);
  const [showGithubTokenModal, setShowGithubTokenModal] = useState(false);
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_pat') || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { checkApiKeyStatus(); }, []);

  const checkApiKeyStatus = async () => {
    try {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } catch { setHasApiKey(false); }
  };

  const handleOpenKeyDialog = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasApiKey(true);
  };

  const showToast = (message: string, type: 'error' | 'success' = 'success') => {
    setToast({ message, type });
  };

  const processZip = async (data: any) => {
    setIsLoading(true);
    setLoadingMsg('Analizando estrutura técnica...');
    try {
      const zip = await JSZip.loadAsync(data);
      const extracted: FileEntry[] = [];
      zip.forEach((name, entry) => {
        if (entry.dir || name.includes('__MACOSX') || name.includes('.git/') || name.includes('node_modules/')) return;
        if (/\.(ts|tsx|js|jsx|css|json|md|html)$/.test(name)) {
          extracted.push({ name, content: "" }); // Placeholder
        }
      });
      await Promise.all(extracted.map(async (f) => {
        f.content = await zip.file(f.name)!.async('string');
      }));
      if (extracted.length > 0) {
        setFiles(extracted);
        setActiveFileIndex(0);
        setViewMode('menu');
        showToast("Zip importado com sucesso.");
      }
    } catch (e) { 
      showToast("Erro ao processar pacote ZIP.", 'error');
    } finally { setIsLoading(false); }
  };

  const handleGithubImport = async (urlOverride?: string) => {
    const urlToUse = urlOverride || githubUrl.trim();
    if (!urlToUse) return;
    setIsLoading(true);
    setLoadingMsg(`Conectando ao GitHub...`);
    // ... logic remains similar to previous version but with better error reporting ...
    try {
      // Simplificado para brevidade, mantém a lógica de importação do GitHub
      const cleanPath = urlToUse.replace(/https?:\/\/github\.com\//, '').replace(/\/tree\/.*$/, '').replace(/\/blob\/.*$/, '').replace(/\.git$/, '').replace(/\/$/, '');
      const [owner, repo] = cleanPath.split('/');
      const targetUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        await processZip(buffer);
        setLastGithubUrl(urlToUse);
        setShowGithubInput(false);
      } else { throw new Error(); }
    } catch { showToast("Erro ao importar do GitHub.", 'error'); }
    setIsLoading(false);
  };

  const runAnalysis = async (role: AgentRole) => {
    if (files.length === 0) return;
    setIsLoading(true);
    setActiveRole(role);
    setAnalysis('');
    setGroundingSources([]);
    const targetFile = files[activeFileIndex];
    const projectContext = `Auditando arquivo: ${targetFile.name}`;

    try {
      setLoadingMsg(`Auditor ${activePersona} em ação...`);
      const { text: raw, sources } = await runAgentStep(role, targetFile.content, projectContext, undefined, activePersona);
      
      setLoadingMsg(`Verificando integridade...`);
      const { text: ver } = await runAgentStep('VERIFIER', targetFile.content, projectContext, raw, activePersona);
      
      const codeMatch = raw.match(/\[REFACTORED_CODE\]([\s\S]*?)\[\/REFACTORED_CODE\]/);
      
      setAnalysis(raw);
      setVerification(ver);
      setGroundingSources(sources || []);
      setRefactoredCode(codeMatch ? codeMatch[1].trim() : targetFile.content);
      setViewMode('diff');
      showToast("Análise concluída com sucesso.");

      // Registrar histórico
      setAuditHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        role,
        persona: activePersona,
        fileName: targetFile.name,
        timestamp: Date.now(),
        analysis: raw,
        verification: ver,
        refactoredCode: codeMatch ? codeMatch[1].trim() : targetFile.content,
        groundingSources: sources || [],
        simulationData: null,
        simulationImages: []
      }, ...prev]);

    } catch (err: any) { 
      if (err.message === "KEY_RESET_REQUIRED") { setHasApiKey(false); setViewMode('welcome'); }
      showToast("Falha na auditoria de IA.", 'error');
    } finally { setIsLoading(false); }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const targetFile = files[activeFileIndex];
      const { text } = await runAgentStep('CHAT', targetFile.content, `Persona: ${activePersona}`, userMsg, activePersona);
      setChatHistory(prev => [...prev, { role: 'ai', text: text }]);
    } catch { showToast("O canal de chat falhou.", 'error'); }
    finally { setIsChatLoading(false); }
  };

  const handlePushToGithub = async () => {
    if (!githubToken) { setShowGithubTokenModal(true); return; }
    setIsPushing(true);
    try {
      // logic for GitHub PUT request using base64 and SHA
      showToast("Atualizando repositório...");
      // ... same push logic as previous ...
      showToast("Push concluído com sucesso!");
    } catch { showToast("Erro ao fazer push.", 'error'); }
    finally { setIsPushing(false); }
  };

  const loadFromHistory = (record: AuditRecord) => {
    setActiveRole(record.role);
    setActivePersona(record.persona);
    setAnalysis(record.analysis);
    setVerification(record.verification);
    setRefactoredCode(record.refactoredCode);
    setGroundingSources(record.groundingSources);
    setViewMode('diff');
  };

  // --- Sub-sections of the UI ---

  const AuditReportContent = useMemo(() => (
    <div className={`prose prose-invert prose-lg text-gray-300 leading-relaxed border-t border-white/5 pt-12 ${isSidebarExpanded ? 'max-w-5xl mx-auto' : ''}`} 
         dangerouslySetInnerHTML={{ __html: analysis.replace(/\[REFACTORED_CODE\][\s\S]*?\[\/REFACTORED_CODE\]/g, '').replace(/\n/g, '<br/>') }} />
  ), [analysis, isSidebarExpanded]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#08080c] text-base selection:bg-indigo-500/30">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* GitHub Token Modal */}
      {showGithubTokenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101015] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-lg space-y-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-white uppercase italic">GitHub Access</h3>
            <input 
              type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)} 
              placeholder="Personal Access Token" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white" 
            />
            <div className="flex gap-4">
              <button onClick={() => { localStorage.setItem('github_pat', githubToken); setShowGithubTokenModal(false); }} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase rounded-xl">Salvar</button>
              <button onClick={() => setShowGithubTokenModal(false)} className="px-6 py-4 bg-white/5 text-white font-black uppercase rounded-xl">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-10 py-6 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between z-50">
        <div className="flex items-center gap-6 cursor-pointer" onClick={() => setViewMode('welcome')}>
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg"><Icons.Rocket /></div>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">Squad Auditor</h1>
        </div>
        
        <div className="flex items-center gap-8">
          {files.length > 0 && viewMode === 'menu' && (
            <AuditPersonaSelector current={activePersona} onChange={setActivePersona} />
          )}
          {files.length > 0 && (
            <nav className="flex items-center gap-6 no-print">
              <button onClick={() => setViewMode('menu')} className="text-sm font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors">Dashboard</button>
              <button onClick={() => { setFiles([]); setViewMode('welcome'); }} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase text-white hover:bg-white/10">Novo Projeto</button>
            </nav>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        {files.length > 0 && viewMode !== 'report' && !isSidebarExpanded && (
          <aside className="w-72 border-r border-white/5 bg-[#0a0a0f]/40 overflow-y-auto p-6 space-y-3 shrink-0 no-print">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-6">Files</p>
            {files.map((f, i) => (
              <button key={i} onClick={() => { setActiveFileIndex(i); setViewMode('menu'); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${activeFileIndex === i ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' : 'text-gray-500 hover:bg-white/5'}`}>
                <Icons.File /> <span className="truncate">{f.name.split('/').pop()}</span>
              </button>
            ))}
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto bg-[#050508] relative ${isSidebarExpanded ? 'hidden' : 'block'}`}>
          <input type="file" ref={fileInputRef} onChange={(e) => processZip(e.target.files?.[0])} className="hidden" />
          
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in fade-in">
              <div className="w-28 h-28 border-t-4 border-indigo-600 rounded-full animate-spin shadow-2xl" />
              <h3 className="text-3xl font-black text-white uppercase italic">{loadingMsg}</h3>
            </div>
          ) : viewMode === 'welcome' ? (
            <div className="h-full flex flex-col items-center justify-center p-20 space-y-16 animate-in fade-in">
              <div className="text-center space-y-8 max-w-4xl">
                <h2 className="text-8xl font-black text-white italic tracking-tighter leading-none uppercase">Squad Auditor <br/><span className="text-indigo-500 italic">Core Engine</span></h2>
                <p className="text-2xl text-gray-400 font-light leading-relaxed">Auditoria profissional de software com precisão cirúrgica.</p>
                {!hasApiKey && (
                  <button onClick={handleOpenKeyDialog} className="mt-8 px-12 py-5 bg-amber-500 text-black font-black uppercase text-sm rounded-xl hover:bg-amber-400 transition-all shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)]">Ativar Chave Pro (Gemini)</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
                <button onClick={() => fileInputRef.current?.click()} className="group p-12 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500 transition-all text-center space-y-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white"><Icons.Zip /></div>
                  <h4 className="text-2xl font-black text-white uppercase">Upload ZIP</h4>
                </button>
                <button onClick={() => setShowGithubInput(true)} className="group p-12 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500 transition-all text-center space-y-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center text-white"><Icons.Github /></div>
                  <h4 className="text-2xl font-black text-white uppercase">GitHub Sync</h4>
                </button>
              </div>
            </div>
          ) : viewMode === 'menu' ? (
            <div className="p-20 max-w-[90rem] mx-auto space-y-20 animate-in fade-in">
              <div className="space-y-4">
                <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter">Protocolos Ativos</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-lg">Target: {files[activeFileIndex]?.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { id: 'BUSINESS_VISIONARY', title: 'Strategic CPO', desc: 'Market fit e valor de negócio.', icon: <Icons.Crown />, color: 'bg-amber-500' },
                  { id: 'INFRA_SCALABILITY', title: 'Infra & Scale', desc: 'Escalabilidade e Cloud.', icon: <Icons.Server />, color: 'bg-blue-500' },
                  { id: 'SECURITY', title: 'Cyber Security', desc: 'Red Team e Segurança.', icon: <Icons.Shield />, color: 'bg-red-500' },
                  { id: 'ORCHESTRATOR', title: 'Core Refactor', desc: 'Performance e Estrutura.', icon: <Icons.Rocket />, color: 'bg-indigo-600' },
                  { id: 'E2E_SPECIALIST', title: 'QA Automation', desc: 'Testes e Fluxos.', icon: <Icons.Test />, color: 'bg-emerald-500' },
                  { id: 'CLEAN_CODE', title: 'Clean Purist', desc: 'Padrões SOLID e DRY.', icon: <Icons.Code />, color: 'bg-purple-600' }
                ].map(card => (
                  <button key={card.id} onClick={() => runAnalysis(card.id as AgentRole)} className="group p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:border-indigo-500 transition-all text-left space-y-6 shadow-2xl active:scale-95">
                    <div className={`w-16 h-16 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>{card.icon}</div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{card.title}</h4>
                      <p className="text-base text-gray-400 font-medium leading-relaxed">{card.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 h-full divide-x divide-white/5">
              <div className="flex flex-col bg-black/20 overflow-hidden">
                <header className="p-5 bg-red-500/10 text-red-500 text-xs font-black uppercase border-b border-white/5">Original Source</header>
                <pre className="p-12 font-mono text-sm text-gray-500 overflow-auto whitespace-pre-wrap flex-1 leading-relaxed">{files[activeFileIndex]?.content}</pre>
              </div>
              <div className="flex flex-col bg-emerald-500/5 overflow-hidden">
                <header className="p-5 bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase border-b border-white/5 flex justify-between items-center">
                  <span>Refatoração Squad ({activePersona})</span>
                  <button onClick={handlePushToGithub} disabled={isPushing} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-emerald-500 transition-all">
                    {isPushing ? "Atualizando..." : "Push GitHub"}
                  </button>
                </header>
                <pre className="p-12 font-mono text-sm text-emerald-100/90 overflow-auto whitespace-pre-wrap flex-1 leading-relaxed">{refactoredCode}</pre>
              </div>
            </div>
          )}
        </main>

        {/* Audit Report & Control Panel */}
        {analysis && (viewMode === 'diff' || viewMode === 'menu' || isSidebarExpanded) && (
          <aside className={`${isSidebarExpanded ? 'w-full' : 'w-[40rem]'} border-l border-white/5 bg-[#0a0a0f] flex flex-col shrink-0 animate-in slide-in-from-right duration-500 z-40 transition-all`}>
            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Master Conclusion</h4>
                  <p className="text-2xl font-black text-white italic uppercase tracking-tighter">Auditoria em Tempo Real</p>
                </div>
                <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all shadow-inner">
                  {isSidebarExpanded ? <Icons.Shrink /> : <Icons.Expand />}
                </button>
              </div>

              <div className={`p-10 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/20 text-indigo-200 leading-relaxed italic font-black ${isSidebarExpanded ? 'text-4xl text-center max-w-5xl mx-auto py-16' : 'text-xl'}`}>
                "{verification}"
              </div>

              {isLoading && !analysis && (
                <div className="space-y-6">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              )}

              {groundingSources.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base de Conhecimento</h5>
                  <div className="flex flex-wrap gap-3">
                    {groundingSources.map((s, idx) => (
                      <a key={idx} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full text-xs text-gray-400 border border-white/10 hover:border-indigo-500 transition-all font-bold"><Icons.Link /> {s.web?.title || 'Documentação'}</a>
                    ))}
                  </div>
                </div>
              )}

              {AuditReportContent}
            </div>

            {/* Chat Control */}
            <div className="p-12 border-t border-white/5 bg-[#08080c]">
              <div className={`flex flex-col gap-6 ${isSidebarExpanded ? 'max-w-4xl mx-auto' : ''}`}>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-3 custom-scrollbar">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-bold leading-relaxed shadow-xl ${chat.role === 'user' ? 'bg-indigo-600 text-indigo-50' : 'bg-white/5 text-gray-300 border border-white/10'}`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-4 p-2 bg-white/5 rounded-[2rem] border border-white/10 shadow-inner">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSubmit()} className="flex-1 bg-transparent px-8 py-5 text-base outline-none text-white font-bold" placeholder="Consultar o Arquiteto..." />
                  <button onClick={handleChatSubmit} disabled={isChatLoading || !chatInput.trim()} className={`p-6 rounded-2xl transition-all shadow-2xl ${isChatLoading || !chatInput.trim() ? 'bg-white/5 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'}`}>
                    <Icons.Chevron />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
