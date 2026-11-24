---
name: AutoGest
description: Caderno de bordo pessoal dos veículos, escuro, preciso e offline.
colors:
  ink-blue: "#3b82f6"
  ink-blue-text: "#60a5fa"
  ink-blue-button: "#2563eb"
  ink-blue-button-hover: "#1d4ed8"
  checked-green: "#10b981"
  reminder-amber: "#f59e0b"
  overdue-red: "#ef4444"
  overdue-red-text: "#f87171"
  overdue-red-button: "#dc2626"
  overdue-red-button-hover: "#b91c1c"
  night-cover: "#0a1520"
  night-spine: "#0f1e2e"
  dark-page: "#162436"
  raised-page: "#1d2f42"
  hover-page: "#243650"
  margin-line: "#1e3048"
  light-ink: "#e2e8f0"
  soft-graphite: "#94a3b8"
  graphite: "#8196b3"
typography:
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  metric:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "20px"
spacing:
  gap: "16px"
  screen: "20px"
  screen-mobile: "14px"
components:
  button-primary:
    backgroundColor: "{colors.ink-blue-button}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.2rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-blue-button-hover}"
  button-ghost:
    backgroundColor: "{colors.raised-page}"
    textColor: "{colors.soft-graphite}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.2rem"
  button-ghost-hover:
    backgroundColor: "{colors.hover-page}"
    textColor: "{colors.light-ink}"
  button-danger:
    backgroundColor: "{colors.overdue-red-button}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.night-cover}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 0.85rem"
  card:
    backgroundColor: "{colors.dark-page}"
    rounded: "{rounded.md}"
    padding: "16px 18px"
  badge:
    backgroundColor: "rgba(59, 130, 246, 0.14)"
    textColor: "{colors.ink-blue-text}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  nav-item-active:
    backgroundColor: "rgba(59, 130, 246, 0.14)"
    textColor: "{colors.ink-blue-text}"
    rounded: "{rounded.sm}"
---

# Design System: AutoGest

## Overview

**Creative North Star: "O Caderno do Motorista"**

O AutoGest é o caderninho de bordo que a pessoa sempre quis manter e nunca manteve: cada abastecimento, cada troca de óleo, cada real gasto, anotados com a mesma letra e na mesma ordem. O visual serve a esse registro. As páginas são folhas escuras sobre uma capa azul-noite, os valores ficam alinhados e legíveis, e a cor aparece como as marcações de um caderno bem cuidado: a caneta azul para o que se pode fazer e os carimbos de status para o que precisa de atenção.

A densidade é de caderno, não de painel de controle. O histórico, as datas e os valores são o conteúdo; a interface recua. Componentes são precisos e discretos, com contornos finos, cantos suavemente arredondados e sombra leve, para que nada dispute atenção com os números e com os alertas de manutenção.

É sempre escuro (decisão do usuário, ver PRODUCT.md), pensado para ser lido rápido no celular dentro do carro e com calma no computador.

**Key Characteristics:**
- Folhas escuras em camadas tonais (capa → página → página elevada), com sombra suave só nos cartões.
- Um único acento de ação, a caneta azul; verde, âmbar e vermelho são reservados para estado.
- Números grandes e firmes; rótulos pequenos em caixa alta, espaçados.
- Ícones desenhados em traço fino (SVG, 2px), nunca emoji. A exceção é o avatar do veículo.
- Contraste AA em todo texto, inclusive no sol do posto.

## Colors

Azul-noite profundo em camadas, uma caneta azul e três cores de carimbo para estado.

### Primary
- **Caneta Azul** (#3b82f6): acento único de ação e informação, usado em ícones da marca e de navegação, linhas e barras dos gráficos, foco e preenchimento suave de selos e item ativo. Como **texto** sobre fundo escuro, usa a versão clara **Caneta Azul Clara** (#60a5fa). Como **fundo de botão** com texto branco, usa a versão funda **Caneta Azul Funda** (#2563eb; hover #1d4ed8).

### Secondary
- **Verde Conferido** (#10b981): consumo (km/l) e manutenção "em dia". Significa "está certo".
- **Âmbar Lembrete** (#f59e0b): manutenção próxima (até 30 dias). Também é a cor do raio da marca.
- **Vermelho Vencido** (#ef4444): manutenção vencida ou a ≤ 7 dias e KM atingida, na faixa de status. Como texto, **Vermelho Vencido Claro** (#f87171); como botão destrutivo, #dc2626 (hover #b91c1c).

### Neutral
- **Capa Noturna** (#0a1520): fundo da página e dos campos de formulário.
- **Lombada Azul-Noite** (#0f1e2e): barra superior e menu lateral.
- **Folha Escura** (#162436): cartões, gráficos e formulários.
- **Folha Elevada** (#1d2f42): elementos dentro de cartões (contexto, toasts, botões secundários).
- **Folha Realçada** (#243650): hover e borda clara.
- **Linha de Margem** (#1e3048): bordas de 1px que separam folhas.
- **Tinta Clara** (#e2e8f0): texto principal e valores.
- **Grafite Suave** (#94a3b8): texto secundário.
- **Grafite** (#8196b3): rótulos, legendas, placeholders e eixos (≥ 4,5:1 em todos os fundos fixos).

### Named Rules
**The Caneta Azul Rule.** Azul é o único acento de ação. Se algo azul não é clicável nem informativo, deve ser outra cor.

**The Carimbo Rule.** Verde, âmbar e vermelho só marcam estado (consumo, prazo de manutenção, erro). Nunca são decoração, e cada um sempre vem acompanhado de texto ("Vencida", "Em 20 dias"), nunca só a cor.

**The Duas Canetas Rule.** Cor de acento como texto usa a versão clara (`*-text`); como fundo de botão, a versão funda (`btn-*`). O tom médio (#3b82f6, #ef4444) não leva texto em cima.

## Typography

**Display Font:** Inter (com system-ui, sans-serif)
**Body Font:** Inter (com system-ui, sans-serif)

**Character:** uma única família, variável e hospedada no próprio site (`/assets/fonts/inter-latin-var.woff2`). A hierarquia vem de tamanho e peso, como numa caligrafia regular de caderno.

### Hierarchy
- **Metric** (700, 2rem, 1.1, -0.03em): o número principal de cada indicador (consumo médio). Os valores secundários usam 1.4rem; no celular, 1.15rem.
- **Headline** (600, 1.25rem): título da tela na barra superior (h1).
- **Title** (600, 1rem): títulos de seção e de gráfico (h2). Títulos de formulário (h3) usam 0.95rem.
- **Body** (400, 0.875rem): texto corrido, campos e botões. Listas e metadados usam 0.75–0.85rem.
- **Label** (500, 0.7rem, 0.08em, CAIXA ALTA): rótulos dos indicadores ("CONSUMO MÉDIO"). Selos e status usam 0.6875rem em caixa alta.

### Named Rules
**The Piso de 11px Rule.** Nenhum texto funcional (rótulo, selo, status, menu) fica abaixo de 11px (0.6875rem).

**The Número Primeiro Rule.** Num indicador, o valor é sempre o maior elemento; a unidade (km/l, L, R$) vem menor e em Grafite Suave.

**The Formato Brasileiro Rule.** Números com vírgula decimal e ponto de milhar (14,13 km/l; 72.000 km; R$ 6,09), sempre.

## Layout

Barra superior fixa (título da tela à esquerda, seletor de veículo à direita). Menu lateral de 220px no desktop (200px entre 769–1024px) e menu inferior fixo no celular (≤ 768px). Ritmo base de 16px entre blocos; telas com 20px de respiro (14px no celular).

- **Dashboard:** indicadores em grade de 3 colunas (2 no celular, com o destaque e o último ocupando a linha inteira). A partir de 1100px, gráficos à esquerda (≈ 1,7fr) e próximas manutenções à direita (≥ 280px).
- **Abastecimento:** a partir de 1100px, formulário à esquerda (≥ 380px, 2fr) e histórico à direita (3fr). Abaixo disso, coluna única.
- **Garagem e Manutenção:** lista em largura total.
- **Formulários:** grade de 2 colunas que vira 1 no celular.

## Elevation & Depth

Profundidade por camadas tonais, como folhas sobre a capa: cada nível é um tom mais claro do azul-noite, separado por uma linha de 1px. As sombras são suaves e só aparecem em cartões (repouso) e em elementos flutuantes (toast, modal, menu aberto).

### Shadow Vocabulary
- **Folha** (`box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35)`): cartões de indicador, gráfico, formulário e veículo.
- **Flutuante** (`box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5)`): toasts, modal e indicador do puxar-para-atualizar.
- **Foco** (`box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15)`): campos focados (vermelho a 18% quando o campo tem erro).

### Named Rules
**The Folha Sobre Folha Rule.** Para destacar algo, suba um tom de fundo (Folha Escura → Folha Elevada) antes de pensar em sombra ou cor.

## Shapes

Cantos suavemente arredondados em três tamanhos: 6px para controles (botões, campos, itens de menu), 10px para cartões e 14px para cartões de formulário. Selos e etiquetas usam pílula (20px). Bordas de 1px em Linha de Margem. Os cartões de manutenção levam uma faixa de status de 3px no lado esquerdo (vermelho, âmbar ou verde), sempre com o texto do status junto.

## Components

### Buttons
Precisos e discretos: compactos, peso 600, sem sombra.
- **Shape:** cantos suaves (6px).
- **Primary:** Caneta Azul Funda com texto branco (0.6rem × 1.2rem). Uma ação principal por formulário ("Registrar", "Salvar veículo").
- **Hover / Focus / Active:** hover escurece para #1d4ed8; foco por teclado com contorno azul de 2px afastado 2px; ao tocar, encolhe para 97% (desligado em "reduzir movimento").
- **Ghost:** Folha Elevada com borda de 1px e texto Grafite Suave; hover em Folha Realçada e Tinta Clara. Usado para ações secundárias ("Limpar", "Ler recibo", "+ Nova").
- **Danger:** Vermelho funda #dc2626 com texto branco, só na confirmação de exclusão.
- **Small:** 0.4rem × 0.85rem, 0.8rem; no celular, altura mínima de 40px.
- **Icon button:** 30px quadrado no desktop e 44px no celular; ícone em Grafite, que fica Tinta Clara no hover (vermelho claro no excluir). Sempre com `aria-label`.

### Chips
- **Selo (badge):** pílula, fundo azul a 14%, texto Caneta Azul Clara, 0.6875rem em caixa alta. Rotula gráficos ("KM/L", "6 meses até ago/25").
- **Etiqueta de combustível:** mesma forma, na linha do veículo ("FLEX").

### Cards / Containers
- **Corner Style:** 10px (formulários, 14px).
- **Background:** Folha Escura; o indicador de destaque usa gradiente sutil de #162d4d a #0e1e30, com uma linha azul de 3px no topo.
- **Shadow Strategy:** sombra Folha (ver Elevation).
- **Border:** 1px Linha de Margem; cartões de manutenção tingem a borda com a cor do status.
- **Internal Padding:** 16–20px.

### Inputs / Fields
- **Style:** fundo Capa Noturna, borda de 1px Linha de Margem, 6px, 0.875rem (16px no celular, para o iOS não dar zoom).
- **Focus:** borda Caneta Azul e brilho de 3px a 15%.
- **Error:** borda Vermelho Vencido Claro e mensagem de 0.75rem logo abaixo do campo, ligada via `aria-describedby`; some ao editar.
- **Autofill (leitura de recibo):** borda azul e fundo azul a 14% até a pessoa editar.
- Rótulo sempre visível acima do campo (0.75rem, 500, Grafite Suave); campos opcionais marcados "(opcional)".

### Navigation
- **Lateral (desktop):** itens com ícone de 18px e texto 0.875rem; ativo com fundo azul a 14% e texto Caneta Azul Clara; hover em Folha Escura.
- **Inferior (celular):** 4 itens com ícone de 20px e rótulo de 11px; ativo em Caneta Azul Clara.
- **Seletor de veículo:** caixa de cantos suaves (6px) na barra superior, com o emoji do veículo e o nome; troca o veículo de todas as telas.

### Cartão de Manutenção (signature)
O carimbo do caderno: título da manutenção (0.85rem, 600), data e KM com ícones finos, e o status em caixa alta e na cor do carimbo ("VENCIDA", "VENCE EM 5D", "EM 20 DIAS"). Mostra quanto falta em KM e a previsão em dias pelo ritmo de uso ("faltam 500 km (≈ 26 dias)").

### Toast com Desfazer
Folha Elevada com sombra Flutuante, no canto inferior direito (acima do menu no celular). Ícone de estado à esquerda (✓ verde, ✕ vermelho, ℹ azul) e, quando há exclusão, o botão "Desfazer" em Caneta Azul Clara por 6 segundos.

## Do's and Don'ts

### Do:
- **Do** usar Caneta Azul Clara (#60a5fa) para todo texto azul e Caneta Azul Funda (#2563eb) para todo botão azul com texto branco.
- **Do** acompanhar toda cor de status com a palavra do status ("Vencida", "Em dia").
- **Do** formatar números em pt-BR (vírgula decimal, ponto de milhar; R$ via `Intl`).
- **Do** usar os ícones do sprite SVG (traço de 2px, cantos arredondados) para qualquer ação nova.
- **Do** manter alvos de toque de pelo menos 44px no celular e texto funcional de pelo menos 11px.
- **Do** mostrar erros de formulário no próprio campo, além do toast.

### Don't:
- **Don't** criar tema claro: o app é sempre escuro (decisão do usuário).
- **Don't** usar emoji como ícone de ação ou de interface; o emoji fica só no avatar do veículo.
- **Don't** colocar texto sobre o tom médio do acento (#3b82f6, #ef4444): falha o contraste AA.
- **Don't** usar verde, âmbar ou vermelho como decoração.
- **Don't** carregar fontes, scripts ou imagens de outros domínios: a CSP só permite o próprio site.
