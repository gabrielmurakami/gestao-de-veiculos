# AutoGest — Gestão de Veículos

> **Sistema completo e offline-first** para monitorar consumo, abastecimentos e manutenções de seus veículos. Funciona 100% no navegador, sem backend, usando `localStorage`.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **📊 Dashboard** | KPIs de consumo médio (km/l), último abastecimento, odômetro atual e gráfico de evolução do consumo |
| **🏎️ Garagem** | Cadastro de múltiplos veículos com nome, modelo, ano, placa, tipo de combustível e KM inicial |
| **⛽ Abastecimento** | Registro de abastecimentos com data, KM, litros, preço/litro e posto; cálculo automático de km/l por trecho e total gasto |
| **🔧 Manutenção** | Agendamento por tipo (troca de óleo, revisão, pneus, freios, etc.), data/KM prevista, observações; status visual (vencido, próximo, em dia, concluído) |
| **📈 Gráfico de Consumo** | Linha temporal do km/l por abastecimento (requer 2+ registros), usando Chart.js |
| **💾 Persistência Local** | Tudo salvo no `localStorage` — funciona offline, sem servidor |

---

## 🚀 Início Rápido

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gestao-de-veiculos.git
cd gestao-de-veiculos

# Abra diretamente no navegador (não precisa de servidor)
# Windows:
start index.html
# macOS:
open index.html
# Linux:
xdg-open index.html
```

> **Dica:** Para evitar problemas de CORS com o Chart.js (CDN), recomenda-se servir via HTTP simples:
> ```bash
> npx serve .
> # ou
> python -m http.server 8080
> ```

---

## 🖥️ Telas e Fluxos

### Dashboard
- **KPIs**: Consumo médio geral, total de abastecimentos, último KM, último abastecimento (litros + data)
- **Gráfico**: Evolução do km/l entre abastecimentos consecutivos
- **Próximas manutenções**: Cards coloridos (🔴 vencido/urgente, 🟡 próximo, 🟢 em dia) com contagem regressiva em dias

### Garagem
- Lista de veículos com avatar (emoji por combustível), consumo médio calculado e ações: **Selecionar / Editar / Excluir**
- Formulário modal para adicionar/editar veículo

### Abastecimento
- **Contexto**: Mostra qual veículo está selecionado
- **Pré-visualização em tempo real**: Ao digitar KM e litros, calcula automaticamente:
  - KM rodados desde o último abastecimento
  - Consumo do trecho (km/l)
  - Total gasto (se preço informado)
- **Histórico**: Lista reversa (mais recente primeiro) com km/l por trecho e botão excluir

### Manutenção
- Tipos pré-definidos + opção "Outro" (campo livre)
- Data prevista e/ou KM prevista
- Status automático baseado na data atual
- Ações: **Concluir / Excluir**

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **HTML** | Semântico, acessível, mobile-first |
| **CSS** | Custom Properties (tokens), Grid/Flexbox, design system "Cockpit" dark theme |
| **JS** | Vanilla ES6+ (modules pattern), sem dependências de build |
| **Gráficos** | [Chart.js v4](https://www.chartjs.org/) via CDN (UMD) |
| **Persistência** | `localStorage` (chaves: `ag_cars`, `ag_fuels`, `ag_maints`, `ag_selected`) |
| **Fontes** | Inter (Google Fonts) |

---

## 📁 Estrutura do Projeto

```
gestao-de-veiculos/
├── index.html      # Estrutura, telas, formulários, modais, toasts
├── style.css       # Design system completo (tokens, componentes, responsivo)
├── app.js          # Lógica: storage, navegação, cálculos, renderização, eventos
└── README.md       # Este arquivo
```

---

## 🎨 Design System (Tokens CSS)

```css
:root {
  /* Cores base */
  --bg-deep:     #0A1520;
  --bg-base:     #0F1E2E;
  --bg-surface:  #162436;
  --bg-raised:   #1D2F42;
  --bg-hover:    #243650;

  /* Acentos */
  --accent-blue:  #3B82F6;
  --accent-blue2: #2563EB;
  --accent-amber: #F59E0B;
  --accent-green: #10B981;
  --accent-red:   #EF4444;

  /* Texto */
  --text-primary:   #E2E8F0;
  --text-secondary: #94A3B8;
  --text-muted:     #4B6280;

  /* Espaçamento & Bordas */
  --gap: 16px;
  --radius: 10px;
  --radius-sm: 6px;
  --sidebar-w: 220px;

  /* Tipografia */
  --font: 'Inter', system-ui, sans-serif;
}
```

> O tema é **dark-only** inspirado em painéis industriais/cockpit — alto contraste, hierarquia clara, feedback visual imediato.

---

## 📱 Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| **Desktop (≥769px)** | Sidebar fixa à esquerda, bottom nav oculta |
| **Tablet (769–1024px)** | Sidebar estreita (200px) |
| **Mobile (≤768px)** | Sidebar vira drawer (hambúrguer), bottom nav aparece, KPIs empilham, formulários em coluna única |

---

## 🧮 Lógica de Cálculo

### Consumo por trecho (km/l)
```
km/l = (odômetro_atual - odômetro_anterior) / litros_atual
```
> Requer odômetro atual > odômetro anterior e litros > 0.

### Consumo médio geral
```
km/l médio = (último_odômetro - primeiro_odômetro) / soma(litros_do_2º_em_diante)
```
> Ignora o primeiro abastecimento (não há trecho anterior para comparar).

---

## 💾 Modelo de Dados (localStorage)

```js
// ag_cars
[
  { id, name, model, year, plate, fuel, odometer, emoji, createdAt, updatedAt }
]

// ag_fuels
[
  { id, carId, date, odometer, liters, price, station, createdAt }
]

// ag_maints
[
  { id, carId, type, date, km, notes, resolved, createdAt }
]

// ag_selected
"carId" // ID do veículo ativo
```

---

## 🌱 Dados de Demonstração

Na primeira execução, o app popula automaticamente:
- 1 veículo: **Celta do dia a dia** (Flex, 72.500 km)
- 8 abastecimentos históricos (jan–ago/2025)
- 3 manutenções: troca de óleo (5 dias), alinhamento (20 dias), revisão geral (vencida 3 dias)

> Controlado pela flag `ag_seeded` no localStorage.

---

## 🔧 Scripts Úteis (Dev)

```bash
# Validar HTML
npx html-validate index.html

# Verificar CSS (stylelint)
npx stylelint style.css

# Verificar JS (ESLint)
npx eslint app.js

# Servir localmente
npx serve .
```

---

## 📄 Licença

MIT — Use, modifique e distribua livremente.

---

## 👤 Autor

**Gabriel Murakami** — [AutoGest v1.0](https://github.com/GabrielMurakami/gestao-de-veiculos)

> Projeto pessoal para controle de frota própria. PRs e issues são bem-vindos!