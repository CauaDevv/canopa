# Registro — Adição · Interface · Simulador de economia

- Data: 2026-11-09
- Agente: Claude (Sonnet 5.5)
- Estado: concluído (local; ainda não publicado)

## Resumo

Nova seção entre "O sol nasce para todos" (Impacto) e "Informação para gerar confiança": o **simulador de
economia**. A pessoa arrasta a conta de luz da instituição, escolhe a região e o reajuste da energia e vê, na
hora, quanto um projeto de energia solar economizaria em 25 anos, em quanto tempo se paga, o tamanho do
sistema (placas e kWp), o investimento estimado e o CO₂ evitado. É a ponta "instituição" da história do CANOPA
em números; o investimento é o que uma empresa parceira apoiaria.

Foi adaptado de um componente enviado pelo usuário (© 2026 Upward Creative Academy; licença: uso em projetos
próprios e de clientes, sem revenda), **reescrito em React** e com o modelo, os textos e a paleta do CANOPA
(verde-petróleo, turquesa e o dourado do sol no lugar do azul-marinho e do amarelo originais).

## Alterações

- `src/secoes/Simulador.jsx|css` — a seção (copy, controles e cartão de resultado). O cartão é um componente
  separado e memoizado: os números rolando (60 quadros/s) não re-renderizam os controles.
- `src/secoes/SimuladorGrafico.jsx` — gráfico de economia acumulada em SVG, desenhado em pixels reais
  (o texto não encolhe no celular), com guia vertical + painel de valor ao passar o mouse, tocar ou usar as setas.
- `src/lib/simulador.js` — o modelo (funções puras) e as premissas nomeadas, cada uma com sua fonte.
- `src/hooks/useAnimado.js` — faz a lista de números "rolar" até o novo alvo, continuando de onde estava se
  o alvo muda no meio; movimento reduzido recebe o valor final na hora.
- `src/hooks/useDicaDeslizar.js` — quando o controle aparece, a conta desliza sozinha uma vez; para na
  primeira interação e não roda com movimento reduzido.
- `src/App.jsx` — `<Simulador />` entre `Impacto` e `Confianca`.
- `src/painel/formatos.js` → `src/lib/formatos.js` — passou a ser usado pelo site e pelo painel; os 6 imports
  do painel foram atualizados.

## O que mudou em relação ao componente original

| Original | CANOPA |
| --- | --- |
| Casa de família, conta de R$ 150 a 3.000 | Escolas, creches e ONGs: R$ 300 a 6.000 (inicial R$ 1.800) |
| "Se paga em", "Sistema", "Economia/mês" | "Se paga em", **"Investimento"** (o que o parceiro apoiaria), "Economia/mês" |
| Sem CO₂ | **CO₂ evitado em 25 anos** (indicador central do painel do cliente) |
| Grade de 24 quadrados (acendia tudo acima de 24 placas) | Grade de 36; cada quadrado vale N placas e a tela diz quanto |
| Custo R$ 3.900/kWp, cobertura 95% | R$ 3.200/kWp, cobertura 90%, **+1% ao ano de manutenção** (mais conservador) |
| CTA "Quero meu orçamento" | "Quero participar": abre a janela do formulário (o formulário só aparece ao clicar) |
| Fontes Kumbh Sans/Source Code Pro (Google Fonts) | Barlow Condensed e DM Sans da marca, já self-hosted |
| Marca-d'água "−95%" atrás do cartão | Removida: poluía os controles e o sol já faz a decoração |
| Sem hover/tabela no gráfico | Painel de valor (mouse, toque e teclado) e tabela com as premissas |

## Modelo e premissas (todas visíveis na tela, em "Ver tabela e premissas")

| Premissa | Valor | Fonte / critério |
| --- | --- | --- |
| Custo do sistema | R$ 3.200 por kWp instalado | Faixa de R$ 2,4 a 3,2/Wp em Greener e Solfácil (2024-25); cotação pública de 2025 em ~R$ 3,2 mil/kWp. Usada a ponta alta |
| Manutenção | 1% do custo por ano | Limpeza, seguro e troca do inversor ao longo da vida útil |
| Tarifa | R$ 0,95/kWh com impostos | Valor típico; muda por distribuidora |
| Cobertura da conta | 90% | O resto é taxa mínima e encargos |
| Perda das placas | 0,5% ao ano | Típico |
| Rendimento do sistema | 80% | Calor, cabos, inversor, sujeira |
| Horas de sol/dia | Norte 4,6 · Nordeste 5,5 · Centro-Oeste 5,2 · Sudeste 4,9 · Sul 4,4 | Médias regionais aproximadas (Atlas Brasileiro de Energia Solar) |
| Reajuste da energia | 5% ao ano (ajustável de 3% a 10%) | Escolha da pessoa |
| CO₂ | 38,5 g por kWh | Fator médio do SIN em 2023 (MCTI), conferido em pesquisa |

O fator de CO₂ do Brasil é baixo de propósito (rede majoritariamente renovável): o número de toneladas é
pequeno e honesto, em vez de inflado com o fator de países com rede a carvão. O MCTI mudou a metodologia em
2025 (inclui solar, eólica e biomassa) e o fator de abril/2025 foi 28,9 g/kWh. Usamos 2023 (38,5 g/kWh), o
último ano cheio que consegui verificar; com o fator novo o CO₂ evitado seria ainda menor (~25% a menos), então
o número da tela deve ser lido como ordem de grandeza. Vale conferir a série atual no SIRENE do MCTI.

Resultado com os valores iniciais (R$ 1.800, Sudeste, 5%): 27 placas (14,5 kWp), investimento de R$ 46.402,
economia de R$ 1.620/mês, se paga em 2 anos e 4 meses, R$ 849.058 em 25 anos e 18,5 t de CO₂ evitadas.
**Os valores são nominais** (somam o reajuste ano a ano, sem trazer a valor presente), e isso está dito na tela.

## Decisões

- **Por que "instituição" e não "casa".** O site fala de escolas e ONGs economizando para direcionar recursos às
  suas atividades; o simulador responde exatamente a essa frase da seção "Impacto".
- **Tom da marca.** O site promete estimativas "com suas fontes e premissas" e se declara projeto em
  desenvolvimento. Por isso a tela diz "Estimativa", mostra todas as premissas e não faz promessa de contrato.
- **Gráfico (skill dataviz):** uma série só, sem legenda (o título diz o que é) e sem eixo duplo; linha de 2px,
  ponto de 10px com anel da cor do cartão; rótulos em tinta de texto, nunca na cor da série; grade de 1px;
  y em números redondos (500 mil, 1 mi); hover/foco com valor do ano; tabela equivalente; contraste do
  dourado sobre o verde-petróleo de 3,7:1 a 7,4:1 conforme o ponto do degradê (marcas pedem 3:1) e textos do
  cartão a partir de 4,5:1 (medido; o primeiro rascunho tinha texto auxiliar a 4,0:1 e foi corrigido).
- **Acessibilidade:** controles com rótulo e `aria-valuetext`; regiões em `fieldset`/`legend`; alvos de toque
  de 44px ou mais (chips, trilhos, resumo); gráfico focável com setas, Home, End e Esc; leitor de tela recebe
  só o resultado final (frase com atraso de 0,7 s), não cada passo do arrasto.
- **Desempenho:** a animação de entrada só é montada quando a seção chega perto da tela (`useQuandoPerto`); o
  sol só gira enquanto a seção está visível; brilho do sol em gradiente (não `box-shadow` de 260px). Peso: +5 KB
  de JS e +2,4 KB de CSS (gzip).
- **Dois detalhes que custaram um ajuste:** (1) o `radial-gradient` do brilho e dos raios do sol usava a
  referência padrão (canto mais distante) e passava da borda da seção, ficando cortado em linha reta —
  trocado por `closest-side`; (2) as regras globais de `input`/`label` do `base.css` (campos do formulário) se
  aplicariam aos controles, então cada um zera o que não quer herdar.

## O formulário

Continua fora da página: só aparece na janela aberta pelos botões de contato (incluindo o novo "Quero
participar" do simulador). Confirmado de novo nesta rodada: ao carregar nem existe no DOM e, depois de
percorrer a página inteira, continua invisível. Está descrito em `MUDANCA_INTERFACE_FORMULARIO_JANELA_2026-11-09.md`.

## Verificação

Chromium (Playwright), com a API simulada (nenhuma mensagem real é criada), em desenvolvimento e na build:
- cálculo: a economia cresce com a conta (R$ 136 mil < R$ 849 mil < R$ 2,83 mi); Nordeste exige menos placas
  que Sul (24 × 30); extremos do controle por teclado (Home/End);
- gráfico: painel de valor com mouse e com teclado, some ao sair, Esc fecha, tabela com as 6 linhas;
- dica de movimento: desliza sozinha e para na primeira interação; com movimento reduzido não roda;
- CTA abre a janela do formulário e Esc a fecha; sem erros de console; sem overflow horizontal em 1440 e 390 px;
  viewport do celular continua 390; alvos de toque ≥ 44px;
- Lighthouse na build (celular emulado, CPU 4×): nota 65 (faixa já registrada 59–74), FCP 1,9 s, LCP 3,4 s,
  CLS 0, 627 KiB; desktop: nota 99, CLS 0.

## Pendências

1. **As premissas são genéricas.** Tarifa, custo por kWp e cobertura devem ser conferidos com quem entende do
   negócio do CANOPA (tarifa das distribuidoras que atendem as instituições, custo real dos fornecedores).
   Estão todas em `PREMISSAS`, em `src/lib/simulador.js`; mudar o número muda a tela inteira.
2. **Quem paga o sistema** ainda não está definido no repositório. A tela chama o valor de "Investimento" e o
   texto liga a economia à instituição e o investimento ao parceiro; se o modelo for outro, o texto muda.
3. O simulador não leva os valores para o formulário (o CTA só abre o contato). Dá para pré-preencher a
   mensagem com o resultado, se fizer sentido.
4. Não testado em aparelho físico, Safari ou Firefox.
