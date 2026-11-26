# AutoGest — Gestão de Veículos

> **Sistema completo e offline-first** para monitorar consumo, abastecimentos e manutenções de seus veículos. Funciona 100% no navegador, sem backend, usando `localStorage`.

---

## ✨ Funcionalidades

| Módulo                    | Descrição                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **📊 Dashboard**          | KPIs de consumo médio (km/l), último abastecimento, odômetro atual e gráfico de evolução do consumo                                                    |
| **🏎️ Garagem**            | Cadastro de múltiplos veículos com nome, modelo, ano, placa, tipo de combustível e KM inicial                                                          |
| **⛽ Abastecimento**      | Registro de abastecimentos com data, KM, litros, preço/litro e posto; cálculo automático de km/l por trecho e total gasto                              |
| **🔧 Manutenção**         | Agendamento por tipo (troca de óleo, revisão, pneus, freios, etc.), data/KM prevista, observações; status visual (vencido, próximo, em dia, concluído) |
| **📈 Gráfico de Consumo** | Linha temporal do km/l por abastecimento (requer 2+ registros), usando Chart.js                                                                        |
| **🧾 Relatório**          | Prestação de contas do veículo de trabalho (ou de despesas avulsas marcadas como trabalho): período, totais, lista, impressão/PDF e planilha CSV                      |
| **📷 Ler recibo**         | Foto do cupom do posto preenchendo data, litros, preço e posto (OCR no próprio aparelho; a foto não sai dele)                                           |
| **♻️ Backup**             | Exportar e importar os dados em arquivo JSON validado; exclusões podem ser desfeitas                                                                     |
| **💾 Persistência Local** | Tudo salvo no `localStorage` — funciona offline, sem servidor                                                                                          |

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
>
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

| Camada           | Tecnologia                                                                   |
| ---------------- | ---------------------------------------------------------------------------- |
| **HTML**         | Semântico, acessível, mobile-first                                           |
| **CSS**          | Custom Properties (tokens), Grid/Flexbox, design system "O Caderno do Motorista" (ver `DESIGN.md`) |
| **JS**           | Vanilla ES6+ (modules pattern), sem dependências de build                    |
| **Gráficos**     | [Chart.js v4](https://www.chartjs.org/) hospedado no próprio site, carregado sob demanda |
| **Persistência** | `localStorage` (chaves: `ag_cars`, `ag_fuels`, `ag_maints`, `ag_selected`)   |
| **Fontes**       | Instrument Sans e Nunito (OFL), hospedadas em `assets/fonts/`      |

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

## 🎨 Design System

O sistema visual completo ("O Caderno do Motorista": paleta, tipografia, movimento e regras) está em [`DESIGN.md`](DESIGN.md). Os tokens principais:

```css
:root {
  /* Tinta (fundos em camadas) */
  --bg-deep: #0b0c0e;
  --bg-surface: #141619;
  --bg-raised: #1b1e22;

  /* Azul: o único acento */
  --accent: #60a5fa;
  --accent-strong: #2563eb; /* botão primário, texto branco */

  /* Texto cor de papel */
  --text-primary: #ecebe4;
  --text-secondary: #a9a89f;
  --text-muted: #8f8e86;

  /* Movimento */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  /* Tipografia */
  --font: "Instrument Sans", system-ui, sans-serif;
  --font-display: "Nunito", system-ui, sans-serif;
}
```

> O tema é **sempre escuro**: tinta escura, texto cor de papel e um único acento.

---

## 📱 Responsividade

| Breakpoint              | Comportamento                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Desktop (≥769px)**    | Sidebar fixa à esquerda, bottom nav oculta                                                       |
| **Tablet (769–1024px)** | Sidebar estreita (200px)                                                                         |
| **Mobile (≤768px)**     | Sidebar vira drawer (hambúrguer), bottom nav aparece, KPIs empilham, formulários em coluna única |

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
[{ id, name, model, year, plate, fuel, odometer, emoji, createdAt, updatedAt }][
  // ag_fuels
  { id, carId, date, odometer, liters, price, station, createdAt }
][
  // ag_maints
  { id, carId, type, date, km, notes, resolved, createdAt }
];

// ag_selected
("carId"); // ID do veículo ativo
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
