
import React, { useState, useRef, useEffect } from 'react';
import { runAgentStep, AgentRole, generateScreenshot } from './services/geminiService';
import JSZip from 'jszip';

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
  Link: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Github: () => <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  Chevron: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Zip: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  History: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

interface FileEntry { name: string; content: string; }

interface AuditRecord {
  id: string;
  role: AgentRole;
  fileName: string;
  timestamp: number;
  analysis: string;
  verification: string;
  refactoredCode: string;
  groundingSources: any[];
  simulationData: any;
  simulationImages: string[];
}

function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [activeRole, setActiveRole] = useState<AgentRole | null>(null);
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } catch {
      setHasApiKey(false);
    }
  };

  const handleOpenKeyDialog = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasApiKey(true);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const processZip = async (data: any) => {
    setIsLoading(true);
    setLoadingMsg('Analizando estrutura técnica...');
    try {
      const zip = await JSZip.loadAsync(data);
      const extracted: FileEntry[] = [];
      const filePromises: Promise<void>[] = [];

      zip.forEach((name, entry) => {
        if (entry.dir || name.includes('__MACOSX') || name.includes('.git/') || name.includes('node_modules/')) return;
        if (/\.(ts|tsx|js|jsx|css|json|md|html)$/.test(name)) {
          filePromises.push(entry.async('string').then(content => {
            extracted.push({ name, content });
          }));
        }
      });

      await Promise.all(filePromises);

      if (extracted.length > 0) {
        setFiles(extracted);
        setActiveFileIndex(0);
        setViewMode('menu');
        return true;
      }
      return false;
    } catch (e) { 
      console.error("Erro no processamento do ZIP:", e);
      alert("Erro ao processar pacote ZIP."); 
      return false;
    } finally { setIsLoading(false); }
  };

  const handleGithubImport = async (urlOverride?: string) => {
    const urlToUse = urlOverride || githubUrl.trim();
    if (!urlToUse) return;
    
    setIsLoading(true);
    const cleanPath = urlToUse.replace(/https?:\/\/github\.com\//, '').replace(/\/tree\/.*$/, '').replace(/\/blob\/.*$/, '').replace(/\.git$/, '').replace(/\/$/, '');
    const parts = cleanPath.split('/');
    
    if (parts.length < 2) { 
      alert("Formato de repositório inválido. Use 'usuario/projeto'."); 
      setIsLoading(false); 
      return; 
    }
    
    const [owner, repo] = parts;
    const branches = ['main', 'master', 'develop', 'trunk'];
    const proxies = [
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, 
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` 
    ];
    
    let success = false;
    for (const proxyFn of proxies) {
      if (success) break;
      for (const branch of branches) {
        if (success) break;
        try {
          const proxyName = proxyFn === proxies[0] ? 'Origin' : 'Tabs';
          setLoadingMsg(`Sincronizando: ${owner}/${repo} [${branch}]...`);
          const targetUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${branch}`;
          const finalUrl = proxyFn(targetUrl);
          
          setLoadingMsg(`Conectando via ${proxyName} [Branch: ${branch}]...`);
          const response = await fetch(finalUrl, { cache: 'no-store' });
          
          if (response.ok) {
            setLoadingMsg(`Download concluído. Processando assets de ${repo}...`);
            const buffer = await response.arrayBuffer();
            if (buffer.byteLength > 1000) { 
              success = await processZip(buffer); 
              if (success) { 
                setLastGithubUrl(urlToUse);
                setShowGithubInput(false); 
                setGithubUrl(''); 
              } 
            }
          }
        } catch (err) { 
          console.warn(`Tentativa falhou para branch ${branch} via proxy.`); 
        }
      }
    }
    
    if (!success) {
      alert("Erro na sincronização GitHub. Verifique se o repositório é público e se o nome está correto.");
    }
    setIsLoading(false);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const targetFile = files[activeFileIndex];
      const projectContext = `Arquivo: ${targetFile.name}. Contexto: ${analysis.substring(0, 300)}...`;
      const { text } = await runAgentStep('CHAT', targetFile.content, projectContext, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: text }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Erro operacional. Tente novamente." }]);
    } finally { setIsChatLoading(false); }
  };

  const runAnalysis = async (role: AgentRole) => {
    if (files.length === 0) return;
    setIsLoading(true);
    setActiveRole(role);
    setAnalysis('');
    setGroundingSources([]);
    setChatHistory([]); 
    const targetFile = files[activeFileIndex];
    const projectContext = `Arquivos no ZIP: ${files.map(f => f.name).join(', ')}. Auditando agora: ${targetFile.name}`;

    try {
      let resultAnalysis = '';
      let resultVerification = '';
      let resultRefactored = '';
      let resultGrounding: any[] = [];
      let resultSimulationData: any = null;
      let resultSimulationImages: string[] = [];

      if (role === 'USER_SIMULATOR') {
        setLoadingMsg('Gerando Blueprint Visual...');
        const { text } = await runAgentStep('USER_SIMULATOR', targetFile.content, projectContext);
        resultSimulationData = JSON.parse(text);
        setSimulationData(resultSimulationData);
        setViewMode('simulation');
        const images = await Promise.all(resultSimulationData.steps.map((s: any) => generateScreenshot(s.imagePrompt)));
        resultSimulationImages = images.filter(i => i !== null) as string[];
        setSimulationImages(resultSimulationImages);
      } else {
        setLoadingMsg(`Agente Pro ${role}: Analisando fontes...`);
        const { text: raw, sources } = await runAgentStep(role, targetFile.content, projectContext);
        setLoadingMsg(`Verificador: Validando integridade...`);
        const { text: ver } = await runAgentStep('VERIFIER', targetFile.content, projectContext, raw);
        const codeMatch = raw.match(/\[REFACTORED_CODE\]([\s\S]*?)\[\/REFACTORED_CODE\]/);
        
        resultAnalysis = raw;
        resultVerification = ver;
        resultGrounding = sources || [];
        resultRefactored = codeMatch ? codeMatch[1].trim() : targetFile.content;

        setAnalysis(resultAnalysis);
        setVerification(resultVerification);
        setGroundingSources(resultGrounding);
        setRefactoredCode(resultRefactored);
        setViewMode('diff');
      }

      // Salva no histórico
      const record: AuditRecord = {
        id: Math.random().toString(36).substr(2, 9),
        role,
        fileName: targetFile.name,
        timestamp: Date.now(),
        analysis: resultAnalysis,
        verification: resultVerification,
        refactoredCode: resultRefactored,
        groundingSources: resultGrounding,
        simulationData: resultSimulationData,
        simulationImages: resultSimulationImages
      };
      setAuditHistory(prev => [record, ...prev]);

    } catch (err: any) { 
      if (err.message === "KEY_RESET_REQUIRED") { setHasApiKey(false); setViewMode('welcome'); }
      else { alert("Ocorreu um erro na análise técnica."); }
    } finally { setIsLoading(false); }
  };

  const loadFromHistory = (record: AuditRecord) => {
    setActiveRole(record.role);
    setAnalysis(record.analysis);
    setVerification(record.verification);
    setRefactoredCode(record.refactoredCode);
    setGroundingSources(record.groundingSources);
    setSimulationData(record.simulationData);
    setSimulationImages(record.simulationImages);
    setChatHistory([]);

    const fileIdx = files.findIndex(f => f.name === record.fileName);
    if (fileIdx !== -1) setActiveFileIndex(fileIdx);

    if (record.role === 'USER_SIMULATOR') setViewMode('simulation');
    else setViewMode('diff');
  };

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = `Relatório_Auditoria_${files[activeFileIndex]?.name.split('/').pop() || 'Squad'}`;
    window.print();
    document.title = originalTitle;
  };

  const WelcomeScreen = () => (
    <div className="min-h-full flex flex-col items-center justify-center p-8 lg:p-20 space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">Auditoria Profissional Certificada</div>
        <h2 className="text-6xl font-black text-white italic tracking-tighter leading-tight uppercase">Squad Auditor <span className="text-indigo-500 italic">Core</span></h2>
        <p className="text-xl text-gray-500 font-light leading-relaxed">Fidelidade técnica e precisão estratégica para sistemas de alta complexidade.</p>
        {!hasApiKey && (
          <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex flex-col items-center gap-4">
            <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">A análise profunda (Pro) exige uma chave de API própria faturada.</p>
            <button onClick={handleOpenKeyDialog} className="px-6 py-3 bg-amber-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-amber-400 transition-colors">Conectar Chave Pro</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <button onClick={() => fileInputRef.current?.click()} className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all text-center space-y-6 active:scale-95 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform"><Icons.Zip /></div>
          <div><h4 className="text-xl font-black text-white uppercase mb-2">Deploy Source</h4><p className="text-sm text-gray-500 font-medium">Audite seu repositório via pacote ZIP.</p></div>
        </button>
        <div className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all text-center space-y-6 flex flex-col items-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform"><Icons.Github /></div>
          {!showGithubInput ? (
            <><div><h4 className="text-xl font-black text-white uppercase mb-2">GitHub Sync</h4><p className="text-sm text-gray-500 font-medium">Importação direta via repositório público.</p></div>
            <button onClick={() => setShowGithubInput(true)} className="px-8 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase text-white hover:bg-indigo-600 transition-colors">Conectar</button></>
          ) : (
            <div className="w-full space-y-3"><input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="usuario/repositorio" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" />
              <div className="flex gap-2"><button onClick={() => handleGithubImport()} className="flex-1 py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase text-white">Importar</button><button onClick={() => setShowGithubInput(false)} className="px-4 py-3 bg-white/5 rounded-xl text-white"><Icons.Close /></button></div>
            </div>
          )}
        </div>
        <button onClick={() => setViewMode('menu')} disabled={files.length === 0} className={`group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 transition-all text-center space-y-6 flex flex-col items-center ${files.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-emerald-500/50 active:scale-95'}`}>
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform"><Icons.Code /></div>
          <div><h4 className="text-xl font-black text-white uppercase mb-2">Dashboard Central</h4><p className="text-sm text-gray-500 font-medium">Acesse os protocolos de auditoria ativa.</p></div>
        </button>
      </div>
    </div>
  );

  const ReportView = () => (
    <div className="min-h-full bg-white text-gray-900 p-12 lg:p-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-y-auto printable-page">
      <div className="max-w-4xl mx-auto space-y-20 pb-40 report-content">
        <header className="border-b-4 border-black pb-12 flex justify-between items-end">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Master <br/>Audit <br/><span className="text-indigo-600">Report</span></h1>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Certificado de Qualidade Squad Auditor v2.5</p>
          </div>
          <div className="text-right space-y-2">
            <div className="text-[10px] font-black uppercase text-gray-400">Data de Emissão</div>
            <div className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR')}</div>
            <div className="text-[10px] font-black uppercase text-gray-400 mt-4">Arquivo Alvo</div>
            <div className="text-sm font-bold truncate max-w-[200px]">{files[activeFileIndex]?.name}</div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">01. Sumário Executivo</h3>
            <p className="text-xl font-bold leading-tight italic">
              {simulationData?.finalReport || "Este projeto apresenta uma estrutura orientada a componentes modulares, com foco em responsividade e performance através de tecnologias modernas."}
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">02. Veredito de Integridade</h3>
            <div className="p-6 bg-indigo-50 border-l-4 border-indigo-600 italic font-medium text-sm leading-relaxed">
              "{verification}"
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">03. Auditoria Técnica Profunda ({activeRole})</h3>
          <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-loose" dangerouslySetInnerHTML={{ __html: analysis.replace(/\[REFACTORED_CODE\][\s\S]*?\[\/REFACTORED_CODE\]/g, '').replace(/\n/g, '<br/>') }} />
        </section>

        {refactoredCode && (
          <section className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">04. Arquitetura Proposta (Refatoração)</h3>
            <div className="rounded-3xl overflow-hidden border border-gray-200 bg-gray-50">
               <div className="px-6 py-3 bg-gray-100 border-b border-gray-200 text-[9px] font-black uppercase tracking-widest flex justify-between">
                  <span>Código Otimizado pela IA</span>
                  <span className="text-indigo-600">SQUAD CERTIFIED</span>
               </div>
               <pre className="p-8 text-[11px] font-mono text-gray-600 overflow-x-auto">{refactoredCode}</pre>
            </div>
          </section>
        )}

        {simulationData?.improvements && (
          <section className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">05. Roteiro de Otimização Visual</h3>
            <ul className="space-y-3 list-none p-0">
              {simulationData.improvements.map((imp: string, i: number) => (
                <li key={i} className="flex gap-4 items-start text-sm font-medium text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {chatHistory.length > 0 && (
          <section className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">06. Notas de Consultoria (Chat Log)</h3>
            <div className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-indigo-600 text-white'}`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="text-xs font-medium text-gray-600 leading-relaxed py-1 italic">"{msg.text}"</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-20 border-t border-gray-100 flex justify-between items-center opacity-40">
          <div className="text-[10px] font-black uppercase tracking-widest">© {new Date().getFullYear()} Squad Auditor Intelligence</div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <span>Privacidade</span>
            <span>Compliance</span>
            <span>Termos</span>
          </div>
        </footer>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#08080c]">
      <header className="px-8 py-5 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewMode('welcome')}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"><Icons.Rocket /></div>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter italic">Squad Auditor <span className="text-xs text-indigo-400 opacity-60 italic">PRODUCTION</span></h1>
        </div>
        <div className="flex items-center gap-4">
          {lastGithubUrl && viewMode !== 'welcome' && (
            <button 
              onClick={() => handleGithubImport(lastGithubUrl)} 
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-white hover:border-indigo-500/50 flex items-center gap-2 transition-all group no-print"
              title="Sincronizar Repositório GitHub"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500"><Icons.Refresh /></span>
              Re-Sync
            </button>
          )}
          {viewMode === 'report' && (
            <button onClick={handleDownloadPdf} className="px-6 py-2 bg-emerald-600 rounded-xl text-xs font-black uppercase text-white hover:bg-emerald-500 shadow-lg flex items-center gap-2 animate-in slide-in-from-right transition-all transform active:scale-95 no-print"><Icons.Download /> Salvar como PDF</button>
          )}
          {files.length > 0 && (
            <nav className="flex items-center gap-4 no-print">
              <button onClick={() => setViewMode('menu')} className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2 hover:bg-white/5 px-3 py-1 rounded-lg transition-colors"><Icons.Code /> Dashboard</button>
              <button onClick={() => {setFiles([]); setViewMode('welcome'); setLastGithubUrl(''); setAuditHistory([]);}} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase text-white hover:bg-white/10">Novo Projeto</button>
            </nav>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {files.length > 0 && viewMode !== 'report' && (
          <aside className="w-64 border-r border-white/5 bg-[#0a0a0f]/40 overflow-y-auto p-4 space-y-2 shrink-0 no-print">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-4">Mapeamento de Fonte</p>
            {files.map((f, i) => (
              <button key={i} onClick={() => { setActiveFileIndex(i); setViewMode('menu'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeFileIndex === i ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-500 hover:bg-white/5'}`}>
                <Icons.File /> <span className="truncate">{f.name.split('/').pop()}</span>
              </button>
            ))}
          </aside>
        )}

        <main className="flex-1 overflow-auto bg-[#050508] relative">
          <input type="file" ref={fileInputRef} onChange={(e) => processZip(e.target.files?.[0])} className="hidden" />
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in">
              <div className="w-24 h-24 border-t-4 border-indigo-600 rounded-full animate-spin shadow-[0_0_50px_rgba(79,70,229,0.3)]" />
              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{loadingMsg}</h3>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] animate-pulse mt-3">Sincronizando Heurísticas</p>
              </div>
            </div>
          ) : viewMode === 'welcome' ? <WelcomeScreen /> : 
             viewMode === 'menu' ? (
            <div className="p-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 animate-in fade-in duration-700">
              <div className="lg:col-span-3 space-y-12">
                <div className="text-center lg:text-left space-y-4">
                  <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">Protocolos Ativos</h2>
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Target: {files[activeFileIndex]?.name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'BUSINESS_VISIONARY', title: 'CPO Strategic Audit', desc: 'Market fit e maturidade comercial.', icon: <Icons.Crown />, color: 'from-amber-400 to-orange-600' },
                    { id: 'INFRA_SCALABILITY', title: 'Cloud & Scale', desc: 'Back-end, caches e escalabilidade.', icon: <Icons.Server />, color: 'from-blue-500 to-cyan-600' },
                    { id: 'USER_SIMULATOR', title: 'Visual Blueprint', desc: 'Wireframes técnicos da interface.', icon: <Icons.User />, color: 'from-purple-600 to-pink-600' },
                    { id: 'SECURITY', title: 'Security Audit', desc: 'Foco em Red Team e falhas.', icon: <Icons.Shield />, color: 'from-red-600 to-orange-600' },
                    { id: 'ORCHESTRATOR', title: 'Architect Refactor', desc: 'Refatoração para performance.', icon: <Icons.Rocket />, color: 'from-blue-600 to-indigo-600' },
                    { id: 'E2E_SPECIALIST', title: 'E2E Test Architect', desc: 'Mapeamento de testes críticos.', icon: <Icons.Test />, color: 'from-emerald-500 to-green-600' }
                  ].map(card => (
                    <button key={card.id} onClick={() => runAnalysis(card.id as AgentRole)} className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all text-left space-y-4 overflow-hidden active:scale-95 shadow-lg">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-5 blur-2xl group-hover:opacity-20 transition-opacity`} />
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xl`}>{card.icon}</div>
                      <div className="space-y-1"><h4 className="text-lg font-black text-white uppercase leading-none">{card.title}</h4><p className="text-[10px] text-gray-500 leading-relaxed font-medium">{card.desc}</p></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Protocol Registry (History) Sidebar inside Menu */}
              <div className="lg:col-span-1 bg-white/5 rounded-[2.5rem] border border-white/10 p-8 flex flex-col space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="text-indigo-400"><Icons.History /></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Protocol Registry</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[600px]">
                  {auditHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-20">
                      <Icons.History />
                      <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Nenhuma auditoria realizada ainda.</p>
                    </div>
                  ) : (
                    auditHistory.map((record) => (
                      <button 
                        key={record.id} 
                        onClick={() => loadFromHistory(record)}
                        className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all text-left group active:scale-95"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[8px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded tracking-tighter">{record.role}</span>
                          <span className="text-[8px] font-bold text-gray-600 uppercase">{new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-300 truncate mb-1">{record.fileName.split('/').pop()}</p>
                        <div className="flex items-center gap-1 text-[8px] font-black text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Carregar Registro <Icons.Chevron /></div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : viewMode === 'report' ? <ReportView /> :
             viewMode === 'simulation' && simulationData ? (
             <div className="p-12 max-w-5xl mx-auto space-y-20 pb-40 animate-in fade-in">
                <div className="p-10 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/20 text-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl" />
                   <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter">Blueprint de Interface</h3>
                   <p className="text-indigo-300 font-medium italic text-lg leading-relaxed relative z-10">"{simulationData.finalReport}"</p>
                </div>
                
                {simulationData.improvements?.length > 0 && (
                  <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 max-w-2xl mx-auto space-y-6">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] text-center italic">Checklist de Otimização Visual</h4>
                    <div className="grid gap-4">
                      {simulationData.improvements.map((imp: string, i: number) => (
                        <div key={i} className="flex gap-4 items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">{i+1}</div>
                          <p className="text-xs font-medium text-gray-300 italic">"{imp}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-40">
                  {simulationData.steps.map((step: any, idx: number) => (
                    <div key={idx} className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className="space-y-8">
                         <div className="flex items-center gap-6"><span className="text-7xl font-black text-indigo-600/10 italic leading-none">0{idx+1}</span><h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{step.step}</h4></div>
                         <div className="p-8 rounded-3xl bg-white/5 border border-white/10 border-l-4 border-l-indigo-500"><p className="text-gray-400 leading-relaxed font-medium text-sm">{step.verdict}</p></div>
                      </div>
                      <div className="relative group rounded-[3rem] overflow-hidden border border-white/20 aspect-video bg-[#0a0a0f] shadow-2xl">
                          {simulationImages[idx] ? <img src={simulationImages[idx]} className="w-full h-full object-contain p-4" alt="Technical Wireframe" /> :
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-4"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /><span className="text-gray-600 uppercase text-[9px] font-black tracking-widest">Reconstruindo UI...</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-2 h-full divide-x divide-white/5 animate-in fade-in">
               <div className="flex flex-col bg-black/20 overflow-hidden">
                  <header className="p-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase border-b border-white/5 flex justify-between"><span>Código Base</span><span className="opacity-50 tracking-widest">READ-ONLY</span></header>
                  <pre className="p-8 font-mono text-[11px] text-gray-600 overflow-auto whitespace-pre-wrap flex-1">{files[activeFileIndex]?.content}</pre>
               </div>
               <div className="flex flex-col bg-emerald-500/5 overflow-hidden">
                  <header className="p-4 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border-b border-white/5">Refatoração Squad</header>
                  <pre className="p-8 font-mono text-[11px] text-emerald-100/80 overflow-auto whitespace-pre-wrap flex-1">{refactoredCode}</pre>
               </div>
            </div>
          )}
        </main>

        {analysis && (viewMode === 'diff' || viewMode === 'menu') && (
          <aside className="w-96 border-l border-white/5 bg-[#0a0a0f] flex flex-col shrink-0 animate-in slide-in-from-right duration-500 no-print">
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between items-center"><h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Status da Auditoria</h4><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase">Concluída</span></div>
                   <button onClick={() => setViewMode('report')} className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-indigo-500 transition-all shadow-lg flex items-center justify-center gap-2 tracking-widest">Gerar Relatório Mestre <Icons.Chevron /></button>
                   <div className="p-5 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed italic font-medium">"{verification}"</div>
                   {groundingSources.length > 0 && (
                     <div className="space-y-2"><h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fontes de Validação</h5><div className="flex flex-wrap gap-2">{groundingSources.map((s, idx) => (<a key={idx} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[9px] text-gray-400 border border-white/10 hover:border-indigo-500 transition-colors"><Icons.Link /> {s.web?.title || 'Referência'}</a>))}</div></div>
                   )}
                </div>
                <div className="space-y-4 border-t border-white/5 pt-6">
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Canal Squad</h4>
                   <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {chatHistory.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${chat.role === 'user' ? 'bg-indigo-600 text-indigo-50 shadow-lg' : 'bg-white/5 text-gray-300 border border-white/10'}`}>{chat.text}</div></div>
                      ))}
                      {isChatLoading && <div className="flex justify-start"><div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex gap-1 animate-pulse"><div className="w-1 h-1 bg-gray-500 rounded-full" /><div className="w-1 h-1 bg-gray-500 rounded-full" /><div className="w-1 h-1 bg-gray-500 rounded-full" /></div></div>}
                      <div ref={chatEndRef} />
                   </div>
                </div>
                <div className="prose prose-invert prose-xs text-gray-500 leading-relaxed font-medium text-[11px] border-t border-white/5 pt-6" dangerouslySetInnerHTML={{ __html: analysis.replace(/\[REFACTORED_CODE\][\s\S]*?\[\/REFACTORED_CODE\]/g, '').replace(/\n/g, '<br/>') }} />
             </div>
             <div className="p-6 border-t border-white/5 bg-[#08080c]">
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                   <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSubmit()} className="flex-1 bg-transparent px-4 py-3 text-xs outline-none text-white" placeholder="Consultar Agente..." disabled={isChatLoading} />
                   <button onClick={handleChatSubmit} disabled={isChatLoading || !chatInput.trim()} className={`p-3 rounded-xl transition-all ${isChatLoading || !chatInput.trim() ? 'bg-white/5 text-gray-600' : 'bg-indigo-600 text-white shadow-indigo-600/20 active:scale-95'}`}><Icons.Chevron /></button>
                </div>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
