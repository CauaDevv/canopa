# Registro — Adição · Interface · Painel do cliente (visão a partir do admin)

- Data: 2026-11-09
- Agente: Claude (Sonnet 5.5)
- Estado: concluído (com dados de demonstração)

## Resumo

Depois do login, a conta admin passa a ter a casca de painel do Acelera Catálogo (barra lateral escura agrupada
e recolhível, topo com caminho, cartões) e o botão **"Ir ao painel de cliente"**. Ele abre a **visão do cliente**,
sinalizada por uma faixa dourada ("Você está vendo o painel como cliente · Dados de demonstração · Voltar ao painel
admin"), com métricas, rosca de investimento e projetos ativos como na imagem de referência.

## Alterações

- `src/painel/` (novo, carregado sob demanda: `lazy` em `App.jsx`, chunk de ~29 KB que não pesa na landing):
  `AcessoAdmin` (login + escolha do modo), `PainelAdmin` (mensagens, busca, resumo, perfil lido da mensagem),
  `PainelCliente`, `PainelShell` (casca compartilhada), `PaginaVisaoGeral`, `PaginaProjetos`, `Metrica`,
  `RoscaInvestimento`, `TabelaProjetos`, `dados-demo.js`, `formatos.js`, `painel.css`.
- `src/components/Accounts.jsx` removido (o formulário de contato e a API foram separados; ver registro do contato).
- `src/styles/acesso.css` — ficou só a tela de entrada; o CSS do painel mora em `painel/painel.css`.

## Visão do cliente

- **Visão geral:** faixa escura de abertura com o sol da marca; 4 métricas (a primeira em dourado, as outras em
  petróleo, contagem animada); rosca "Painel de impacto"; tabela "Projetos ativos" com filtro por status.
- **Projetos:** busca e cartões com as 4 etapas do projeto (as mesmas da "Jornada" do site), potência, economia e CO₂.
- **Impacto e Relatórios:** no menu como "em breve" (desabilitados).
- Acessível: pular para o conteúdo, `aria-current`, menu em gaveta com `inert` no celular, valores das métricas
  em texto para leitor de tela (sem ouvir a contagem), tabela vira cartões no celular, `prefers-reduced-motion`.

## Dados de demonstração (importante)

Tudo em `painel/dados-demo.js` é **fictício**: parceiros, beneficiários e valores servem só para mostrar a visão.
Os totais não são digitados, **saem da soma dos projetos** (R$ 145.000, R$ 37.560, 22,5 t, 25,9%), então
métricas, rosca e tabela sempre fecham entre si. A tela avisa "Dados de demonstração" na faixa dourada, na nota
de rodapé e no cartão de CO₂ ("Estimativa de demonstração").

## Decisões

- **A visão do cliente é uma pré-visualização, não uma fronteira de segurança.** Ela vive dentro da sessão admin
  já autenticada (token só em memória). Contas de cliente reais exigem backend: autenticação própria e dados
  filtrados por cliente no servidor. Esconder uma tela no React não protege nada.
- **Rosca em vez de barra segmentada, como na referência.** A skill `dataviz` desaconselha a rosca (a base
  `ui-ux-pro-max` a aceita com ≤ 6 partes e alternativa em tabela). Foi mantida pela referência visual, com as
  salvaguardas: 3 partes, a maior às 12h, cor por categoria (não por posição), vão de 2–3 unidades entre fatias,
  legenda sempre visível com valor e %, valor no centro ao passar o mouse/focar, `aria-label` com todas as partes.
- **Paleta validada** com `validate_palette.js` (modo claro): `#0589a3` (escolas), `#e19b00` (creches), `#3f9d6e`
  (institutos e ONGs). Passam em faixa de luminosidade, croma e separação para daltonismo (ΔE ≥ 9,9). O dourado
  tem contraste 2,3:1 com o branco, o que **obriga** rótulos visíveis (por isso a legenda nunca some).
- Status sempre com ícone + texto (nunca só cor).

## Verificação

- Chromium (Playwright), login e API simulados: admin → "Ir ao painel de cliente" → visão geral → filtro →
  Projetos → busca → recolher menu → "Voltar ao painel admin" → sair; hover na rosca mostra "Escolas · R$ 52.000 ·
  35,9% do total". Métricas lidas do DOM: R$ 145.000 · R$ 37.560 · 22,5 toneladas · 25,9%.
- Celular 390px: sem overflow, gaveta de menu, tabela em cartões. Movimento reduzido: valores já finais, sem contagem.
- Build de produção: 0 erros, 0 requisições falhas, 0 imagens quebradas (desktop, celular e movimento reduzido).

## Pendências

1. **Modelo de dados real:** projetos, parceiros, beneficiários, investimento, economia e potência precisam de
   tabelas e rotas na API (`worker/`), com permissão por cliente.
2. **Método do CO₂:** o site promete "estimativas com fontes e premissas". Definir fator de emissão, fonte e
   período antes de mostrar o número como real (o valor de 22,5 t da demonstração é só ilustrativo).
3. **Autenticação de cliente** (hoje só existe a conta admin) e fluxo de convite.
4. Páginas "Impacto" e "Relatórios" (desabilitadas no menu).
5. O painel admin lê o perfil pela primeira linha da mensagem (`Perfil: …`). Se o perfil virar uma coluna própria
   no banco, trocar o parser em `PainelAdmin.jsx`.
