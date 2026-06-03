import React, { useState, useCallback, useRef } from 'react';
import {
  Code2,
  Monitor,
  Terminal,
  Copy,
  Check,
  Sliders,
  Info,
  Download,
  Plus,
  Trash2,
  Move,
  Layers,
  Grid3x3,
  FileText,
  RefreshCw,
  ChevronDown,
  Square,
  Type,
  ToggleLeft,
  List,
  PanelTop,
  Image,
  FolderOpen,
  GripVertical,
} from 'lucide-react';
import {
  InterfaceConfig,
  ComponentConfig,
  ComponentType,
  DialogType,
  SimulationLog,
  GridColumn,
  COMPONENT_DEFAULTS,
  DIALOG_TYPE_INFO,
  COMPONENT_TYPE_INFO,
} from './types';
import { generateADVPLCode } from './advplGenerator';

// ============================================================================
// DEFAULT CONFIG
// ============================================================================
const DEFAULT_CONFIG: InterfaceConfig = {
  dialogType: 'msdialog',
  windowTitle: 'Ajuste Automático de Lote',
  windowWidth: 440,
  windowHeight: 218,
  pixelScale: true,
  centered: true,
  marginTop: 32,
  marginLeft: 24,
  gapLinhas: 24,
  sayInstructions: 'Informe o novo valor total para o processamento e ajuste automático dos campos',
  labelPrompt: 'Novo Total:',
  mainVarName: 'nValTotal',
  mainVarType: 'Numeric',
  mainVarDefault: '8500.00',
  mainVarLength: 30,
  mainVarDecimals: 2,
  confirmAction: 'MsgInfo("Valor ajustado: " + cValToChar(nValTotal), "Sucesso")',
  components: [
    {
      id: 'comp_1',
      type: 'say',
      label: 'Label Descrição',
      x: 15,
      y: 15,
      width: 200,
      height: 20,
      prompt: 'Informe os dados abaixo:',
      fontSize: 12,
      bold: true,
    },
    {
      id: 'comp_2',
      type: 'say',
      label: 'Label Nome',
      x: 15,
      y: 50,
      width: 80,
      height: 20,
      prompt: 'Nome:',
    },
    {
      id: 'comp_3',
      type: 'get',
      label: 'Input Nome',
      x: 100,
      y: 48,
      width: 200,
      height: 22,
      varName: 'cNome',
      varType: 'Character',
      charLength: 30,
      defaultValue: '',
    },
    {
      id: 'comp_4',
      type: 'button',
      label: 'Btn Confirmar',
      x: 150,
      y: 280,
      width: 90,
      height: 28,
      prompt: 'Confirmar',
      action: 'MsgInfo("Nome: " + AllTrim(cNome), "Sucesso")',
    },
    {
      id: 'comp_5',
      type: 'button',
      label: 'Btn Cancelar',
      x: 260,
      y: 280,
      width: 90,
      height: 28,
      prompt: 'Cancelar',
      action: 'oDlg:End()',
    },
  ],
  gridColumns: [
    { id: 'gc1', field: 'PRODUTO', title: 'Produto', width: 120, type: 'Character', editable: true },
    { id: 'gc2', field: 'QUANT', title: 'Quantidade', width: 80, type: 'Numeric', editable: true },
    { id: 'gc3', field: 'VLUNIT', title: 'Vl. Unitário', width: 100, type: 'Numeric', editable: true },
  ],
  gridAlias: 'TRB',
  msmgetAlias: 'SA1',
  msmgetFields: ['A1_COD', 'A1_LOJA', 'A1_NOME', 'A1_END', 'A1_MUN'],
  fwEnableFormBar: true,
  fwCloseOnOk: true,
  functionName: 'AjustValor',
  description: 'Janela para alteração de valor com input simples',
};

// ============================================================================
// COMPONENT ICON MAP
// ============================================================================
const COMP_ICONS: Record<ComponentType, React.ReactNode> = {
  say: <Type className="w-3.5 h-3.5" />,
  get: <FileText className="w-3.5 h-3.5" />,
  button: <Square className="w-3.5 h-3.5" />,
  combobox: <ChevronDown className="w-3.5 h-3.5" />,
  checkbox: <ToggleLeft className="w-3.5 h-3.5" />,
  radio: <Grid3x3 className="w-3.5 h-3.5" />,
  panel: <PanelTop className="w-3.5 h-3.5" />,
  listbox: <List className="w-3.5 h-3.5" />,
  multiget: <FileText className="w-3.5 h-3.5" />,
  bitmap: <Image className="w-3.5 h-3.5" />,
  meter: <Sliders className="w-3.5 h-3.5" />,
  folder: <FolderOpen className="w-3.5 h-3.5" />,
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [config, setConfig] = useState<InterfaceConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'canvas' | 'code'>('canvas');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [showComponentPalette, setShowComponentPalette] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag state for moving components on canvas
  const [draggingComp, setDraggingComp] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const generatedCode = generateADVPLCode(config);

  const addLog = useCallback((type: SimulationLog['type'], message: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [{
      id: Math.random().toString(36).substring(2, 9),
      timestamp: time,
      type,
      message,
    }, ...prev].slice(0, 50));
  }, []);

  // ---- Component Operations ----
  const addComponent = useCallback((type: ComponentType, x?: number, y?: number) => {
    const defaults = COMPONENT_DEFAULTS[type];
    const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newComp: ComponentConfig = {
      id,
      type,
      label: COMPONENT_TYPE_INFO[type].name,
      x: x ?? 20 + Math.random() * 50,
      y: y ?? 20 + Math.random() * 50,
      width: defaults.width || 100,
      height: defaults.height || 22,
      ...defaults,
    };
    setConfig(prev => ({
      ...prev,
      components: [...prev.components, newComp],
    }));
    setSelectedComponent(id);
    addLog('success', `Componente ${COMPONENT_TYPE_INFO[type].name} adicionado.`);
  }, [addLog]);

  const removeComponent = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
    }));
    if (selectedComponent === id) setSelectedComponent(null);
    addLog('warning', 'Componente removido.');
  }, [selectedComponent, addLog]);

  const updateComponent = useCallback((id: string, updates: Partial<ComponentConfig>) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  // ---- Canvas Drag Handlers ----
  const handleCanvasMouseDown = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation();
    const comp = config.components.find(c => c.id === compId);
    if (!comp) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setDraggingComp(compId);
    setDragOffset({
      x: e.clientX - canvasRect.left - comp.x,
      y: e.clientY - canvasRect.top - comp.y,
    });
    setSelectedComponent(compId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingComp) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const newX = Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffset.x, config.windowWidth - 20));
    const newY = Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffset.y, config.windowHeight - 20));
    
    updateComponent(draggingComp, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handleCanvasMouseUp = () => {
    setDraggingComp(null);
  };

  // ---- Drop from palette ----
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = e.clientX - canvasRect.left - 40;
    const y = e.clientY - canvasRect.top - 10;
    addComponent(draggedType, Math.max(5, x), Math.max(5, y));
    setDraggedType(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ---- Code operations ----
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    addLog('success', 'Código ADVPL copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `U_${config.functionName.toUpperCase()}.PRW`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('success', `Arquivo U_${config.functionName.toUpperCase()}.PRW baixado!`);
  };

  // ---- Grid Column Operations ----
  const addGridColumn = () => {
    const id = `gc_${Date.now()}`;
    const newCol: GridColumn = {
      id,
      field: `CAMPO${(config.gridColumns?.length || 0) + 1}`,
      title: `Campo ${(config.gridColumns?.length || 0) + 1}`,
      width: 100,
      type: 'Character',
      editable: true,
    };
    setConfig(prev => ({
      ...prev,
      gridColumns: [...(prev.gridColumns || []), newCol],
    }));
  };

  const removeGridColumn = (id: string) => {
    setConfig(prev => ({
      ...prev,
      gridColumns: (prev.gridColumns || []).filter(c => c.id !== id),
    }));
  };

  const updateGridColumn = (id: string, updates: Partial<GridColumn>) => {
    setConfig(prev => ({
      ...prev,
      gridColumns: (prev.gridColumns || []).map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  // ---- Highlighter ----
  const highlightADVPL = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('//')) {
        return <span key={idx} className="block text-slate-500 italic">{line}</span>;
      }
      const parts = line.split(/(\s+|,|\(|\)|:|@|;|\+|:=)/);
      const highlightedLine = parts.map((part, pIdx) => {
        const trimmed = part.trim().toUpperCase();
        const keywords = [
          'USER', 'FUNCTION', 'LOCAL', 'RETURN', 'DEFINE', 'MSDIALOG', 'TITLE', 'FROM', 'TO',
          'PIXEL', 'SAY', 'PROMPT', 'SIZE', 'OF', 'MSGET', 'VAR', 'BUTTON', 'ACTION', 'ACTIVATE',
          'CENTERED', 'IF', 'ELSE', 'ENDIF', 'ALLTRIM', 'CVALTOCHAR', 'DTOC', 'CTOD', 'MSGINFO',
          'MSGSTOP', 'PADR', 'SPACE', 'CHECKBOX', 'COMBOBOX', 'ITEMS', 'RADIO', 'LISTBOX',
          'MSMGET', 'BITMAP', 'FILE', 'METER', 'TOTAL', 'STATIC', 'NIL', '#INCLUDE', 'DATE',
          'NEW', 'GETAREA', 'RESTAREA', 'AADD', 'RECNO', 'ALIAS',
        ];
        if (keywords.includes(trimmed)) {
          return <span key={pIdx} className="text-emerald-400 font-semibold">{part}</span>;
        }
        if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
          return <span key={pIdx} className="text-amber-300">{part}</span>;
        }
        if (/^\d+\.?\d*$/.test(trimmed)) {
          return <span key={pIdx} className="text-sky-300">{part}</span>;
        }
        if (/^\.T\.$|^\.F\.$/.test(trimmed)) {
          return <span key={pIdx} className="text-pink-400 font-bold">{part}</span>;
        }
        return <span key={pIdx}>{part}</span>;
      });
      return <span key={idx} className="block min-h-[1.2rem]">{highlightedLine}</span>;
    });
  };

  const selectedComp = config.components.find(c => c.id === selectedComponent);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40 shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-emerald-500 p-2 rounded-xl shadow-lg">
              <Code2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Simulador de Interfaces ADVPL
              </h1>
              <p className="text-[10px] text-slate-400">
                Construa telas Protheus visualmente • MsDialog • TDialog • FWDialogModal • MsNewGetDados • Enchoice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 text-slate-200 transition-all cursor-pointer"
            >
              {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copiado!</span></> 
                : <><Copy className="w-3.5 h-3.5" /><span>Copiar</span></>}
            </button>
            <button
              onClick={downloadCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-xs font-bold rounded-lg text-white transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .PRW</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 py-4 grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-0 overflow-y-auto">
        
        {/* LEFT PANEL: Config */}
        <aside className="xl:col-span-3 space-y-4 flex flex-col overflow-y-auto max-h-[calc(100vh-120px)]">
          
          {/* Dialog Type Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Tipo de Interface</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(DIALOG_TYPE_INFO) as DialogType[]).map(dt => (
                <button
                  key={dt}
                  onClick={() => {
                    setConfig(prev => ({ ...prev, dialogType: dt }));
                    addLog('info', `Tipo alterado para ${DIALOG_TYPE_INFO[dt].name}`);
                  }}
                  className={`p-2 text-left rounded-lg text-[11px] border transition-all cursor-pointer ${
                    config.dialogType === dt
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/20'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    <span>{DIALOG_TYPE_INFO[dt].icon}</span>
                    {DIALOG_TYPE_INFO[dt].name}
                  </span>
                  <span className="text-[10px] opacity-70 block mt-0.5">{DIALOG_TYPE_INFO[dt].description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Window Properties */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Medidas e Coordenadas ADVPL</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Tamanho {config.pixelScale ? 'Pixel' : 'Char'}</span>
            </div>
            <div className="space-y-3 text-xs">
              {/* Largura e Altura */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Largura Dialog</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.windowWidth}px</span>
                  </div>
                  <input type="range" min="200" max="800" value={config.windowWidth}
                    onChange={e => setConfig(prev => ({ ...prev, windowWidth: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Altura Dialog</span>
                    <span className="text-cyan-400 font-mono font-bold">{config.windowHeight}px</span>
                  </div>
                  <input type="range" min="100" max="600" value={config.windowHeight}
                    onChange={e => setConfig(prev => ({ ...prev, windowHeight: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Margem Top, Margem Left, Gap Linhas */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Margem Top</span>
                    <span className="text-slate-200 font-mono">{config.marginTop}</span>
                  </div>
                  <input type="range" min="5" max="80" value={config.marginTop}
                    onChange={e => setConfig(prev => ({ ...prev, marginTop: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Margem Left</span>
                    <span className="text-slate-200 font-mono">{config.marginLeft}</span>
                  </div>
                  <input type="range" min="5" max="80" value={config.marginLeft}
                    onChange={e => setConfig(prev => ({ ...prev, marginLeft: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Gap Linhas</span>
                    <span className="text-slate-200 font-mono">{config.gapLinhas}</span>
                  </div>
                  <input type="range" min="8" max="60" value={config.gapLinhas}
                    onChange={e => setConfig(prev => ({ ...prev, gapLinhas: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggle Pixel */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block">Medida em Pixels (Pixel)</span>
                  <span className="text-[10px] text-slate-500">Adiciona palavra-chave Pixel na janela</span>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, pixelScale: !prev.pixelScale }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${config.pixelScale ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.pixelScale ? 'translate-x-5.5' : 'translate-x-0.5'}`}></span>
                </button>
              </div>

              {/* Centralizado */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block">Centralizar na Tela</span>
                  <span className="text-[10px] text-slate-500">Activate ... Centered</span>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, centered: !prev.centered }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${config.centered ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.centered ? 'translate-x-5.5' : 'translate-x-0.5'}`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Propriedades Específicas - MsDialog / TDialog */}
          {(config.dialogType === 'msdialog' || config.dialogType === 'tdialog') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Propriedades Específicas</span>
              </div>
              <div className="space-y-3 text-xs">
                {/* Título e Instruções */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Título MsDialog</label>
                    <input type="text" value={config.windowTitle}
                      onChange={e => setConfig(prev => ({ ...prev, windowTitle: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Ex: Ajuste Automático de Lote"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Instruções do Say</label>
                    <input type="text" value={config.sayInstructions}
                      onChange={e => setConfig(prev => ({ ...prev, sayInstructions: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Texto descritivo para o operador"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800"></div>

                {/* Prompt e Variável */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Prompt do Label</label>
                    <input type="text" value={config.labelPrompt}
                      onChange={e => setConfig(prev => ({ ...prev, labelPrompt: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Ex: Novo Valor:"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Nome Variável (Local)</label>
                    <input type="text" value={config.mainVarName}
                      onChange={e => setConfig(prev => ({ ...prev, mainVarName: e.target.value.replace(/\s/g, '') }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Ex: nValTotal"
                    />
                  </div>
                </div>

                {/* Tipo, Valor Inicial, Comprimento */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Tipo de Variável</label>
                    <select value={config.mainVarType}
                      onChange={e => setConfig(prev => ({ ...prev, mainVarType: e.target.value as any }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500 cursor-pointer">
                      <option value="Character">C (Character)</option>
                      <option value="Numeric">N (Numeric)</option>
                      <option value="Date">D (Date)</option>
                      <option value="Logical">L (Logical)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Valor Inicial</label>
                    <input type="text" value={config.mainVarDefault}
                      onChange={e => setConfig(prev => ({ ...prev, mainVarDefault: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500 transition-colors"
                      placeholder={config.mainVarType === 'Date' ? 'DD/MM/AAAA' : ''}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Comprimento</label>
                    <input type="number" value={config.mainVarLength} min={1} max={200}
                      onChange={e => setConfig(prev => ({ ...prev, mainVarLength: parseInt(e.target.value) || 20 }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Decimais (só para Numeric) */}
                {config.mainVarType === 'Numeric' && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Casas Decimais</label>
                    <input type="number" value={config.mainVarDecimals} min={0} max={6}
                      onChange={e => setConfig(prev => ({ ...prev, mainVarDecimals: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500 transition-colors max-w-[120px]"
                    />
                  </div>
                )}

                <div className="border-t border-slate-800"></div>

                {/* Ação Confirmar */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold italic">Ação do Confirmar (código ADVPL)</label>
                  <textarea rows={2} value={config.confirmAction}
                    onChange={e => setConfig(prev => ({ ...prev, confirmAction: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono text-[10px] outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder='MsgInfo("Valor: " + cValToChar(nVal), "OK")'
                  />
                </div>

                {/* Nome da Função e Descrição */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Nome da Função</label>
                    <input type="text" value={config.functionName}
                      onChange={e => setConfig(prev => ({ ...prev, functionName: e.target.value.replace(/\s/g, '') }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Ex: AjustValor"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Descrição</label>
                    <input type="text" value={config.description}
                      onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Propriedades Específicas - FWDialogModal */}
          {config.dialogType === 'fwdialogmodal' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Propriedades FWDialogModal</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Título da Modal</label>
                    <input type="text" value={config.windowTitle}
                      onChange={e => setConfig(prev => ({ ...prev, windowTitle: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Nome da Função</label>
                    <input type="text" value={config.functionName}
                      onChange={e => setConfig(prev => ({ ...prev, functionName: e.target.value.replace(/\s/g, '') }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold italic">Descrição</label>
                  <input type="text" value={config.description}
                    onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                {/* FW specific toggles */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">EnableFormBar</span>
                    <span className="text-[10px] text-slate-500">Habilita barra superior com título</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, fwEnableFormBar: !prev.fwEnableFormBar }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${config.fwEnableFormBar ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.fwEnableFormBar ? 'translate-x-5.5' : 'translate-x-0.5'}`}></span>
                  </button>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">Fechar ao Confirmar</span>
                    <span className="text-[10px] text-slate-500">oDlg:DeActivate() no botão OK</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, fwCloseOnOk: !prev.fwCloseOnOk }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${config.fwCloseOnOk ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.fwCloseOnOk ? 'translate-x-5.5' : 'translate-x-0.5'}`}></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Propriedades Específicas - MsNewGetDados */}
          {config.dialogType === 'msnewgetdados' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Propriedades da Grid</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Título da Janela</label>
                    <input type="text" value={config.windowTitle}
                      onChange={e => setConfig(prev => ({ ...prev, windowTitle: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Alias WorkArea</label>
                    <input type="text" value={config.gridAlias || ''}
                      onChange={e => setConfig(prev => ({ ...prev, gridAlias: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500"
                      placeholder="TRB"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Nome da Função</label>
                    <input type="text" value={config.functionName}
                      onChange={e => setConfig(prev => ({ ...prev, functionName: e.target.value.replace(/\s/g, '') }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Descrição</label>
                    <input type="text" value={config.description}
                      onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Columns Config (for MsNewGetDados) */}
          {config.dialogType === 'msnewgetdados' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4 text-cyan-400" />
                  Colunas da Grid
                </span>
                <button onClick={addGridColumn}
                  className="p-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {(config.gridColumns || []).map(col => (
                  <div key={col.id} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <input type="text" value={col.title}
                        onChange={e => updateGridColumn(col.id, { title: e.target.value })}
                        className="bg-transparent text-xs font-semibold text-slate-200 outline-none flex-1"
                        placeholder="Título"
                      />
                      <button onClick={() => removeGridColumn(col.id)}
                        className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <input type="text" value={col.field}
                        onChange={e => updateGridColumn(col.id, { field: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-300 font-mono outline-none"
                        placeholder="Campo"
                      />
                      <select value={col.type}
                        onChange={e => updateGridColumn(col.id, { type: e.target.value as any })}
                        className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-300 outline-none">
                        <option value="Character">Char</option>
                        <option value="Numeric">Num</option>
                        <option value="Date">Date</option>
                      </select>
                      <input type="number" value={col.width}
                        onChange={e => updateGridColumn(col.id, { width: parseInt(e.target.value) || 80 })}
                        className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-300 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MSMGet Fields Config */}
          {config.dialogType === 'msmget' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Propriedades Enchoice (MSMGet)</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Título da Janela</label>
                    <input type="text" value={config.windowTitle}
                      onChange={e => setConfig(prev => ({ ...prev, windowTitle: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold italic">Nome da Função</label>
                    <input type="text" value={config.functionName}
                      onChange={e => setConfig(prev => ({ ...prev, functionName: e.target.value.replace(/\s/g, '') }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold italic">Alias da Tabela (SX2)</label>
                  <input type="text" value={config.msmgetAlias || ''}
                    onChange={e => setConfig(prev => ({ ...prev, msmgetAlias: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500"
                    placeholder="Ex: SA1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold italic">Campos do SX3 (separados por vírgula)</label>
                  <textarea rows={3}
                    value={(config.msmgetFields || []).join(', ')}
                    onChange={e => setConfig(prev => ({ ...prev, msmgetFields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono outline-none focus:border-cyan-500 resize-none text-[10px]"
                    placeholder="A1_COD, A1_LOJA, A1_NOME, A1_END"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold italic">Descrição</label>
                  <input type="text" value={config.description}
                    onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selected Component Properties */}
          {selectedComp && (config.dialogType === 'msdialog' || config.dialogType === 'tdialog' || config.dialogType === 'fwdialogmodal') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Propriedades: {COMPONENT_TYPE_INFO[selectedComp.type].name}
                </span>
                <button onClick={() => removeComponent(selectedComp.id)}
                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                {/* Position */}
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500">X</label>
                    <input type="number" value={selectedComp.x}
                      onChange={e => updateComponent(selectedComp.id, { x: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500">Y</label>
                    <input type="number" value={selectedComp.y}
                      onChange={e => updateComponent(selectedComp.id, { y: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500">W</label>
                    <input type="number" value={selectedComp.width}
                      onChange={e => updateComponent(selectedComp.id, { width: parseInt(e.target.value) || 50 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500">H</label>
                    <input type="number" value={selectedComp.height}
                      onChange={e => updateComponent(selectedComp.id, { height: parseInt(e.target.value) || 20 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none font-mono text-[10px]"
                    />
                  </div>
                </div>

                {/* Prompt / Text */}
                {(selectedComp.type === 'say' || selectedComp.type === 'button' || selectedComp.type === 'checkbox') && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Texto / Prompt</label>
                    <input type="text" value={selectedComp.prompt || ''}
                      onChange={e => updateComponent(selectedComp.id, { prompt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none"
                    />
                  </div>
                )}

                {/* Variable */}
                {(selectedComp.type === 'get' || selectedComp.type === 'combobox' || selectedComp.type === 'checkbox' || selectedComp.type === 'radio' || selectedComp.type === 'multiget' || selectedComp.type === 'listbox' || selectedComp.type === 'meter') && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Variável</label>
                        <input type="text" value={selectedComp.varName || ''}
                          onChange={e => updateComponent(selectedComp.id, { varName: e.target.value.replace(/\s/g, '') })}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Tipo</label>
                        <select value={selectedComp.varType || 'Character'}
                          onChange={e => updateComponent(selectedComp.id, { varType: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none">
                          <option value="Character">Character</option>
                          <option value="Numeric">Numeric</option>
                          <option value="Date">Date</option>
                          <option value="Logical">Logical</option>
                        </select>
                      </div>
                    </div>
                    {selectedComp.varType === 'Character' && (
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Tamanho</label>
                        <input type="number" value={selectedComp.charLength || 20}
                          onChange={e => updateComponent(selectedComp.id, { charLength: parseInt(e.target.value) || 20 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Valor Default</label>
                      <input type="text" value={selectedComp.defaultValue || ''}
                        onChange={e => updateComponent(selectedComp.id, { defaultValue: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 font-mono outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Action (Button) */}
                {selectedComp.type === 'button' && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Action (código ADVPL)</label>
                    <textarea rows={2} value={selectedComp.action || ''}
                      onChange={e => updateComponent(selectedComp.id, { action: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 font-mono outline-none resize-none text-[10px]"
                    />
                  </div>
                )}

                {/* Items (ComboBox, Radio, ListBox, Folder) */}
                {(selectedComp.type === 'combobox' || selectedComp.type === 'radio' || selectedComp.type === 'listbox' || selectedComp.type === 'folder') && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Itens (um por linha)</label>
                    <textarea rows={3} value={(selectedComp.items || []).join('\n')}
                      onChange={e => updateComponent(selectedComp.id, { items: e.target.value.split('\n').filter(Boolean) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100 outline-none resize-none text-[10px]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* CENTER + RIGHT: Canvas / Code */}
        <section className="xl:col-span-9 flex flex-col gap-4">
          {/* Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex gap-1.5">
            <button onClick={() => setActiveTab('canvas')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'canvas' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}>
              <Monitor className="w-4 h-4" />
              <span>Designer Visual</span>
            </button>
            <button onClick={() => setActiveTab('code')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'code' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}>
              <Code2 className="w-4 h-4" />
              <span>Código ADVPL (.PRW)</span>
            </button>
          </div>

          {/* CANVAS TAB */}
          {activeTab === 'canvas' && (
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {/* Component Palette */}
              {(config.dialogType === 'msdialog' || config.dialogType === 'tdialog' || config.dialogType === 'fwdialogmodal') && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Plus className="w-3 h-3" /> Paleta de Componentes (arraste para o canvas)
                    </span>
                    <button onClick={() => setShowComponentPalette(!showComponentPalette)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">
                      {showComponentPalette ? 'Recolher' : 'Expandir'}
                    </button>
                  </div>
                  {showComponentPalette && (
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(COMPONENT_TYPE_INFO) as ComponentType[]).map(ct => (
                        <button
                          key={ct}
                          draggable
                          onDragStart={() => setDraggedType(ct)}
                          onDragEnd={() => setDraggedType(null)}
                          onClick={() => addComponent(ct)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-md text-[10px] text-slate-300 hover:text-white transition-all cursor-grab active:cursor-grabbing"
                          title={COMPONENT_TYPE_INFO[ct].description}
                        >
                          {COMP_ICONS[ct]}
                          <span className="font-medium">{COMPONENT_TYPE_INFO[ct].name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Canvas */}
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-6 min-h-[400px]"
                style={{ background: 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 0 0 / 20px 20px' }}>
                
                {/* Dialog Window Preview */}
                <div
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onDrop={handleCanvasDrop}
                  onDragOver={handleCanvasDragOver}
                  className="relative bg-neutral-200 border-2 border-neutral-400 rounded shadow-2xl overflow-hidden"
                  style={{ width: `${config.windowWidth}px`, height: `${config.windowHeight}px`, maxWidth: '100%' }}
                  onClick={() => setSelectedComponent(null)}
                >
                  {/* Title Bar */}
                  <div className="bg-gradient-to-r from-blue-800 to-sky-600 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between select-none">
                    <span className="truncate">{config.windowTitle}</span>
                    <span className="text-[10px] opacity-60">✕</span>
                  </div>

                  {/* Canvas Area */}
                  <div className="relative" style={{ height: `${config.windowHeight - 28}px` }}>
                    {/* Render for MsDialog / TDialog / FWDialogModal */}
                    {(config.dialogType === 'msdialog' || config.dialogType === 'tdialog' || config.dialogType === 'fwdialogmodal') && config.components.map(comp => (
                      <div
                        key={comp.id}
                        onMouseDown={e => handleCanvasMouseDown(e, comp.id)}
                        onClick={e => { e.stopPropagation(); setSelectedComponent(comp.id); }}
                        className={`absolute cursor-move select-none transition-shadow ${
                          selectedComponent === comp.id
                            ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-neutral-200 z-20'
                            : 'hover:ring-1 hover:ring-blue-400/50 z-10'
                        }`}
                        style={{
                          left: `${comp.x}px`,
                          top: `${comp.y}px`,
                          width: `${comp.width}px`,
                          height: `${comp.height}px`,
                        }}
                        title={`${COMPONENT_TYPE_INFO[comp.type].advplClass} - ${comp.varName || comp.prompt || ''}`}
                      >
                        {/* Visual rendering of each component type */}
                        {comp.type === 'say' && (
                          <div className={`text-[11px] text-neutral-800 leading-tight truncate ${comp.bold ? 'font-bold' : ''}`}>
                            {comp.prompt}
                          </div>
                        )}
                        {comp.type === 'get' && (
                          <input
                            type="text"
                            value={comp.defaultValue || ''}
                            readOnly
                            className="w-full h-full bg-white border border-neutral-400 rounded-sm px-1.5 text-[11px] text-neutral-800 font-mono pointer-events-none shadow-inner"
                          />
                        )}
                        {comp.type === 'button' && (
                          <div className="w-full h-full bg-neutral-100 hover:bg-neutral-50 border border-neutral-400 rounded flex items-center justify-center text-[11px] font-semibold text-neutral-700 shadow-sm">
                            {comp.prompt}
                          </div>
                        )}
                        {comp.type === 'combobox' && (
                          <div className="w-full h-full bg-white border border-neutral-400 rounded-sm flex items-center justify-between px-1.5 text-[11px] text-neutral-700">
                            <span className="truncate">{(comp.items || [])[0] || 'Selecione'}</span>
                            <ChevronDown className="w-3 h-3 text-neutral-500 shrink-0" />
                          </div>
                        )}
                        {comp.type === 'checkbox' && (
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-700">
                            <div className={`w-3.5 h-3.5 border border-neutral-400 rounded-sm ${comp.checked ? 'bg-blue-600' : 'bg-white'}`}></div>
                            <span className="truncate">{comp.prompt}</span>
                          </div>
                        )}
                        {comp.type === 'radio' && (
                          <div className="space-y-1 text-[10px] text-neutral-700 p-1 border border-dashed border-neutral-300 rounded">
                            {(comp.items || []).map((item, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <div className={`w-3 h-3 rounded-full border ${i === 0 ? 'border-blue-600 bg-blue-600' : 'border-neutral-400 bg-white'}`}></div>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {comp.type === 'panel' && (
                          <div className="w-full h-full border-2 border-neutral-300 rounded bg-neutral-100/50 flex items-start p-1">
                            <span className="text-[9px] text-neutral-400 font-semibold">{comp.prompt || 'Panel'}</span>
                          </div>
                        )}
                        {comp.type === 'listbox' && (
                          <div className="w-full h-full bg-white border border-neutral-400 rounded-sm overflow-hidden text-[10px] text-neutral-700">
                            {(comp.items || []).slice(0, 4).map((item, i) => (
                              <div key={i} className={`px-1.5 py-0.5 ${i === 0 ? 'bg-blue-100' : ''} border-b border-neutral-200`}>{item}</div>
                            ))}
                          </div>
                        )}
                        {comp.type === 'multiget' && (
                          <div className="w-full h-full bg-white border border-neutral-400 rounded-sm p-1 text-[10px] text-neutral-500 font-mono">
                            Área de texto...
                          </div>
                        )}
                        {comp.type === 'bitmap' && (
                          <div className="w-full h-full bg-neutral-300 border border-neutral-400 rounded flex items-center justify-center text-[10px] text-neutral-500">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                        {comp.type === 'meter' && (
                          <div className="w-full h-full bg-neutral-300 border border-neutral-400 rounded overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${parseInt(comp.defaultValue || '50')}%` }}></div>
                          </div>
                        )}
                        {comp.type === 'folder' && (
                          <div className="w-full h-full border border-neutral-400 rounded overflow-hidden bg-white">
                            <div className="flex border-b border-neutral-300 bg-neutral-100">
                              {(comp.items || []).map((tab, i) => (
                                <div key={i} className={`px-2 py-0.5 text-[9px] border-r border-neutral-300 ${i === 0 ? 'bg-white font-bold' : 'text-neutral-500'}`}>{tab}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resize handle */}
                        {selectedComponent === comp.id && (
                          <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-cyan-500 rounded-sm cursor-se-resize opacity-80"></div>
                        )}
                      </div>
                    ))}

                    {/* Render for MsNewGetDados */}
                    {config.dialogType === 'msnewgetdados' && (
                      <div className="absolute inset-2 flex flex-col">
                        <div className="flex-1 border border-neutral-400 rounded overflow-hidden bg-white">
                          {/* Grid Header */}
                          <div className="flex bg-neutral-200 border-b border-neutral-300">
                            {(config.gridColumns || []).map(col => (
                              <div key={col.id} className="px-2 py-1 text-[10px] font-bold text-neutral-700 border-r border-neutral-300 truncate" style={{ width: `${col.width}px` }}>
                                {col.title}
                              </div>
                            ))}
                          </div>
                          {/* Grid Rows (sample) */}
                          {[1, 2, 3, 4, 5].map(row => (
                            <div key={row} className="flex border-b border-neutral-200 hover:bg-blue-50">
                              {(config.gridColumns || []).map(col => (
                                <div key={col.id} className="px-2 py-0.5 text-[10px] text-neutral-600 border-r border-neutral-200 truncate" style={{ width: `${col.width}px` }}>
                                  {col.type === 'Numeric' ? (row * 100).toFixed(2) : col.type === 'Date' ? '01/01/2026' : `Dado ${row}`}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <div className="px-4 py-1 bg-neutral-100 border border-neutral-400 rounded text-[11px] font-semibold text-neutral-700">Confirmar</div>
                          <div className="px-4 py-1 bg-neutral-200 border border-neutral-400 rounded text-[11px] text-neutral-600">Cancelar</div>
                        </div>
                      </div>
                    )}

                    {/* Render for MSMGet (Enchoice) */}
                    {config.dialogType === 'msmget' && (
                      <div className="absolute inset-2 flex flex-col">
                        <div className="flex-1 border border-neutral-400 rounded overflow-hidden bg-white p-3 space-y-2">
                          {(config.msmgetFields || []).map((field, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-neutral-700 w-20 text-right">{field}:</span>
                              <div className="flex-1 h-5 bg-white border border-neutral-400 rounded-sm"></div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <div className="px-4 py-1 bg-neutral-100 border border-neutral-400 rounded text-[11px] font-semibold text-neutral-700">Confirmar</div>
                          <div className="px-4 py-1 bg-neutral-200 border border-neutral-400 rounded text-[11px] text-neutral-600">Cancelar</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Component List */}
              {(config.dialogType === 'msdialog' || config.dialogType === 'tdialog' || config.dialogType === 'fwdialogmodal') && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-[150px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Componentes ({config.components.length})
                    </span>
                    <button onClick={() => setConfig(prev => ({ ...prev, components: [] }))}
                      className="text-[10px] text-slate-500 hover:text-red-400 cursor-pointer">
                      Limpar Todos
                    </button>
                  </div>
                  <div className="space-y-1">
                    {config.components.map((comp, idx) => (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedComponent(comp.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] cursor-pointer transition-all ${
                          selectedComponent === comp.id
                            ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30'
                            : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        <GripVertical className="w-3 h-3 text-slate-600" />
                        {COMP_ICONS[comp.type]}
                        <span className="flex-1 truncate font-mono">
                          {COMPONENT_TYPE_INFO[comp.type].advplClass}
                          {comp.varName ? ` → ${comp.varName}` : comp.prompt ? ` "${comp.prompt}"` : ''}
                        </span>
                        <span className="text-[9px] text-slate-600">@{comp.y},{comp.x}</span>
                        <button onClick={e => { e.stopPropagation(); removeComponent(comp.id); }}
                          className="text-slate-600 hover:text-red-400 p-0.5 cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CODE TAB */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-mono text-slate-300">U_{config.functionName.toUpperCase()}.PRW</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyToClipboard}
                    className="flex items-center gap-1 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold rounded text-slate-200 transition-all cursor-pointer">
                    {copied ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copiado!</span></>
                      : <><Copy className="w-3 h-3" /><span>Copiar</span></>}
                  </button>
                  <button onClick={downloadCode}
                    className="flex items-center gap-1 py-1 px-2.5 bg-cyan-600 hover:bg-cyan-500 text-[11px] font-bold rounded text-white transition-all cursor-pointer">
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed bg-slate-950/80 text-slate-300 select-text min-h-[400px]">
                <pre className="whitespace-pre-wrap sm:whitespace-pre">
                  <code>{highlightADVPL(generatedCode)}</code>
                </pre>
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs">
                <div className="flex gap-2 text-slate-400">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p>
                    Salve como <code className="bg-slate-800 px-1 rounded text-slate-200">U_{config.functionName.toUpperCase()}.PRW</code>, compile no TDS/VS Code e chame via <code className="bg-slate-800 px-1 rounded text-slate-200">U_{config.functionName}()</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Console Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden max-h-[140px]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Console</span>
              </div>
              <button onClick={() => setLogs([])}
                className="text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer">Limpar</button>
            </div>
            <div className="p-2 overflow-y-auto font-mono text-[10px] text-slate-400 flex flex-col-reverse">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic text-center py-2">Interaja com o designer para gerar logs.</div>
              ) : logs.map(log => (
                <div key={log.id} className="flex gap-2 py-0.5">
                  <span className="text-slate-600">{log.timestamp}</span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'code' ? 'text-purple-400' : 'text-slate-400'
                  }>
                    {log.type === 'success' ? '✔' : log.type === 'warning' ? '⚠' : '▶'} {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-2.5 px-4 text-center text-[10px] text-slate-500">
        <span>Simulador de Interfaces ADVPL © 2026 • Compatível com Protheus 12+ / TOTVS Application Server / TDS / VS Code</span>
      </footer>
    </div>
  );
}
