// ============================================================================
// ADVPL Interface Builder - Types
// Suporta múltiplas classes visuais do Protheus/ADVPL
// ============================================================================

export type ComponentType = 
  | 'say'        // TSay / @ Say - Label estático
  | 'get'        // TGet / MsGet - Campo de entrada
  | 'button'     // TButton / @ Button
  | 'combobox'   // TComboBox
  | 'checkbox'   // TCheckBox
  | 'radio'      // TRadioMenu
  | 'panel'      // TPanel / @ Panel
  | 'listbox'    // TListBox
  | 'multiget'   // TMultiGet - Área de texto multilinha
  | 'bitmap'     // TBitmap - Imagem
  | 'meter'      // TMeter - Barra de progresso
  | 'folder'     // TFolder - Abas

export type DialogType = 
  | 'msdialog'         // MsDialog - Diálogo clássico
  | 'tdialog'          // TDialog - Diálogo avançado
  | 'fwdialogmodal'    // FWDialogModal - Modal moderna do Framework
  | 'msnewgetdados'    // MsNewGetDados - Grid editável (Browse)
  | 'msmget'           // MSMGet - Formulário com enchoice

export type VariableType = 'Character' | 'Numeric' | 'Date' | 'Logical';

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  label: string;
  // Posição e dimensão (em pixels no canvas)
  x: number;
  y: number;
  width: number;
  height: number;
  // Propriedades específicas
  varName?: string;
  varType?: VariableType;
  prompt?: string;
  action?: string;
  defaultValue?: string;
  charLength?: number;
  numericDecimals?: number;
  items?: string[]; // Para ComboBox, Radio, ListBox
  checked?: boolean; // Para CheckBox
  fontSize?: number;
  bold?: boolean;
  enabled?: boolean;
  visible?: boolean;
}

export interface InterfaceConfig {
  // Tipo de interface
  dialogType: DialogType;
  // Propriedades da janela
  windowTitle: string;
  windowWidth: number;
  windowHeight: number;
  pixelScale: boolean;
  centered: boolean;
  // Medidas e coordenadas ADVPL
  marginTop: number;
  marginLeft: number;
  gapLinhas: number;
  // Propriedades específicas (para MsDialog simples / input único)
  sayInstructions: string;       // Texto do Say descritivo (instrução)
  labelPrompt: string;           // Prompt do label junto ao Get
  mainVarName: string;           // Nome da variável principal
  mainVarType: VariableType;     // Tipo da variável principal
  mainVarDefault: string;        // Valor inicial da variável
  mainVarLength: number;         // Comprimento/tamanho
  mainVarDecimals: number;       // Casas decimais (para Numeric)
  confirmAction: string;         // Ação do botão confirmar
  // Componentes (modo designer avançado)
  components: ComponentConfig[];
  // Para MsNewGetDados
  gridColumns?: GridColumn[];
  gridAlias?: string;
  // Para MSMGet
  msmgetAlias?: string;
  msmgetFields?: string[];
  // Para FWDialogModal
  fwEnableFormBar?: boolean;
  fwCloseOnOk?: boolean;
  // Customizações
  functionName: string;
  description: string;
}

export interface GridColumn {
  id: string;
  field: string;
  title: string;
  width: number;
  type: VariableType;
  editable: boolean;
  picture?: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'code';
  message: string;
}

// Presets de componentes para facilitar inserção
export const COMPONENT_DEFAULTS: Record<ComponentType, Partial<ComponentConfig>> = {
  say: {
    width: 120,
    height: 20,
    prompt: 'Texto:',
    fontSize: 12,
    bold: false,
  },
  get: {
    width: 150,
    height: 22,
    varName: 'cCampo',
    varType: 'Character',
    charLength: 20,
    defaultValue: '',
  },
  button: {
    width: 90,
    height: 28,
    prompt: 'Clique',
    action: 'MsgInfo("Ação executada!")',
  },
  combobox: {
    width: 150,
    height: 22,
    varName: 'nOpcao',
    varType: 'Numeric',
    items: ['Opção 1', 'Opção 2', 'Opção 3'],
    defaultValue: '1',
  },
  checkbox: {
    width: 140,
    height: 20,
    varName: 'lCheck',
    varType: 'Logical',
    prompt: 'Ativo',
    checked: false,
  },
  radio: {
    width: 160,
    height: 80,
    varName: 'nRadio',
    varType: 'Numeric',
    items: ['Opção A', 'Opção B', 'Opção C'],
    defaultValue: '1',
  },
  panel: {
    width: 200,
    height: 100,
    prompt: 'Painel',
  },
  listbox: {
    width: 160,
    height: 100,
    varName: 'nItem',
    varType: 'Numeric',
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
    defaultValue: '1',
  },
  multiget: {
    width: 200,
    height: 80,
    varName: 'cTexto',
    varType: 'Character',
    charLength: 500,
    defaultValue: '',
  },
  bitmap: {
    width: 80,
    height: 80,
    prompt: 'logo.bmp',
  },
  meter: {
    width: 200,
    height: 20,
    varName: 'nProgresso',
    varType: 'Numeric',
    defaultValue: '50',
  },
  folder: {
    width: 300,
    height: 150,
    items: ['Aba 1', 'Aba 2', 'Aba 3'],
  },
};

export const DIALOG_TYPE_INFO: Record<DialogType, { name: string; description: string; icon: string }> = {
  msdialog: {
    name: 'MsDialog',
    description: 'Diálogo clássico do Protheus. Uso geral para inputs simples e formulários.',
    icon: '🪟',
  },
  tdialog: {
    name: 'TDialog',
    description: 'Diálogo avançado com mais controle sobre eventos e comportamento.',
    icon: '🖥️',
  },
  fwdialogmodal: {
    name: 'FWDialogModal',
    description: 'Modal do Framework moderno. Padrão para novas customizações no Protheus 12+.',
    icon: '📋',
  },
  msnewgetdados: {
    name: 'MsNewGetDados',
    description: 'Grid editável (Browse) para edição em lote. Padrão para rotinas tipo 3.',
    icon: '📊',
  },
  msmget: {
    name: 'MSMGet (Enchoice)',
    description: 'Formulário padrão de cadastro com campos vinculados ao dicionário (SX3).',
    icon: '📝',
  },
};

export const COMPONENT_TYPE_INFO: Record<ComponentType, { name: string; advplClass: string; description: string }> = {
  say: { name: 'Say (Label)', advplClass: 'TSay', description: 'Texto estático exibido na tela' },
  get: { name: 'Get (Input)', advplClass: 'TGet / MsGet', description: 'Campo de entrada de dados' },
  button: { name: 'Button', advplClass: 'TButton', description: 'Botão de ação' },
  combobox: { name: 'ComboBox', advplClass: 'TComboBox', description: 'Lista suspensa de opções' },
  checkbox: { name: 'CheckBox', advplClass: 'TCheckBox', description: 'Caixa de seleção (Sim/Não)' },
  radio: { name: 'Radio', advplClass: 'TRadioMenu', description: 'Grupo de opções exclusivas' },
  panel: { name: 'Panel', advplClass: 'TPanel', description: 'Painel agrupador de componentes' },
  listbox: { name: 'ListBox', advplClass: 'TListBox', description: 'Lista de itens selecionáveis' },
  multiget: { name: 'MultiGet', advplClass: 'TMultiGet', description: 'Área de texto multilinha (Memo)' },
  bitmap: { name: 'Bitmap', advplClass: 'TBitmap', description: 'Exibição de imagem BMP' },
  meter: { name: 'Meter', advplClass: 'TMeter', description: 'Barra de progresso' },
  folder: { name: 'Folder (Abas)', advplClass: 'TFolder', description: 'Controle de abas para organizar conteúdo' },
};
