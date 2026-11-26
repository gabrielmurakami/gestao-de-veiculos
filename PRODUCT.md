# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Uma pessoa (o dono do app) que controla os próprios veículos em duas frentes:

- **Uso pessoal:** o carro do dia a dia.
- **Trabalho:** veículo(s) usados no trabalho, com abastecimentos pagos e documentados em nome da empresa (ex.: cupom fiscal com a empresa como destinatária).

Usa o app em dois momentos:

- **No posto**, pelo celular, logo depois de abastecer: registro rápido, muitas vezes de pé e com pressa.
- **No computador**, para conferir gastos e manutenções com calma.

## Product Purpose

Saber o que cada veículo custa e o que ele precisa, sem planilha. Sucesso é:

1. **Prestar contas sem retrabalho:** os gastos do veículo de trabalho organizados o bastante para reembolso pela empresa ou para declaração.
2. **Registrar no posto em segundos:** pelo celular, inclusive a partir da foto do recibo.
3. **Não esquecer manutenção:** aviso por data e por quilometragem (troca de óleo, revisão, pneus…).
4. **Saber quanto o carro custa:** consumo (km/l), custo por km, gasto mensal, preço médio do litro.

As quatro são prioridade; nenhuma foi declarada acima das outras.

## Positioning

Ferramenta pessoal, privada e offline: os dados nunca saem do aparelho, não há conta nem servidor, e mesmo a leitura do recibo por foto (OCR) roda no próprio dispositivo. Separa o carro pessoal do de trabalho no mesmo app.

## Operating Context

- PWA instalável, usado principalmente no celular (no posto) e também no desktop.
- Funciona offline depois do primeiro acesso, via service worker.
- Recibos reais são cupons térmicos: NFC-e e DANFE simplificado, muitas vezes desbotados, tortos ou com o cabeçalho ilegível. Exemplo verificado: "30 LT x 4,29", total impresso duas vezes.
- Dados em `localStorage`. A troca entre aparelhos e a proteção contra perda são feitas por backup em arquivo JSON (exportar/importar).

## Capabilities and Constraints

**Existe hoje:**
- Garagem com vários veículos e um veículo selecionado globalmente.
- Abastecimentos com km/l por trecho e total gasto; o preço por litro ou o total pago (um calcula o outro) e a KM aceitam o formato brasileiro ("72.600", "40,5").
- Leitura de recibo por foto: OCR local com Tesseract.js, que preenche data, litros, preço e posto para o usuário conferir.
- Manutenções por data e KM, com previsão pelo ritmo de uso.
- Dashboard com consumo, custo/km, gasto do mês, preço médio e gráficos.
- Backup e restauração em JSON, com validação.
- Desfazer exclusões.

**Restrições:**
- **Dados sempre só no aparelho** (decisão do usuário): sem conta, sem servidor, sem sincronização em nuvem. Novos recursos não podem depender de backend.
- **Stack:** HTML/CSS/JS estático, sem etapa de build, publicado na Vercel.
- **Segurança:** CSP restrita a `'self'` (mais `'wasm-unsafe-eval'` para o OCR), sem recursos de terceiros em tempo de execução, e bibliotecas hospedadas no próprio site.
- **Compatibilidade:** precisa rodar em Safari/iOS mais antigos, então nada de APIs ou sintaxe recentes sem alternativa.
- **Idioma:** pt-BR em toda a interface; números e moeda no formato brasileiro.

**Prestação de contas (existe):** aba Relatório com período (este mês, mês passado ou datas livres), totais de combustível e manutenção, lista de lançamentos, impressão/PDF em papel claro e planilha CSV. Um veículo pode ser marcado como **Trabalho** (tudo entra no relatório) ou, num veículo pessoal, **cada despesa** pode ser marcada como trabalho (na hora ou depois). Nos primeiros 10 dias do mês o relatório abre em "Mês passado". Decisões e limites: `.impeccable/surfaces/relatorio.md` e `.impeccable/surfaces/gasto-avulso.md`.

**Limites conhecidos:** em veículo pessoal, os km rodados a trabalho não são registrados, então o relatório não calcula km nesse caso. A foto do recibo é lida e descartada (não é anexada ao relatório).

**Terminologia:** Garagem (veículos), Abastecimento, Manutenção, KM (quilometragem), km/l, Posto.

## Brand Commitments

- **Nome:** AutoGest.
- **Tema sempre escuro:** decisão explícita do usuário (o tema claro automático foi testado e removido).

## Evidence on Hand

- Não há depoimentos, clientes, métricas de uso nem material de imprensa, e nada disso deve ser inventado.
- Os dados de exemplo ("Celta do dia a dia") são fictícios, gerados no primeiro acesso.

## Product Principles

1. **Privado por padrão:** nada sai do aparelho; quando um recurso pedir nuvem, a resposta é outra solução local.
2. **Registro no posto em segundos:** o fluxo de abastecimento é otimizado para celular, uma mão e pressa. Preencher automaticamente é bem-vindo, mas o usuário sempre confere antes de salvar.
3. **Números confiáveis:** custo e consumo precisam bater com os recibos. Na dúvida, mostrar menos e certo, por exemplo deixar o posto vazio em vez de chutar.
4. **Trabalho separado do pessoal:** o que é do carro de trabalho, ou a despesa avulsa de trabalho num carro pessoal, deve poder ser isolado para prestar contas.
5. **Nunca perder dados:** desfazer, backup e validação vêm antes de recursos novos.

## Accessibility & Inclusion

Padrão adotado: WCAG 2.2 AA. Já atendido em contraste, foco por teclado, modal acessível e alvos de toque de 44 px no celular. Uso no posto implica sol forte e uma mão só, por isso o contraste e os alvos grandes no celular são requisitos.
