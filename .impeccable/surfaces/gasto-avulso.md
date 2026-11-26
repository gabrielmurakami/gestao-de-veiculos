# Brief: Gasto avulso de trabalho

> Resultado de `/impeccable shape gasto avulso de trabalho`, em 25/11/2026. Parte da crítica do AutoGest (pergunta 2: "Trabalho é do veículo ou do gasto?"). O usuário pediu o recurso para esta rodada; as decisões abaixo foram tomadas a partir do PRODUCT.md e do brief do Relatório, sem rodada de perguntas. Vale revisar.

## 1. Tarefa e público
O dono do app (modo Operate) usa às vezes o **carro pessoal** a trabalho (uma viagem, uma visita) e quer que **aquele** abastecimento ou aquela manutenção entrem no relatório de reembolso, sem transformar o carro inteiro em "Trabalho".

## 2. Regra de negócio
- **Veículo "Trabalho":** tudo entra no relatório, como hoje. Nada para marcar.
- **Veículo "Pessoal":** cada abastecimento e cada manutenção tem uma marca opcional **"Despesa de trabalho"**. Só os marcados entram no relatório.
- A marca pode ser posta na hora de registrar **e depois** (retroativa), porque muita gente lembra no fim do mês.

## 3. Dados
- `abastecimento.work` e `manutenção.work`: booleano, padrão `false`. Só tem efeito em veículo pessoal.
- Backup: os campos entram na validação da importação; arquivos antigos (sem o campo) viram `false`. A versão do formato continua 2, porque é um campo opcional.

## 4. Interface
- **Formulário de abastecimento e de agendar manutenção:** caixa "Despesa de trabalho" com a dica "Entra no relatório de reembolso, mesmo neste carro pessoal." Só aparece com um veículo pessoal selecionado.
- **Linhas do histórico e da agenda:** em veículo pessoal, um botão-etiqueta **"Trabalho"** (`aria-pressed`) que liga e desliga a marca. Usa o mesmo componente dos atalhos do posto.
- **Relatório:**
  - o seletor de veículo lista os veículos de trabalho **e** os pessoais que tenham despesas marcadas;
  - o cabeçalho indica "despesas marcadas como trabalho" quando o veículo é pessoal;
  - os km rodados **não são calculados** nesse caso (só parte dos abastecimentos é de trabalho, então a conta pelo odômetro seria falsa): aparece "—" com a explicação.
- **Estado vazio do Relatório:** passa a dizer que há dois caminhos (marcar o veículo como Trabalho ou marcar despesas avulsas).

## 5. Fora do escopo
Marcar vários itens de uma vez; relatório com mais de um veículo ao mesmo tempo; percentual de uso profissional do carro.

## 6. Decisões em aberto
- Se um dia houver reembolso por km rodado, será preciso saber os km de trabalho (hoje não são registrados).
