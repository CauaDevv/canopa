# Registro — Mudança · Interface · Contato (formulário e CTA final)

- Data: 2026-11-09
- Agente: Claude (Sonnet 5.5)
- Estado: concluído

## Resumo

O formulário de contato foi redesenhado e ganhou, logo antes dele, o componente **CTA Campo Magnético**
(enviado pelo Cauã) adaptado ao CANOPA. Clicar no botão rola até o formulário, que "acende" e leva o foco
ao primeiro campo pendente. O contrato com a API (`POST /messages`: name, email, phone, message) **não mudou**.

## Alterações

- `src/secoes/CampoMagnetico.jsx|css` — o CTA portado de HTML para React (canvas, ímã do mouse, ondas,
  anel de texto, piloto automático, botão Pausar). Adaptado: fundo verde-petróleo, traços que esquentam de
  verde-petróleo → turquesa → dourado, tipografia da marca, textos do CANOPA (anel: o lema "Energia que conecta ·
  Impacto que ilumina"; chamada: "Boas parcerias se atraem. Comece a sua."; botão: "Quero participar").
- `src/components/FormularioContato.jsx|css` — formulário novo: escolha de perfil em cartões (empresa,
  instituição, outro parceiro), campos com rótulo sempre visível, máscara de telefone, validação ao sair do campo
  (erro com ícone + texto + `role="alert"`), contador da mensagem, envio com carregando/erro/sucesso,
  "Tentar de novo" sem perder o que foi digitado, tela de sucesso com o sol se desenhando.
- `src/secoes/Contato.jsx|css` — painel escuro + cartão claro emendados num bloco. Cada etapa concluída acende uma
  parte do símbolo do sol no painel (perfil = horizonte, nome = disco, contato = raios, mensagem = haste), com
  texto de status em `aria-live` ("Falta: …", "Tudo pronto. É só enviar!").
- `src/lib/api.js` — o acesso à API saiu de dentro do componente (formulário e painel usam o mesmo).
  `src/lib/formulario.js` — evento que liga o CTA ao formulário.
- `src/App.jsx` — ordem: … → Faixa → **CampoMagnetico** → Contato.

## Decisões

- **O perfil viaja na mensagem**: primeira linha `Perfil: Instituição`, linha em branco, texto. Assim aparece no
  painel admin sem mexer no servidor nem no banco. O painel lê esse formato (`painel/PainelAdmin.jsx`); mensagens
  antigas, sem a linha, continuam aparecendo normalmente.
- **O CTA fica imediatamente antes do formulário** (final do conteúdo da página). Clicar rola para baixo até o
  cartão. Para colocá-lo depois do formulário basta trocar a ordem em `App.jsx`.
- **Nenhum texto afirma o que o site não afirma.** O componente original trazia "Acesso imediato · Garantia de 7
  dias · Pix ou 12x"; foi trocado por fatos do próprio site ("Para empresas e instituições", "Acompanhamento e
  transparência", "Projeto em desenvolvimento").
- No hover do botão o texto continua azul-petróleo (no original ficava branco, ilegível sobre o dourado).
- Telefone continua obrigatório porque o servidor o exige (`!phone` retorna 400). Aceita `+` para números
  internacionais; sem `+`, exige DDD (10 ou 11 dígitos).
- Licença do componente: uso liberado em projetos próprios e de clientes; proibido revender/redistribuir como
  template, kit, curso ou produto. O aviso de autoria foi mantido no topo de `CampoMagnetico.jsx` e `.css`.

## Verificação

- Chromium (Playwright) com a API **interceptada** (nada foi gravado no banco real): enviar vazio mostra os 5 erros e
  não faz requisição; e-mail inválido é apontado ao sair do campo; máscara `(81) 99999-0000`; progresso
  3 de 4 → 4 de 4; falha da API mantém os dados e oferece "Tentar de novo"; sucesso mostra a tela de confirmação e
  leva o foco ao título. Corpo enviado: `{"name","email","phone","message":"Perfil: …\n\n…"}`.
- CTA: o canvas desenha o campo, reage ao mouse, o clique rola até o formulário (cartão a 75px do topo) e o foco
  chega ao primeiro campo pendente. Com movimento reduzido o campo fica estático, sem botão Pausar.
- Celular (390px): sem overflow horizontal, campos de 16px (sem zoom no iOS), nenhum alvo de toque < 44px.
- **Bug encontrado e corrigido durante o teste:** o cartão do formulário entrava com `x: 50px` também no celular;
  antes de rolar até ele, isso alargava a viewport do Chrome mobile e a página inteira "encolhia" (425px). No
  celular a entrada agora é vertical.

## Pendências

1. Testar com um aparelho físico e em Safari/Firefox (o teste foi em Chromium com WebGL por software).
2. A rota `POST /messages` não limita a taxa de envios nem tem proteção anti-spam (só valida campos). Considerar
   Turnstile/honeypot antes de divulgar o site.
3. O texto do status de progresso e as mensagens de erro estão em português fixo, sem camada de tradução.
