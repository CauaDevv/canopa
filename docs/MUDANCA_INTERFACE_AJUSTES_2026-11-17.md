# Registro — Mudança · Interface · Ajustes de login, CTA, projetos, formulário e gráficos

- Data: 2026-11-17
- Agente: Claude (Sonnet 5.5)
- Estado: concluído localmente (não publicado)

## Resumo

Seis ajustes pedidos pelo dono, mais o fundo do hero. Cada item foi reproduzido ou medido antes de corrigir.

## 1. Tela de login sem rolagem para os lados

**Causa (medida):** as ondas decorativas (`.lines`, SVG girado) passavam da borda e alargavam a tela: 206 px de
rolagem lateral no desktop e 247 px no celular; além disso o cartão de 670 px fixos gerava 82 px de rolagem
vertical em notebooks baixos (a esticada vinha também das ondas).
**Correção:** as ondas ficam numa camada fixa que recorta (`.login-fundo`, `overflow: hidden`), a página rola só no
eixo vertical (`overflow-x: hidden`, `touch-action: pan-y`) e o cartão acompanha a altura da tela. Resultado medido:
0 px de rolagem lateral em todos os tamanhos e 0 px vertical em 1365×638, 1280×600, 1920×1080 e 390×844. Num
celular de 360×640 ainda sobra rolagem vertical (223 px), de propósito: o conteúdo não cabe e o teclado virtual
piora; sem ela o botão ficaria inalcançável.

## 2. CTA "Campo Magnético" sem botão de pausar

Removidos o botão, o estado `paused`, o ouvinte e o CSS (`CampoMagnetico.jsx`, `lib/campo.js`, `CampoMagnetico.css`).
A animação continua parando fora da tela, com a aba oculta e com movimento reduzido (quem pediu menos movimento
recebe a grade estática). Observação de acessibilidade: o critério 2.2.2 das WCAG pede um controle para pausar
movimento que dura mais de 5 s; o dono decidiu tirar, e o `prefers-reduced-motion` segue como a saída para quem precisa.

## 3. Projetos clicáveis (ficha do projeto)

Cada cartão da página **Projetos** abre uma ficha no mesmo leitor dos relatórios (`relatorios/ProjetoDetalhe.jsx`,
`relatorios/detalhe.js`): capa, números, retorno do investimento (anel), geração mensal, antes e depois da conta,
jornada com datas e os relatórios que falam do projeto (que abrem no leitor e voltam à ficha). Projeto em
instalação (Creche Tia Maria) tem outra ficha: andamento da obra, previsão e jornada com etapas futuras.
- Os dados comuns à ficha e aos relatórios (datas da jornada, conta de antes, painéis instalados) moram em
  `relatorios/projetos.js`, para os dois lerem o **mesmo** número. A ficha fecha com a lista (investimento igual).
- A ficha e o leitor são carregados sob demanda (a lista não paga por eles).
- **Bug achado nos testes:** abrir a ficha direto (ao voltar de um relatório) derrubava o painel, porque a animação
  da lista rodava sem a lista. A lista agora é um componente próprio.

## 4. Espaçamento entre a lista de relatórios/projetos e a nota final

`.rel-lista + .pn-nota` e `.pn-projetos + .pn-nota`: 48 px (eram 20 px, colados na sombra do último cartão).

## 5. Formulário: "Falta: …" apontava o telefone mesmo preenchido

**Causa (reproduzida):** o painel agrupava e-mail e telefone numa etapa só e listava "e-mail e telefone" sempre que
qualquer um dos dois faltava; com um e-mail errado, o telefone certo também voltava para a lista.
**Correção:** o texto sai campo a campo (`seu nome`, `seu e-mail`, `seu telefone`), e o que está preenchido mas
errado pede a correção (`um e-mail válido`, `o telefone com DDD`, `uma mensagem com pelo menos 10 caracteres`), com
"e" no último item. Antes: "FALTA: SEU NOME, E-MAIL E TELEFONE, A MENSAGEM." depois de o telefone estar completo.

## 6. Toque nos gráficos no celular

**Causas:** a rosca selecionava por `pointerenter`/`pointerleave`, e no toque o "sair" dispara ao levantar o dedo
(a seleção sumia na hora); o toque podia virar seleção de texto e abrir a busca do Chrome ("Toque para ver os
resultados da pesquisa", visível no print); e o alvo de cada fatia era o próprio `<path>`.
**Correção (rosca):** a fatia sob o dedo é calculada por geometria (distância ao centro e ângulo), com 5 px de folga
para o dedo; tocar no miolo ou fora do anel limpa; tocar de novo na fatia desmarca; as legendas alternam; só o foco
de teclado seleciona; `user-select: none` no gráfico e na legenda. Mouse e teclado continuam como antes.
**Mesma classe de erro corrigida em:** barras dos relatórios (`Barras.jsx`) e gráfico do simulador
(`SimuladorGrafico.jsx`): no toque o valor fica até tocar fora (`hooks/useToqueFora.js`). Testado com um celular
simulado: 13 verificações na rosca.

## Hero: fotos de fundo mais visíveis

Dois "apagadores" reduzidos, sem tocar na legibilidade do texto: o véu branco (`.hero-depth:after`) agora só
clareia o miolo atrás do texto; a névoa do túnel WebGL caiu de 0,035 para 0,02, a opacidade das fotos subiu de
0,85 para 1 e há mais fotos no corredor (chance de 0,16→0,26 nas paredes e 0,09→0,15 no teto). O texto continua
sobre o véu; a comparação visual foi feita no desktop e no celular.

## Verificação

Chromium (Playwright), com a API simulada: login (5 tamanhos), status do formulário (8 estados), rosca (toque, 13
verificações), fichas dos 4 projetos (desktop e celular), relatórios e simulador. Todas as suítes passam em
desenvolvimento e na build de produção.

## Pendências

1. Sem teste em aparelho físico, Safari ou Firefox (`:has()`, `container-type`, `color-scheme`).
2. A seleção por toque nas barras das fichas e nos relatórios usa a mesma regra da rosca; a barra segmentada
   ("Para onde foi cada real") ainda destaca só por hover/foco, sem alternar no toque.
