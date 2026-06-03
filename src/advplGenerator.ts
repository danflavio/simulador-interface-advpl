// ============================================================================
// ADVPL Code Generator - Gera código fonte .PRW a partir da configuração
// Suporta: MsDialog, TDialog, FWDialogModal, MsNewGetDados, MSMGet
// ============================================================================

import { InterfaceConfig, ComponentConfig, DialogType, GridColumn } from './types';

export function generateADVPLCode(config: InterfaceConfig): string {
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const funcName = config.functionName || 'MinhaJanela';
  
  let code = `/*
================================================================================
* Programa:   U_${funcName.toUpperCase()}.PRW
* Descrição:  ${config.description || 'Interface gerada pelo Simulador ADVPL'}
* Data:       ${dateStr}
* Tipo:       ${getDialogTypeName(config.dialogType)}
================================================================================
*/
#Include 'Protheus.ch'
`;

  switch (config.dialogType) {
    case 'msdialog':
      code += generateMsDialog(config);
      break;
    case 'tdialog':
      code += generateTDialog(config);
      break;
    case 'fwdialogmodal':
      code += generateFWDialogModal(config);
      break;
    case 'msnewgetdados':
      code += generateMsNewGetDados(config);
      break;
    case 'msmget':
      code += generateMSMGet(config);
      break;
  }

  return code;
}

function getDialogTypeName(type: DialogType): string {
  const names: Record<DialogType, string> = {
    msdialog: 'MsDialog (Diálogo Clássico)',
    tdialog: 'TDialog (Diálogo Avançado)',
    fwdialogmodal: 'FWDialogModal (Modal Framework)',
    msnewgetdados: 'MsNewGetDados (Grid/Browse)',
    msmget: 'MSMGet (Enchoice)',
  };
  return names[type];
}

function getVarInit(comp: ComponentConfig): string {
  if (!comp.varName) return '';
  switch (comp.varType) {
    case 'Character':
      if (comp.defaultValue) {
        return `PADR("${comp.defaultValue}", ${comp.charLength || 20})`;
      }
      return `Space(${comp.charLength || 20})`;
    case 'Numeric':
      const num = parseFloat(comp.defaultValue || '0') || 0;
      return num.toFixed(comp.numericDecimals || 0);
    case 'Date':
      if (comp.defaultValue) return `CToD("${comp.defaultValue}")`;
      return `Date()`;
    case 'Logical':
      return comp.checked ? '.T.' : '.F.';
    default:
      return `""`;
  }
}

function generateVariableDeclarations(components: ComponentConfig[]): string {
  let lines: string[] = [];
  const declared = new Set<string>();
  
  components.forEach((comp, idx) => {
    // Object variable
    const objName = getObjectName(comp, idx);
    lines.push(`    Local ${objName}`);
    
    // Data variable
    if (comp.varName && !declared.has(comp.varName)) {
      declared.add(comp.varName);
      const init = getVarInit(comp);
      lines.push(`    Local ${comp.varName} := ${init}`);
    }
    
    // Array for combo/listbox items
    if ((comp.type === 'combobox' || comp.type === 'listbox') && comp.items && comp.items.length > 0) {
      const arrName = `a${comp.varName?.substring(1) || 'Items' + idx}`;
      if (!declared.has(arrName)) {
        declared.add(arrName);
        const itemsStr = comp.items.map(i => `"${i}"`).join(', ');
        lines.push(`    Local ${arrName} := {${itemsStr}}`);
      }
    }
  });
  
  return lines.join('\n');
}

function getObjectName(comp: ComponentConfig, idx: number): string {
  const prefixes: Record<string, string> = {
    say: 'oSay',
    get: 'oGet',
    button: 'oBtn',
    combobox: 'oCbx',
    checkbox: 'oChk',
    radio: 'oRad',
    panel: 'oPnl',
    listbox: 'oLbx',
    multiget: 'oMGet',
    bitmap: 'oBmp',
    meter: 'oMtr',
    folder: 'oFld',
  };
  return `${prefixes[comp.type] || 'oObj'}${idx + 1}`;
}

function generateComponentCode(comp: ComponentConfig, idx: number, dialogVar: string): string {
  const objName = getObjectName(comp, idx);
  const row = Math.round(comp.y);
  const col = Math.round(comp.x);
  const pixel = 'Pixel';
  
  switch (comp.type) {
    case 'say':
      return `    // Label: ${comp.prompt || 'Texto'}
    @ ${row}, ${col} Say ${objName} ;
        Prompt "${comp.prompt || 'Texto'}" ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'get':
      return `    // Campo de entrada: ${comp.varName}
    @ ${row}, ${col} MsGet ${objName} ;
        Var ${comp.varName} ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'button':
      return `    // Botão: ${comp.prompt}
    @ ${row}, ${col} Button ${objName} ;
        Prompt "${comp.prompt || 'Botão'}" ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        Action ( ${comp.action || 'MsgInfo("Clique!")'} ) ;
        ${pixel}
`;
    
    case 'combobox': {
      const arrName = `a${comp.varName?.substring(1) || 'Items' + idx}`;
      return `    // ComboBox: ${comp.varName}
    @ ${row}, ${col} ComboBox ${objName} ;
        Var ${comp.varName} ;
        Items ${arrName} ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    }
    
    case 'checkbox':
      return `    // CheckBox: ${comp.varName}
    @ ${row}, ${col} CheckBox ${objName} ;
        Var ${comp.varName} ;
        Prompt "${comp.prompt || 'Opção'}" ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'radio': {
      const items = (comp.items || ['Opção 1', 'Opção 2']).map(i => `"${i}"`).join(', ');
      return `    // RadioMenu: ${comp.varName}
    @ ${row}, ${col} Radio ${objName} ;
        Var ${comp.varName} ;
        Items {${items}} ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    }
    
    case 'panel':
      return `    // Painel agrupador
    @ ${row}, ${col} To ${row + comp.height}, ${col + comp.width} ;
        ${objName} Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'listbox': {
      const arrName = `a${comp.varName?.substring(1) || 'Items' + idx}`;
      return `    // ListBox: ${comp.varName}
    @ ${row}, ${col} ListBox ${objName} ;
        Var ${comp.varName} ;
        Items ${arrName} ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    }
    
    case 'multiget':
      return `    // MultiGet (memo): ${comp.varName}
    @ ${row}, ${col} MsMGet ${objName} ;
        Var ${comp.varName} ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'bitmap':
      return `    // Imagem Bitmap
    @ ${row}, ${col} Bitmap ${objName} ;
        File "${comp.prompt || 'logo.bmp'}" ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'meter':
      return `    // Barra de Progresso (Meter)
    @ ${row}, ${col} Meter ${objName} ;
        Var ${comp.varName} ;
        Total 100 ;
        Size ${comp.width}, ${comp.height} ;
        Of ${dialogVar} ;
        ${pixel}
`;
    
    case 'folder': {
      const items = (comp.items || ['Aba 1', 'Aba 2']).map(i => `"${i}"`).join(', ');
      return `    // Folder (Abas)
    ${objName} := TFolder():New(${row}, ${col}, {${items}}, {${(comp.items || ['Aba1', 'Aba2']).map((_, i) => `"aba${i+1}"`).join(', ')}}, ${dialogVar}, , , , .T., , ${comp.width}, ${comp.height})
`;
    }
    
    default:
      return '';
  }
}

// ===================== MsDialog =====================
function generateMsDialog(config: InterfaceConfig): string {
  const funcName = config.functionName || 'MinhaJanela';
  const mt = config.marginTop || 32;
  const ml = config.marginLeft || 24;
  const gap = config.gapLinhas || 24;
  const varName = config.mainVarName || 'cNovoVal';
  const varType = config.mainVarType || 'Character';
  const varLen = config.mainVarLength || 20;
  const varDec = config.mainVarDecimals || 2;
  const varDefault = config.mainVarDefault || '';
  const hasSay = !!config.sayInstructions;
  const hasLabel = !!config.labelPrompt;

  // Variable initialization
  let initValue = '';
  if (varType === 'Character') {
    initValue = varDefault ? `PADR("${varDefault.substring(0, varLen)}", ${varLen})` : `Space(${varLen})`;
  } else if (varType === 'Numeric') {
    const num = parseFloat(varDefault) || 0;
    initValue = num.toFixed(varDec);
  } else if (varType === 'Date') {
    initValue = varDefault ? `CToD("${varDefault}")` : `Date()`;
  } else if (varType === 'Logical') {
    initValue = '.F.';
  }

  // Calculate positions based on margins and gap
  const sayRow = mt;
  const sayCol = ml;
  const sayWidth = config.windowWidth - (ml * 2);
  const sayHeight = hasSay ? 24 : 0;

  const labelRow = hasSay ? mt + sayHeight + gap : mt;
  const labelCol = ml;
  const labelWidth = 65;

  const getRow = labelRow - 2;
  const getCol = ml + labelWidth + 8;
  const getWidth = Math.min(180, config.windowWidth - getCol - ml);
  const getHeight = 11;

  const btnRow = Math.round(config.windowHeight * 0.72);
  const btnWidth = 55;
  const btnHeight = 15;
  const totalBtnsWidth = btnWidth * 2 + 15;
  const btnOkCol = Math.max(ml, Math.round((config.windowWidth - totalBtnsWidth) / 2));
  const btnCancelCol = btnOkCol + btnWidth + 15;

  const actionText = config.confirmAction || `MsgInfo("Valor: " + cValToChar(${varName}), "Sucesso")`;

  // Also generate component-based code if components exist
  const hasAdvancedComponents = config.components.length > 0;
  let advancedCode = '';
  let advancedVars = '';
  if (hasAdvancedComponents) {
    advancedVars = generateVariableDeclarations(config.components);
    config.components.forEach((comp, idx) => {
      advancedCode += generateComponentCode(comp, idx, 'oDlg');
    });
  }

  return `
User Function ${funcName}()
    Local oDlg
    Local oSayVal, oGetVal
    Local oBtnOk, oBtnCancel
    ${hasSay ? 'Local oSayDesc' : ''}
    Local ${varName} := ${initValue}
${advancedVars}

    // Define o Diálogo principal (MsDialog)
    // Coordenadas: From ${0}, ${0} To ${config.windowHeight}, ${config.windowWidth}
    // Margens: Top=${mt}, Left=${ml}, Gap entre linhas=${gap}
    Define MsDialog oDlg ;
        Title "${config.windowTitle}" ;
        From 0, 0 To ${config.windowHeight}, ${config.windowWidth} ;
        ${config.pixelScale ? 'Pixel' : ''}

${hasSay ? `    // Texto descritivo / Instrução
    @ ${sayRow}, ${sayCol} Say oSayDesc ;
        Prompt "${config.sayInstructions}" ;
        Size ${sayWidth}, ${sayHeight} ;
        Of oDlg ;
        ${config.pixelScale ? 'Pixel' : ''}
` : ''}
${hasLabel ? `    // Label do campo principal
    @ ${labelRow}, ${labelCol} Say oSayVal ;
        Prompt "${config.labelPrompt}" ;
        Size ${labelWidth}, 10 ;
        Of oDlg ;
        ${config.pixelScale ? 'Pixel' : ''}
` : ''}
    // Campo de digitação (Get) - Variável: ${varName} (${varType}, Tam: ${varLen})
    @ ${getRow}, ${getCol} MsGet oGetVal ;
        Var ${varName} ;
        Size ${getWidth}, ${getHeight} ;
        Of oDlg ;
        ${config.pixelScale ? 'Pixel' : ''}

${advancedCode}    // Botão Confirmar
    @ ${btnRow}, ${btnOkCol} Button oBtnOk ;
        Prompt "Confirmar" ;
        Size ${btnWidth}, ${btnHeight} ;
        Of oDlg ;
        Action ( ${actionText}, oDlg:End() ) ;
        ${config.pixelScale ? 'Pixel' : ''}

    // Botão Cancelar
    @ ${btnRow}, ${btnCancelCol} Button oBtnCancel ;
        Prompt "Cancelar" ;
        Size ${btnWidth}, ${btnHeight} ;
        Of oDlg ;
        Action ( oDlg:End() ) ;
        ${config.pixelScale ? 'Pixel' : ''}

    // Ativa o Diálogo${config.centered ? ' Centralizado' : ''}
    Activate MsDialog oDlg ${config.centered ? 'Centered' : ''}

Return ${varName}
`;
}

// ===================== TDialog =====================
function generateTDialog(config: InterfaceConfig): string {
  const funcName = config.functionName || 'MinhaJanela';
  const mt = config.marginTop || 32;
  const ml = config.marginLeft || 24;
  const gap = config.gapLinhas || 24;
  const varName = config.mainVarName || 'cNovoVal';
  const varType = config.mainVarType || 'Character';
  const varLen = config.mainVarLength || 20;
  const varDec = config.mainVarDecimals || 2;
  const varDefault = config.mainVarDefault || '';
  const hasSay = !!config.sayInstructions;

  let initValue = '';
  if (varType === 'Character') {
    initValue = varDefault ? `PADR("${varDefault.substring(0, varLen)}", ${varLen})` : `Space(${varLen})`;
  } else if (varType === 'Numeric') {
    const num = parseFloat(varDefault) || 0;
    initValue = num.toFixed(varDec);
  } else if (varType === 'Date') {
    initValue = varDefault ? `CToD("${varDefault}")` : `Date()`;
  } else {
    initValue = '.F.';
  }

  const sayRow = mt;
  const labelRow = hasSay ? mt + 24 + gap : mt;
  const getRow = labelRow - 2;
  const getCol = ml + 70;
  const getWidth = Math.min(180, config.windowWidth - getCol - ml);
  const btnRow = Math.round(config.windowHeight * 0.72);
  const btnOkCol = Math.round((config.windowWidth - 125) / 2);

  const varDecls = generateVariableDeclarations(config.components);
  let componentsCode = '';
  config.components.forEach((comp, idx) => {
    componentsCode += generateComponentCode(comp, idx, 'oDlg');
  });

  const actionText = config.confirmAction || `MsgInfo("OK!")`;

  return `
User Function ${funcName}()
    Local oDlg
    Local oSayVal, oGetVal, oBtnOk, oBtnCancel
    ${hasSay ? 'Local oSayDesc' : ''}
    Local ${varName} := ${initValue}
${varDecls}

    // Cria o TDialog (coordenadas e margens: Top=${mt}, Left=${ml}, Gap=${gap})
    oDlg := TDialog():New(0, 0, ${config.windowHeight}, ${config.windowWidth}, "${config.windowTitle}", , , , , CLR_BLACK, CLR_WHITE, , .T.)

${hasSay ? `    // Texto descritivo
    @ ${sayRow}, ${ml} Say oSayDesc Prompt "${config.sayInstructions}" Size ${config.windowWidth - ml * 2}, 24 Of oDlg ${config.pixelScale ? 'Pixel' : ''}
` : ''}
    // Label + Get
    @ ${labelRow}, ${ml} Say oSayVal Prompt "${config.labelPrompt}" Size 65, 10 Of oDlg ${config.pixelScale ? 'Pixel' : ''}
    @ ${getRow}, ${getCol} MsGet oGetVal Var ${varName} Size ${getWidth}, 11 Of oDlg ${config.pixelScale ? 'Pixel' : ''}

${componentsCode}    // Botões
    @ ${btnRow}, ${btnOkCol} Button oBtnOk Prompt "Confirmar" Size 55, 15 Of oDlg Action ( ${actionText}, oDlg:End() ) ${config.pixelScale ? 'Pixel' : ''}
    @ ${btnRow}, ${btnOkCol + 70} Button oBtnCancel Prompt "Cancelar" Size 55, 15 Of oDlg Action ( oDlg:End() ) ${config.pixelScale ? 'Pixel' : ''}

    // Ativa
    oDlg:lCentered := ${config.centered ? '.T.' : '.F.'}
    oDlg:Activate(, , , .T.)

Return ${varName}
`;
}

// ===================== FWDialogModal =====================
function generateFWDialogModal(config: InterfaceConfig): string {
  const funcName = config.functionName || 'MinhaJanela';
  const varDecls = generateVariableDeclarations(config.components);
  
  let componentsCode = '';
  config.components.forEach((comp, idx) => {
    componentsCode += generateComponentCode(comp, idx, 'oPanel');
  });

  return `
#Include 'FWMVCDef.ch'

User Function ${funcName}()
    Local oDlg
    Local oPanel
${varDecls}

    // Cria a Modal do Framework (FWDialogModal)
    oDlg := FWDialogModal():New()
    oDlg:SetTitle("${config.windowTitle}")
    oDlg:SetSize(${config.windowHeight}, ${config.windowWidth})
    oDlg:EnableFormBar(${config.fwEnableFormBar !== false ? '.T.' : '.F.'})
    oDlg:CreateDialog()

    // Painel de conteúdo
    oPanel := oDlg:GetPanelMain()

${componentsCode}
    // Ativa o Dialog Modal
    oDlg:Activate()

Return Nil
`;
}

// ===================== MsNewGetDados (Grid) =====================
function generateMsNewGetDados(config: InterfaceConfig): string {
  const funcName = config.functionName || 'MinhaGrid';
  const columns = config.gridColumns || [
    { id: '1', field: 'CAMPO1', title: 'Campo 1', width: 100, type: 'Character' as const, editable: true },
    { id: '2', field: 'CAMPO2', title: 'Campo 2', width: 80, type: 'Numeric' as const, editable: true },
  ];
  
  const alias = config.gridAlias || 'TRB';
  
  // Generate header and columns definition
  const headerArr = columns.map(c => `"${c.title}"`).join(', ');
  const colSizeArr = columns.map(c => c.width.toString()).join(', ');
  const fieldsArr = columns.map(c => `"${alias}->${c.field}"`).join(', ');

  return `
User Function ${funcName}()
    Local oDlg
    Local oGrid
    Local aHeader   := {}
    Local aCols     := {}
    Local aFields   := {}

    // Definição dos cabeçalhos da Grid
    aHeader := { ${headerArr} }

    // Definição das larguras das colunas
    // Cada elemento: {título, campo, picture, tamanho, decimais, valid, usado, tipo, F3}
${columns.map((c, i) => {
    const tipo = c.type === 'Numeric' ? 'N' : c.type === 'Date' ? 'D' : 'C';
    const pic = c.type === 'Numeric' ? '@E 999,999.99' : c.type === 'Date' ? '99/99/9999' : '@!';
    const tam = c.type === 'Numeric' ? '12' : c.type === 'Date' ? '8' : '20';
    const dec = c.type === 'Numeric' ? '2' : '0';
    return `    aAdd(aHeader, {"${c.title}", "${alias}_${c.field}", "${pic}", ${tam}, ${dec}, ".T.", "${c.editable ? 'S' : 'N'}", "${tipo}", ""})`;
  }).join('\n')}

    // Define o Diálogo que contém a Grid
    Define MsDialog oDlg ;
        Title "${config.windowTitle}" ;
        From 0, 0 To ${config.windowHeight}, ${config.windowWidth} ;
        Pixel

    // Cria a Grid (MsNewGetDados)
    oGrid := MsNewGetDados():New( ;
        5, 5, ${config.windowHeight - 40}, ${config.windowWidth - 10}, ;
        GD_INSERT + GD_DELETE + GD_UPDATE, ;
        "AllwaysTrue()", ;
        "AllwaysTrue()", ;
        "", ;
        , ;
        99, ;
        , ;
        , ;
        oDlg )

    oGrid:SetArray(aCols)

    // Botões de ação
    @ ${config.windowHeight - 30}, ${Math.round(config.windowWidth / 2) - 60} Button oBtnOk ;
        Prompt "Confirmar" ;
        Size 55, 15 ;
        Of oDlg ;
        Action ( oDlg:End() ) ;
        Pixel

    @ ${config.windowHeight - 30}, ${Math.round(config.windowWidth / 2) + 10} Button oBtnCancel ;
        Prompt "Cancelar" ;
        Size 55, 15 ;
        Of oDlg ;
        Action ( oDlg:End() ) ;
        Pixel

    // Ativa o Diálogo Centralizado
    Activate MsDialog oDlg Centered

Return Nil

Static Function AllwaysTrue()
Return .T.
`;
}

// ===================== MSMGet (Enchoice) =====================
function generateMSMGet(config: InterfaceConfig): string {
  const funcName = config.functionName || 'MeuCadastro';
  const alias = config.msmgetAlias || 'SA1';
  const fields = config.msmgetFields || ['A1_COD', 'A1_LOJA', 'A1_NOME', 'A1_END', 'A1_MUN', 'A1_EST'];

  return `
User Function ${funcName}()
    Local oDlg
    Local oMsGet
    Local aArea   := GetArea()
    Local aCpoEnch := {}
    
    // Campos que aparecerão no formulário (do SX3)
${fields.map(f => `    aAdd(aCpoEnch, {"${f}", , , , })`).join('\n')}

    // Define o Diálogo
    Define MsDialog oDlg ;
        Title "${config.windowTitle}" ;
        From 0, 0 To ${config.windowHeight}, ${config.windowWidth} ;
        Pixel

    // Cria o MSMGet (Enchoice) - formulário padrão Protheus
    oMsGet := MSMGet():New( ;
        "${alias}", ;
        (Alias())->(RecNo()), ;
        , ;
        , ;
        aCpoEnch, ;
        , ;
        , ;
        , ;
        , ;
        oDlg, ;
        5, 5, ${config.windowHeight - 40}, ${config.windowWidth - 10})

    // Botões padrão
    @ ${config.windowHeight - 30}, ${Math.round(config.windowWidth / 2) - 60} Button oBtnOk ;
        Prompt "Confirmar" ;
        Size 55, 15 ;
        Of oDlg ;
        Action ( oDlg:End() ) ;
        Pixel

    @ ${config.windowHeight - 30}, ${Math.round(config.windowWidth / 2) + 10} Button oBtnCancel ;
        Prompt "Cancelar" ;
        Size 55, 15 ;
        Of oDlg ;
        Action ( oDlg:End() ) ;
        Pixel

    // Ativa o Diálogo Centralizado
    Activate MsDialog oDlg Centered

    RestArea(aArea)
Return Nil
`;
}
