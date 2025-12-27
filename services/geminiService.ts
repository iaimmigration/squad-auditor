
import { GoogleGenAI, Type } from "@google/genai";

export type AgentRole = 
  | 'ORCHESTRATOR' 
  | 'VERIFIER' 
  | 'USER_SIMULATOR' 
  | 'SECURITY' 
  | 'E2E_SPECIALIST' 
  | 'CLEAN_CODE' 
  | 'BUSINESS_VISIONARY'
  | 'INFRA_SCALABILITY'
  | 'CHAT';

const getPromptForRole = (role: AgentRole, code: string, context?: string, userMessage?: string): string => {
  const fileMap = context || 'Contexto não fornecido';
  
  const systemBase = `
    VOCÊ É UM AUDITOR DE ENGENHARIA DE SOFTWARE DE ELITE.
    FOCO: PRECISÃO, RIGOR TÉCNICO E FIDELIDADE AOS FATOS.
    - É PROIBIDO inventar funcionalidades ou elementos visuais que não existam no código.
    - Se o código não define uma cor ou layout, descreva como "Padrão do Navegador/Framework".
    - Contexto do Projeto: ${fileMap}.
    
    OBRIGATÓRIO: Ao final de sua análise, você DEVE incluir uma seção chamada "### LISTA DE SUGESTÕES DE MELHORIA" com pontos acionáveis (bullet points) para consertar ou otimizar o código analisado.
  `;
  
  const prompts: Record<AgentRole, string> = {
    E2E_SPECIALIST: `${systemBase}
      MISSÃO: Arquiteto de Testes End-to-End (E2E) e QA Automation Engineer.
      TAREFAS:
      1. MAPEAMENTO DE FLUXOS: Identifique os 3 fluxos mais críticos.
      2. SCRIPTS DE TESTE: Gere snippets de teste (Playwright ou Cypress).
      3. TESTABILIDADE: Avalie a estabilidade dos seletores.
      4. CASOS DE BORDA: Liste 5 cenários de erro.
      5. INTEGRAÇÃO CI/CD: Sugira automação.`,

    INFRA_SCALABILITY: `${systemBase}
      MISSÃO: Arquiteto de Cloud & Escala.
      Analise o código para arquitetura de backend e infraestrutura.
      TAREFAS: Database Strategy, Cache, Orchestration, Scalability Bottlenecks, Cloud Costs.`,

    USER_SIMULATOR: `${systemBase}
      MISSÃO: Auditoria de Arquitetura Visual e UX Estática.
      Sua tarefa é realizar uma "Renderização Mental" do código fornecido.
      PROCEDIMENTO:
      1. ANALISE o layout principal (Flex, Grid, Containers).
      2. IDENTIFIQUE componentes de entrada (Inputs, Buttons) e saída (Tables, Cards, Lists).
      3. MAPEE a hierarquia tipográfica e cores detectadas (especialmente classes Tailwind).
      4. DETERMINE a Proposta de Valor Visual: o que o usuário sente ao olhar para esta tela?
      
      PARA O 'imagePrompt':
      Crie uma descrição técnica para um gerador de diagramas. 
      Foque em ESTRUTURA, não em estilo artístico.`,

    BUSINESS_VISIONARY: `${systemBase}
      MISSÃO: CPO & Estrategista. Analise market fit e maturidade comercial baseada no código.`,

    ORCHESTRATOR: `${systemBase}
      MISSÃO: Refatoração de Produção.
      Você DEVE retornar o código corrigido e melhorado obrigatoriamente entre as tags [REFACTORED_CODE] e [/REFACTORED_CODE].`,

    SECURITY: `${systemBase}
      MISSÃO: Auditoria Red Team. Identifique falhas de segurança e retorne a correção entre as tags [REFACTORED_CODE] e [/REFACTORED_CODE].`,

    CLEAN_CODE: `${systemBase}
      MISSÃO: Especialista em SOLID e Clean Code. Retorne o código melhorado entre as tags [REFACTORED_CODE] e [/REFACTORED_CODE].`,

    VERIFIER: `Você é um verificador de integridade. Analise se a análise anterior é coerente com o código real: \n${code}\n\nAnálise a verificar:`,
    CHAT: `Consultor sênior de engenharia. Contexto do código atual: \n${code}\n\nPergunta do usuário: ${userMessage}`
  };

  return prompts[role] || prompts.ORCHESTRATOR;
};

export const runAgentStep = async (role: AgentRole, code: string, context?: string, userMessage?: string): Promise<{text: string, sources?: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const isComplex = role !== 'CHAT' && role !== 'VERIFIER';
    const modelName = isComplex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const config: any = {
      maxOutputTokens: 15000,
      thinkingConfig: { thinkingBudget: isComplex ? 16000 : 4000 },
      temperature: (role === 'CHAT' || role === 'USER_SIMULATOR') ? 0.4 : 0.1,
      tools: (role !== 'CHAT' && role !== 'USER_SIMULATOR' && role !== 'VERIFIER') ? [{ googleSearch: {} }] : undefined,
    };

    if (role === 'USER_SIMULATOR') {
      config.responseMimeType = "application/json";
      config.responseSchema = {
        type: Type.OBJECT,
        properties: {
          valueProposition: { 
            type: Type.STRING, 
            description: "A essência técnica da interface baseada no código analisado." 
          },
          persona: { 
            type: Type.STRING, 
            description: "Perfil de usuário técnico ou final para o qual este código foi otimizado." 
          },
          steps: {
            type: Type.ARRAY,
            description: "Fluxos visuais ou seções da tela identificadas.",
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING, description: "Nome do componente ou seção." },
                verdict: { type: Type.STRING, description: "Análise técnica do impacto visual." },
                imagePrompt: { type: Type.STRING, description: "Descrição do wireframe para geração de imagem." }
              },
              required: ["step", "verdict", "imagePrompt"]
            }
          },
          improvements: {
            type: Type.ARRAY,
            description: "Lista de sugestões técnicas de melhoria para a UI/UX baseada no código.",
            items: { type: Type.STRING }
          },
          finalReport: { 
            type: Type.STRING, 
            description: "Conclusão da auditoria visual." 
          }
        },
        required: ["valueProposition", "persona", "steps", "improvements", "finalReport"]
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      config: config,
      contents: getPromptForRole(role, code, context, userMessage),
    });

    return {
      text: response.text || '',
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("403")) {
      throw new Error("KEY_RESET_REQUIRED");
    }
    console.error(`Erro no Agente ${role}:`, error);
    throw error;
  }
};

export const generateScreenshot = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ 
          text: `UI ARCHITECTURE BLUEPRINT: ${prompt}. Clean minimalist technical wireframe, blueprint blue lines, professional documentation style, no human figures, top-down or perspective view.` 
        }] 
      },
      config: { 
        imageConfig: { 
          aspectRatio: "16:9"
        } 
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) { 
    console.error("Falha na geração de imagem técnica:", error);
    return null; 
  }
};
