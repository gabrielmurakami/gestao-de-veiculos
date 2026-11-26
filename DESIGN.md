---
name: AutoGest
description: Caderno de bordo pessoal dos veículos, em tinta escura, preciso e offline.
colors:
  highlighter: "#60a5fa"
  highlighter-hover: "#93c5fd"
  highlighter-strong: "#2563eb"
  highlighter-strong-hover: "#1d4ed8"
  highlighter-ink: "#ffffff"
  overdue-red: "#ff5470"
  reminder-amber: "#f2c94c"
  checked-mint: "#7fd6a8"
  danger-button: "#c21d48"
  danger-button-hover: "#a3173c"
  ink-cover: "#0b0c0e"
  ink-spine: "#0f1113"
  ink-page: "#141619"
  ink-raised: "#1b1e22"
  ink-hover: "#22262b"
  paper: "#ecebe4"
  soft-graphite: "#a9a89f"
  graphite: "#8f8e86"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(4.25rem, 8vw, 7rem)"
    fontWeight: 300
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1
  title:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  gap: "16px"
  screen: "clamp(16px, 3vw, 40px)"
  topbar: "64px"
components:
  button-primary:
    backgroundColor: "{colors.highlighter}"
    textColor: "{colors.highlighter-ink}"
    rounded: "{rounded.sm}"
    height: "42px"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.highlighter-hover}"
  button-ghost:
    backgroundColor: "rgba(236, 235, 228, 0.03)"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "42px"
  button-danger:
    backgroundColor: "{colors.danger-button}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.ink-cover}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "44px"
  sheet:
    backgroundColor: "{colors.ink-page}"
    rounded: "{rounded.lg}"
  badge:
    backgroundColor: "rgba(236, 235, 228, 0.05)"
    textColor: "{colors.soft-graphite}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
---

# Design System: AutoGest

## Overview

**Creative North Star: "O Caderno do Motorista"**

O AutoGest é o caderninho de bordo que a pessoa sempre quis manter e nunca manteve. O visual vem do objeto: **tinta escura**, **texto cor de papel**, **linhas pautadas** e um único **marca-texto** azul que destaca o que importa em cada página. Nada de "dashboard escuro genérico". Os dados são anotações num caderno bem cuidado.

É um app de uso diário (modo Operate). O acabamento premium vem de precisão e de contenção, não de efeito: números tabulares grandes, fios finos semitransparentes, hierarquia por tamanho e peso, e movimento só onde ele explica, responde ou celebra um momento raro. Sempre escuro (decisão do usuário, ver PRODUCT.md).

**Key Characteristics:**
- Uma frase de caderno abre o dashboard, com o número herói em letra arredondada e no marca-texto.
- Listas são livros-razão: uma folha, linhas separadas por fio, não cartões soltos.
- Um acento só: o marca-texto. Vermelho, âmbar e menta são carimbos de estado.
- Letra arredondada (Nunito) para títulos e o número herói; sans para todo o resto, com algarismos tabulares.
- Movimento curto e interrompível; dois momentos assinatura raros (marca-texto e caneta).

## Colors

Tinta quase preta, levemente quente, em camadas; papel no lugar do branco; um marca-texto.

### Primary
- **Marca-texto** azul (#60a5fa, ≥ 7:1 sobre a tinta): o número herói do dashboard, o item ativo do menu (no ícone), o total a reembolsar e o mês atual no gráfico de gastos. Também é a cor do cursor e do foco por teclado.
- **Azul forte** (#2563eb, hover #1d4ed8, texto branco ≥ 4,5:1): a ação principal de cada tela (botão primário) e a seleção de texto.

### Secondary
- **Vermelho Vencido** (#ff5470): manutenção vencida ou a ≤ 7 dias e KM atingida; erros de campo.
- **Âmbar Lembrete** (#f2c94c): manutenção próxima (≤ 30 dias); avisos (valores não informados).
- **Menta Conferida** (#7fd6a8): manutenção em dia.
- **Botão de perigo** (#c21d48, hover #a3173c, texto branco): só na confirmação de exclusão.

### Neutral
- **Capa** (#0b0c0e): fundo da página e dos campos.
- **Lombada** (#0f1113): menu lateral.
- **Página** (#141619): folhas (formulários, gráficos, listas).
- **Página elevada** (#1b1e22): toast, modal, item selecionado do segmentado.
- **Página realçada** (#22262b): hover.
- **Papel** (#ecebe4): texto principal e valores.
- **Grafite suave** (#a9a89f): texto secundário e rótulos.
- **Grafite** (#8f8e86): legendas, eixos, placeholders (≥ 4,5:1 em todos os fundos, inclusive o de hover).
- **Fios**: `rgba(236, 235, 228, 0.08)` (separadores) e `0.14` (bordas de controles); pontilhado do livro-razão a `0.22`.

### Named Rules
**The Marca-texto Rule.** Um destaque por tela. Se duas coisas estão no marca-texto, uma delas não deveria estar.

**The Carimbo Rule.** Vermelho, âmbar e menta só marcam estado e sempre vêm com a palavra ("Vencida", "Em 20 dias"). Nunca decoração.

**The Fio Rule.** Bordas são semitransparentes sobre a tinta, nunca cinza sólido; separar com fio antes de criar outra caixa.

## Typography

**Display Font:** Nunito variável, peso 300 (com system-ui): só no número herói.
**Headline Font:** Nunito variável, peso 800 (com system-ui).
**Body Font:** Instrument Sans variável (400–700, com system-ui).

**Character:** a Nunito é a "letra de caderno": pesada nos títulos de tela e na abertura do primeiro uso, leve no número herói, sempre com terminais arredondados; a sans é a letra de formulário, precisa e com algarismos tabulares. Todas hospedadas em `/assets/fonts/` (OFL).

### Hierarchy
- **Display** (Nunito 300, clamp(4.25rem, 8vw, 7rem), 0.92, -0.04em): o número herói do dashboard (consumo médio). Arredondada e leve para dar suavidade ao maior elemento da tela.
- **Headline** (Nunito 800, 1.5rem; 1.375rem no celular): título da tela na barra superior, títulos de modal (1.375rem) e de estado vazio (1.5rem); abertura do primeiro uso (clamp(2.25rem, 5vw, 3.75rem)) com a parte final no marca-texto.
- **Title** (Instrument Sans 600, 1rem, -0.01em): títulos de seção, de gráfico e de formulário.
- **Body** (Instrument Sans 400, 0.9375rem, 1.5, `tabular-nums` global): texto, listas, campos e botões.
- **Label** (Instrument Sans 500, 0.8125rem): rótulos de campo; legendas a 0.75rem; selos a 0.6875rem em caixa alta.

### Named Rules
**The Algarismo Tabular Rule.** Todo número na interface usa algarismos de largura fixa (`font-variant-numeric: tabular-nums` no corpo), para não "dançar" quando muda.

**The Piso de 11px Rule.** Nenhum texto funcional abaixo de 0.6875rem.

**The Formato Brasileiro Rule.** Vírgula decimal e ponto de milhar sempre (14,13 km/l; 72.000 km; R$ 6,09).

## Layout

- **Moldura:** menu lateral de altura total (232px; 208px entre 769–1024px) com a marca no topo, e barra superior translúcida (64px; 56px no celular) com o título em Nunito à esquerda e o seletor de veículo (pílula) à direita. No celular, menu inferior translúcido de 5 itens.
- **Telas:** respiro lateral `clamp(16px, 3vw, 40px)`, largura total.
- **Dashboard:** abertura em duas colunas (≥ 1100px): frase e número herói à esquerda, livro-razão à direita. Abaixo, gráficos (1,75fr) e linha do tempo de manutenções (≥ 300px).
- **Abastecimento:** formulário fixo à esquerda (≥ 1100px, `position: sticky`), histórico à direita.
- **Ritmo:** fios entre linhas (11–18px de respiro), 24–32px entre blocos.

## Elevation & Depth

Camadas tonais de tinta (capa → página → página elevada) separadas por fios. Sombras só com deslocamento e desfoque suaves, nunca halos coloridos. A barra superior, o menu inferior, o toast e o fundo do modal são **materiais translúcidos** (`backdrop-filter: saturate(1.4) blur(14–18px)`).

### Shadow Vocabulary
- **Folha** (`0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 32px -16px rgba(0,0,0,0.7)`): folhas e cartões.
- **Flutuante** (`0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 48px -12px rgba(0,0,0,0.75)`): toast, modal e indicador de atualizar.
- **Foco de campo** (`0 0 0 3px rgba(255,129,96,0.14)`): campo focado; vermelho a 18% quando tem erro.

### Named Rules
**The Folha Sobre Folha Rule.** Para destacar, suba um tom de tinta antes de usar sombra ou cor. Nunca uma caixa com borda dentro de outra folha.

## Shapes

Cantos de 8px (controles), 12px (cartões pequenos, toasts) e 16px (folhas). Pílulas (999px) para o seletor de veículo, os selos e as etiquetas. Estados usam **pontos** de 8px (linha do tempo, lista de manutenções, toasts), nunca faixas laterais. O veículo selecionado ganha um anel no marca-texto no avatar.

## Components

**Precisos e discretos.** Fios finos, cantos suaves e resposta ao toque sutil. Nenhum componente disputa atenção com os números ou com o marca-texto: o controle aparece quando é tocado, não antes.

### Buttons
- **Shape:** 8px; altura de 42px (36px no pequeno, 50px no grande); 44px de alvo no celular para botões de ícone.
- **Primary:** azul forte com texto branco; uma ação principal por tela ("Registrar", "+ Agendar", "Cadastrar meu veículo").
- **Ghost:** quase transparente com fio de 1px e texto papel; ações secundárias ("Limpar", "Ler recibo", "+ Nova").
- **Danger:** vermelho com texto branco, só na confirmação de exclusão.
- **Estados:** ao pressionar, `scale(0.97)` em 160ms `--ease-out` (0.92 nos botões de ícone, 0.94 no menu inferior); hover só com mouse (`@media (hover: hover) and (pointer: fine)`); desabilitado a 45% de opacidade, sem hover.

### Chips
- **Selo:** pílula neutra com fio, 0.75rem em caixa baixa ("km/l", "6 meses até ago/25").
- **Etiqueta de alternar (chip-btn):** pílula com fio que liga e desliga (`aria-pressed`): "Trabalho" nas linhas de veículo pessoal, "Veículo de trabalho" no cartão do carro. Ligada usa o marca-texto. Também serve de atalho ("Repetir o último" posto e preço no abastecimento).
- **Etiqueta:** pílula neutra ("FLEX"); a etiqueta "Trabalho" usa o marca-texto.

### Cards / Containers
- **Folha:** página (#141619), fio de 1px, 16px de raio, sombra Folha. Contém formulários, gráficos e as listas.
- **Livro-razão:** linhas dentro da folha separadas por fio; no dashboard, rótulo ……… valor com pontilhado e subtítulo em grafite.

### Inputs / Fields
- **Style:** capa (#0b0c0e), fio de 1px a 14%, 8px, altura mínima de 44px, 16px de fonte no celular.
- **Focus:** borda no marca-texto a 50% e anel de 3px a 14%; cursor no marca-texto.
- **Error:** borda vermelha e mensagem de 0.8125rem logo abaixo (`aria-describedby`); some ao editar.
- **Autofill (recibo):** fundo e borda no marca-texto até a pessoa editar.

### Navigation
- **Lateral:** itens de 40px; ativo com fundo de papel a 6% e ícone no marca-texto.
- **Inferior (celular):** material translúcido, 5 itens de 52px; ativo com ícone no marca-texto.
- **Seletor de veículo:** pílula translúcida com fio; borda no marca-texto ao focar.

### Faixa de atenção
Uma linha no topo do dashboard, antes de qualquer número: ponto vermelho, a manutenção mais urgente e quantas mais ("Revisão geral · Vencida e mais 1 urgente"), com "Ver agenda →". Some quando está tudo em dia. Os itens de "Próximas manutenções" têm o botão de concluir, que abre o formulário de valor e data no item certo.

### Palavras de estado
Uma só função para o app inteiro: **Vencida**, **Vence hoje**, **Vence em N dias** (≤ 7), **Em N dias** (≤ 30), **KM atingida**, **KM próxima**, **Em dia**, **Concluída em dd/mm/aaaa · R$ valor**. A cor do ponto e a palavra sempre andam juntas.

### Toast
Página elevada translúcida com ponto de estado (marca-texto = sucesso, vermelho = erro, grafite = info) e ação opcional "Desfazer". Entra com transição (`@starting-style`, translateY 12px + escala 0.98, 400ms `--ease-out`) e sai mais rápido (200ms). Transições, não keyframes, para ser interrompível. Fica mais tempo quando é erro (6 s) ou "Desfazer" de veículo (10 s) e **pausa com o mouse ou o foco em cima**.

### Modal
Fundo escurecido com desfoque; a folha aparece do centro (`scale(0.96)` → 1, 240ms `--ease-out`) e fecha em 150ms. Foco em "Cancelar", Tab preso, Esc fecha. O botão perigoso diz o verbo e o objeto ("Excluir veículo"), o título nomeia o carro e a mensagem conta os registros; "Exportar backup antes" fica à mão.

### Momentos assinatura (raros)
- **Marca-texto:** ao registrar um abastecimento, a linha nova recebe uma passada de marca-texto (clip-path da esquerda para a direita) que some em 2,4s.
- **Caneta:** ao concluir uma manutenção, o título é riscado (scaleX, 520ms `--ease-in-out`); concluídas ficam riscadas.
- **Escrita do número:** na primeira abertura do dashboard na sessão, o número herói é "escrito" da esquerda para a direita (900ms). Não se repete.
- **Primeiro uso:** a abertura entra em cascata não uniforme (0, 90, 160, 230ms).

## Do's and Don'ts

### Do:
- **Do** usar os tokens de movimento: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` para entradas e respostas, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` para movimento na tela, durações de 150–240ms (toast e modal até 400ms).
- **Do** dar `:active` com `scale(0.97)` a tudo que é pressionável.
- **Do** limitar o hover a `@media (hover: hover) and (pointer: fine)`.
- **Do** manter os gráficos sóbrios: linha em papel, grade só horizontal, só o último ponto/mês no marca-texto, animação só na primeira exibição da sessão.
- **Do** usar a mesma palavra de estado em toda tela e escrever números como a pessoa digita: vírgula decimal, ponto de milhar na KM.
- **Do** oferecer em "reduzir movimento" a versão sem deslocamento (só opacidade), mantendo indicadores de progresso.

### Don't:
- **Don't** criar tema claro: o app é sempre escuro (a impressão do relatório é a única exceção, em papel claro).
- **Don't** animar o que se usa dezenas de vezes por dia: troca de tela é só um fade de 140ms; navegação e dados não se mexem.
- **Don't** usar `transition: all`, `ease-in` em interface ou animação a partir de `scale(0)`.
- **Don't** usar faixas laterais coloridas, caixas dentro de folhas ou emoji como ícone (o emoji fica só no avatar e no seletor do veículo).
- **Don't** colocar um segundo acento: azul, roxo ou gradientes não fazem parte do caderno.
- **Don't** carregar fontes, scripts ou imagens de outros domínios: a CSP só permite o próprio site.
