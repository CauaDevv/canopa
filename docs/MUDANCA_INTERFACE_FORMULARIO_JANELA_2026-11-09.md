# Registro — Mudança · Interface · Formulário em janela (só aparece ao clicar)

- Data: 2026-11-09
- Agente: Claude (Sonnet 5.5)
- Estado: concluído

## Resumo

O formulário deixou de fazer parte da página. Ele só aparece, **por cima dela**, quando alguém clica no botão
final (CTA Campo Magnético) ou em qualquer link para o contato ("Quero participar" do topo, "Contato" do menu,
"Fale com a gente" do rodapé). A página agora termina no CTA e no rodapé. Este registro **complementa**
`MUDANCA_INTERFACE_CONTATO_2026-11-09.md`, que descrevia o formulário como seção em fluxo.

## Alterações

- `src/secoes/Contato.jsx|css` — viraram uma janela (`role="dialog"`, `aria-modal`): fixa, com fundo
  escurecido e desfocado, barra com botão de fechar que acompanha a rolagem da janela (em celular o formulário é
  mais alto que a tela). Continua montada depois da primeira abertura, então fechar e reabrir **não perde o
  que foi digitado**. A entrada é animada a cada abertura (sem ScrollTrigger: a janela é fixa).
- `src/App.jsx` — controla a janela: um ouvinte de clique captura todo `a[href="#contato"]` e
  `a[href="#formulario"]` e abre a janela (nenhum link ficou quebrado); `intro-ativo` no `<html>` para a rolagem
  da página enquanto a janela está aberta (mecanismo que o `SmoothScroll` já tinha); o foco volta ao elemento que
  abriu a janela quando ela fecha.
- A janela é carregada **sob demanda** (`lazy`, bloco de ~4,6 KB gzip + 3 KB de CSS), aquecida quando o
  navegador está ocioso para o primeiro clique não esperar download.
- `src/lib/formulario.js` — avisa o formulário depois que a janela abre, para ele acender e levar o foco ao
  primeiro campo pendente.

## Decisões

- **Janela, não seção que se expande na página.** Não depende de rolagem (não há onde o Lenis "parar curto"
  quando o conteúdo ainda não existe), não desloca o layout e mantém o CTA como o último conteúdo da página.
- **Esc e o X fecham; clicar no fundo NÃO fecha**, para ninguém perder um formulário preenchido por um clique
  perdido.
- Tab não escapa da janela (foco preso enquanto aberta) e o foco inicial vai para o primeiro campo pendente.
- A entrada dos campos usa só opacidade (não `autoAlpha`): `visibility: hidden` impede o foco, e o teste mostrou
  que o foco não chegava ao primeiro campo.

## Verificação

Chromium (Playwright), API simulada: ao carregar a janela nem existe; percorrendo a página inteira nenhum elemento
do formulário aparece; clicar no CTA abre com foco em "perfil"; a rolagem de fundo fica parada; Tab não escapa; Esc
fecha e devolve o foco ao botão; "Quero participar", menu "Contato" e rodapé abrem a mesma janela; envio simulado
mostra a confirmação; no celular o botão de fechar continua visível ao rolar a janela, sem overflow. Também em
produção e com movimento reduzido. 0 erros de console.

## Pendências

1. Se preferir que clicar no fundo também feche, é uma linha em `Contato.jsx` (hoje fica de propósito sem isso).
