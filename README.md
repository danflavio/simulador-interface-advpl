## 📋 Sobre o Projeto

O **Simulador de Interfaces ADVPL** é uma ferramenta web interativa para construção visual de interfaces do ERP Protheus (TOTVS). Permite arrastar e soltar componentes visuais em um canvas, configurar propriedades e gerar automaticamente o código-fonte `.PRW` pronto para compilar no Protheus.

Ideal para desenvolvedores ADVPL que desejam prototipar telas rapidamente sem escrever código manualmente.

---

## ✨ Funcionalidades

### 🎨 Designer Visual (Drag & Drop)
- Canvas interativo para posicionar componentes
- Arrastar componentes da paleta diretamente para a tela
- Redimensionar e mover elementos com o mouse
- Preview em tempo real da interface

### 🧩 Componentes Suportados
| Componente | Classe ADVPL | Descrição |
|---|---|---|
| Say (Label) | `TSay` | Texto estático |
| Get (Input) | `TGet / MsGet` | Campo de entrada de dados |
| Button | `TButton` | Botão de ação |
| ComboBox | `TComboBox` | Lista suspensa |
| CheckBox | `TCheckBox` | Caixa de seleção |
| Radio | `TRadioMenu` | Grupo de opções exclusivas |
| Panel | `TPanel` | Painel agrupador |
| ListBox | `TListBox` | Lista de itens |
| MultiGet | `TMultiGet` | Área de texto multilinha |
| Bitmap | `TBitmap` | Exibição de imagem |
| Meter | `TMeter` | Barra de progresso |
| Folder (Abas) | `TFolder` | Controle de abas |

### 🪟 Tipos de Interface
- **MsDialog** — Diálogo clássico do Protheus
- **TDialog** — Diálogo avançado com mais controle sobre eventos
- **FWDialogModal** — Modal moderna do Framework (Protheus 12+)
- **MsNewGetDados** — Grid editável (Browse) para edição em lote
- **MSMGet (Enchoice)** — Formulário padrão de cadastro vinculado ao SX3

### ⚙️ Configurações Avançadas
- Medidas em pixels ou caracteres
- Margens, gaps e coordenadas customizáveis
- Variáveis tipadas (Character, Numeric, Date, Logical)
- Ações personalizadas nos botões
- Centralização automática de diálogos
- Colunas de grid configuráveis (MsNewGetDados)
- Campos do dicionário SX3 (MSMGet)

### 📦 Exportação
- **Copiar para clipboard** — código pronto para colar no IDE
- **Download .PRW** — arquivo fonte nomeado automaticamente (`U_NOMEDAFUNCAO.PRW`)
- Código gerado com cabeçalho, includes e boas práticas ADVPL

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/simulador-interface-advpl.git
cd simulador-interface-advpl

# Instale as dependências
npm install
```

### Configuração

Crie um arquivo `.env.local` na raiz do projeto com sua chave da API Gemini (opcional, necessária apenas para funcionalidades de IA):

```env
GEMINI_API_KEY="sua-chave-aqui"
```

### Executar em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview do build

```bash
npm run preview
```

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **React 19** | Interface do usuário e componentes |
| **TypeScript 5.8** | Tipagem estática e segurança |
| **Vite 6** | Bundler e dev server |
| **Tailwind CSS 4** | Estilização utilitária |
| **Lucide React** | Ícones SVG |
| **Motion** | Animações fluidas |
| **Google Gemini AI** | Funcionalidades assistidas por IA |

---

## 📁 Estrutura do Projeto

```
simulador-interface-advpl/
├── public/              # Arquivos estáticos (favicon, manifest, etc.)
├── src/
│   ├── App.tsx          # Componente principal (canvas + painel de config)
│   ├── advplGenerator.ts # Motor de geração de código ADVPL
│   ├── types.ts         # Tipos TypeScript (componentes, configs, presets)
│   ├── main.tsx         # Ponto de entrada React
│   └── index.css        # Estilos globais com Tailwind
├── scripts/             # Scripts utilitários
├── .env.example         # Variáveis de ambiente de exemplo
├── package.json         # Dependências e scripts
├── vite.config.ts       # Configuração do Vite
└── tsconfig.json        # Configuração TypeScript
```

---

## 🎯 Como Usar

1. **Escolha o tipo de interface** no painel esquerdo (MsDialog, TDialog, FWDialogModal, etc.)
2. **Configure as propriedades** da janela (título, dimensões, margens)
3. **Arraste componentes** da paleta para o canvas
4. **Posicione e configure** cada componente (variáveis, ações, textos)
5. **Visualize o código** gerado em tempo real na aba "Código"
6. **Exporte** copiando para o clipboard ou baixando o arquivo `.PRW`

---

## 📝 Exemplo de Código Gerado

```advpl
/*
================================================================================
* Programa:   U_AJUSTVALOR.PRW
* Descrição:  Janela para alteração de valor com input simples
* Data:       03/06/2026
* Tipo:       MsDialog (Diálogo Clássico)
================================================================================
*/
#Include 'Protheus.ch'

User Function AjustValor()
    Local oDlg
    Local oSayVal, oGetVal
    Local oBtnOk, oBtnCancel
    Local nValTotal := 8500.00

    Define MsDialog oDlg ;
        Title "Ajuste Automático de Lote" ;
        From 0, 0 To 218, 440 ;
        Pixel

    @ 32, 24 Say oSayVal ;
        Prompt "Novo Total:" ;
        Size 65, 10 ;
        Of oDlg ;
        Pixel

    @ 30, 97 MsGet oGetVal ;
        Var nValTotal ;
        Size 180, 11 ;
        Of oDlg ;
        Pixel

    @ 156, 140 Button oBtnOk ;
        Prompt "Confirmar" ;
        Size 55, 15 ;
        Of oDlg ;
        Action ( MsgInfo("Valor ajustado!"), oDlg:End() ) ;
        Pixel

    Activate MsDialog oDlg Centered

Return nValTotal
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commitar suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Fazer push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto é de uso livre para fins educacionais e profissionais.

---

<div align="center">

Feito com ❤️ para a comunidade **Protheus/ADVPL**

</div>
