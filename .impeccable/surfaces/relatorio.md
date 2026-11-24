# Brief: Relatório (prestação de contas)

> Resultado de `/impeccable shape prestação de contas`, confirmado com o usuário em 24/11/2026. Ainda não implementado.

## 1. Tarefa e público
O dono do app, no fim do período (normalmente o mês), monta o pedido de reembolso do **veículo de trabalho**: a empresa paga **abastecimentos e manutenções**. Usa principalmente no computador, às vezes no celular. Modo **Operate**: tarefa rápida e repetida todo mês.

## 2. Resultado
Em menos de 1 minuto: escolher o período → ver os totais → sair com um **PDF para imprimir/anexar** e/ou uma **planilha (CSV)**. Sucesso é a empresa aceitar sem a pessoa redigitar nada, com valores que batem com os cupons.

## 3. Direção
- Dentro do sistema visual atual (`DESIGN.md`, "O Caderno do Motorista").
- **Nova aba "Relatório"**: 5º item no menu lateral e no menu inferior.
- Sequência da tela: período (com o veículo de trabalho já selecionado) → resumo de totais → lista de lançamentos → ações de exportar.
- **Impressão em papel claro** (fundo branco, texto escuro) via folha de estilo de impressão; a tela continua sempre escura.

## 4. Escopo
**Muda no modelo de dados:**
- **Veículo:** campo "Uso: Pessoal / Trabalho" no formulário da Garagem, com Pessoal como padrão. O veículo inteiro define o que entra no relatório, sem marcação por lançamento.
- **Manutenção:** "Valor (R$)" e "Data de realização", informados ao marcar como concluída (o ✔ passa a abrir esses dois campos). As concluídas entram no relatório pela data de realização.
- **Backup:** passa a incluir os campos novos (formato versão 2) e continua importando arquivos da versão 1.

**Identificação no relatório:** campos opcionais "Seu nome" e "Empresa / CNPJ", guardados no aparelho, com uma opção para **incluir ou não** no cabeçalho a cada relatório.

**Fora do escopo:** fotos dos recibos anexadas, reembolso por km, sincronização ou envio por e-mail.

## 5. Estados e volumes
- Volume típico por mês: 4–10 abastecimentos e 0–2 manutenções. Intervalo máximo de 1 ano, cerca de 100 linhas.
- Nenhum veículo marcado como trabalho → estado vazio com ação: "Marque um veículo como Trabalho na Garagem".
- Período sem lançamentos → "Nenhum gasto neste período", mantendo o seletor de período visível.
- Abastecimento sem preço → aparece como "valor não informado" e fica fora do total, com aviso no resumo.
- Manutenção concluída sem valor → mesmo tratamento.
- Mais de um veículo de trabalho → seletor de veículo dentro da tela.

## 6. Interação e layout
- **Período:** "Este mês" (padrão), "Mês passado" e "Personalizado" (de/até).
- **Resumo:** Combustível, Manutenção e **Total a reembolsar** em destaque, mais km rodados e litros no período.
- **Lançamentos:** ordenados por data, com data, tipo (abastecimento/manutenção), posto ou descrição, KM, litros e valor. Tabela no desktop; lista de cartões no celular.
- **Exportar:**
  - **"Imprimir / salvar PDF"** usa a impressão do navegador. O cabeçalho traz veículo, placa, período e, se escolhido, nome e empresa; o rodapé traz o total e a data de geração.
  - **"Baixar planilha"** gera um CSV no formato do Excel brasileiro: separador `;`, vírgula decimal e UTF-8 com BOM.

## 7. Restrições
- Tudo offline e no aparelho, sem bibliotecas externas e dentro da CSP `'self'` (o PDF vem da impressão do navegador).
- pt-BR e WCAG AA; alvos de 44px no celular.

## Decisões em aberto
O período padrão é o mês civil. Se a empresa fecha em outro dia (ex.: dia 25 a 24), isso vira uma opção de configuração.
