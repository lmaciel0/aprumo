# Visual sem cara de IA (unslop) — design

Data: 2026-11-19. Escopo: sistema todo, temas claro e escuro.

Referência de método: unslop, de Damir Sokolovsky (https://github.com/heydamir/unslop), licença CC BY 4.0. Valores de tokens, raios, tipo e movimento abaixo adaptam `skills/unslop/references/tokens.md` e `signs.md`; manter o crédito em `docs/DESIGN_SYSTEM.md`.

## Intenção

O Lucas acha que o Aprumo tem cara de "feito por IA", principalmente no tema escuro. O objetivo é que o app pareça desenhado para ele, com identidade própria, sem mudar o que o produto faz, o conteúdo nem a ordem dos blocos.

Sucesso: abrir qualquer tela, em qualquer tema, e não achar os sinais da auditoria abaixo; trocar o nome "Aprumo" por outro produto e a tela não servir mais.

## Auditoria (2026-11-19, prints de 9 telas em 360 e 1280 px, nos dois temas, mais o código de `frontend/src`)

- Cor: escuro com neutros azulados (`#0b0d13`, `#131622`, `#202538`) e destaque azul do Tailwind (`#60a5fa`, `#3b82f6`), gráfico todo azul. Claro em lavanda com texto e mutado puxando para o roxo. Degradê no fundo do shell (`--fundo-degrade`), em `CardReflexao`, `FaixaSaldo`, `ReceitasCard`, botão de auth, Metas. Brilho e sombra colorida em `index.css`, `CardCartao`, `SeletorCor`, `CardMeta`. Paleta crua do Tailwind em 8 arquivos (Metas, `CardCartao`, `CardReflexao`).
- Superfícies: vidro translúcido com `backdrop-filter: blur(8px)`.
- Tipo: peso 700 a 900 em cerca de 98 pontos; caixa-alta com tracking largo em 11 arquivos ("REFLEXÃO DO DIA", "FINANCEIRO", "CARTÃO", "AMEX"); números em formatos misturados (`−2.5k` no celular, `−2.5 mil` no desktop, ambos com ponto decimal; `-R$ 636,59` contra `– R$ 2.508,45`).
- Cantos: `rounded-full` em 128 pontos, `--raio-card` de 22 px.
- Copy: saudação "Boa noite, Lucas" com o nome em destaque; "Objetivo alcançado!", "Copiado!", "…ou reformas!"; "Concluída 🎉" (único emoji); ícone ✨ no vazio de Metas.
- Movimento: `transition-all` em 15 arquivos, `hover:scale` em 4.
- Layout: em 1280 px o card da Sobra estica com um vazio grande e "Onde você mais gastou" fica com meia altura vazia.
- O que já está bom e fica: ícones lucide consistentes, tokens organizados com testes, copy quase toda limpa, foco visível, alvos de 44 px, regras de 360 px.

## Direção

- Produto: finanças da casa e notas, para quem quer saber todo mês quanto sobra.
- Caráter: calmo, exato, caseiro.
- Mundo: o caderno de contas da casa e o prumo do pedreiro. Papel, grafite, linha reta.
- Momentos: o número da Sobra do mês, o gráfico do ano e os cartões (objeto físico, com a cor real do banco).
- Assinatura: o fio de prumo. Uma linha vertical de 2 px no tom de linha do acento que marca o "agora": o mês atual no gráfico do ano, o item ativo da navegação e a conta mais próxima de hoje em Próximas contas. Não aparece em nenhum outro lugar.

## Objetivos

1. Trocar a paleta pelos tons escolhidos pelo Lucas, nos dois temas, com contraste AA.
2. Tirar vidro, degradês, brilhos e sombras coloridas; profundidade por degraus de superfície e borda fina.
3. Tipo em pesos 400 a 600, sem caixa-alta, um formato de número.
4. Raios por tamanho, pílula só onde é forma de verdade.
5. Movimento nomeado, uma curva, sem `hover:scale`.
6. Os momentos e a assinatura.
7. Pagar a dívida de paleta crua em Metas, `CardCartao` e `CardReflexao`.

## Não objetivos

- Não mudar funcionalidade, rotas, ordem dos blocos da tela inicial nem a API.
- Não trocar a fonte (Inter fica; decisão minha, ver "Decisões do construtor").
- Não refazer ícone do app, imagem de destaque, prints da Play Store nem README nesta entrega (decisão do Lucas: PR próprio depois da fase 3). O ícone roxo `#27187E` destoa da paleta até lá; isso é aceito.
- Não instalar dependência visual nova (HeroUI, shadcn, framer-motion etc. continuam proibidos).

## Anti-objetivos (falha mesmo funcionando)

- Trocar um modismo por outro: grão, neon, bento, glass novo.
- Coral espalhado. O acento cobre poucos por cento da tela: ação principal, seleção, fio de prumo, uma série do gráfico.
- Quebrar contraste AA em qualquer tema ou preset.
- Quebrar as regras de 360 px (rolagem horizontal, dock cobrindo a Sobra, alvo menor que 44 px).
- App em produção num estado misto feio entre fases: cada fase sozinha precisa deixar o app coerente.

## Abordagens consideradas

- A. Por camadas, em fases, um PR por fase. **Escolhida pelo Lucas.** A fase de tokens sozinha já muda o app todo, com pouco risco; cada PR é revisável.
- B. Tudo num PR só. Sem estado intermediário, mas diff de mais de 60 arquivos, revisão difícil, um erro trava tudo.
- C. Tela por tela com os 9 passes completos. Mostra uma tela pronta cedo, mas repete trabalho e deixa telas vizinhas diferentes por mais tempo.

## Decisões do Lucas

- Tirar o blur de cards e superfícies (revoga a regra "o desfoque dos cards é decisão do dono e não se remove" do `DESIGN_SYSTEM.md`). Vale também para a dock e o cabeçalho: ele não escolheu a opção "blur só na dock".
- Paleta do tema claro dele: marinho `#14213D`, creme `#F4EDE0`, coral `#FF6B5B`.
- Tema escuro em grafite (rampa graphite do unslop) com o mesmo coral.
- Negativo pelo sinal: valor negativo fica na cor do texto com o sinal "−"; vermelho só em alerta (atrasada, erro, ação destrutiva).
- Presets: coral (padrão), musgo e céu. Lima, esmeralda e índigo saem.
- Saudação "Boa noite, Lucas" vira o mês ("Novembro de 2026") em peso normal, com a data do dia embaixo em texto secundário.
- Abordagem A, por camadas.
- Bom e ruim em número ficam neutros, com sinal e seta; verde e vermelho só em status.
- Ícone do app e assets da loja ficam para um PR próprio depois da fase 3.

## Paleta

Os nomes de token existentes ficam quando o papel é o mesmo, para não espalhar renomeação. Tokens novos marcados com (novo).

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| Fundo da página | `--cor-fundo` | `#F4EDE0` | `#141415` |
| Card, campo, modal | `--cor-card` | `#FBF7F0` | `#19191B` |
| Superfície elevada (linha ativa, campo, chip, botão secundário) | `--cor-elevado` (novo) | `#ECE3D3` | `#232325` |
| Borda fina e divisor | `--cor-linha` | `#DED9D0` (marinho a 10% sobre o creme) | `#2A2A2C` (texto a 8% sobre o card) |
| Texto principal | `--cor-texto` | `#14213D` | `#EDEDED` |
| Texto secundário | `--cor-secundario` (novo) | `#3A4459` | `#A1A1A6` |
| Texto mutado (meta, legenda) | `--cor-mutado` | `#5A6275` | `#85858B` |
| Acento como texto, link, borda, linha fina, fio de prumo, anel de foco e preenchimento de transição | `--cor-principal` | `#B83E31` | `#FF6B5B` |
| Texto e ícone sobre `--cor-principal` | `--cor-sobre-principal` | `#F4EDE0` | `#141415` |
| Acento vivo, só preenchimento (botão de ação principal, série despesas) | `--cor-principal-fundo` (novo) | `#FF6B5B` | `#FF6B5B` |
| Texto e ícone sobre `--cor-principal-fundo` | `--cor-sobre-principal-fundo` (novo) | `#14213D` | `#141415` |
| Botão principal neutro (quando não for o coral) | decisão do construtor | marinho com texto creme | `#EDEDED` com texto `#141415` |
| Série receitas no gráfico | `--cor-grafico-receitas` | `#14213D` | `#A9B8D6` |
| Série despesas no gráfico | `--cor-grafico-despesas` | `#FF6B5B` | `#FF6B5B` |

`--cor-principal-clara` e `--cor-principal-fim` (fim do degradê de auth) perdem o papel; o construtor remove ou aponta para os tokens novos, mantendo `designSystemDoc.test.ts` verde.

Medidas de contraste já conferidas: coral sobre creme dá cerca de 2,4:1, então o coral nunca é texto nem linha fina no claro; marinho sobre coral dá cerca de 5,7:1; `#B83E31` sobre creme dá cerca de 4,8:1; `#5A6275` sobre creme dá cerca de 5,2:1; coral sobre `#19191B` dá cerca de 6,3:1; `#85858B` sobre `#19191B` dá cerca de 4,8:1. O `estilos.test.ts` continua sendo a fonte da verdade e precisa passar com os valores finais.

Semânticos:

- Valor negativo: `--cor-texto` com "−". Nada de vermelho em número.
- Alerta e destrutivo (`--cor-negativo`, `--cor-negativo-texto`, `--cor-erro-fundo`): vermelho fechado, distinto do coral no claro (proposta `#B42318`). No escuro o vermelho fica perto do coral; isso é aceito porque alerta sempre leva texto ("atrasada", "Erro", "Excluir"). Valores finais com o construtor, respeitando 4,5:1.
- Bom e ruim em número (decisão do Lucas): tudo neutro, na cor do texto, com sinal e seta (`TrendingUp`/`TrendingDown` ou `ArrowUp`/`ArrowDown` do lucide). Vale para o mês com déficit no gráfico (`GraficoResultado`, `BarrasDoResultado`, `TooltipResultado`), o chip de variação de `CardsTotais`, `.diferenca-negativa` do relatório anual e qualquer "+12%". Os testes que conferem essas classes mudam junto.
- Positivo (`--cor-positivo*`) e negativo (`--cor-negativo*`): só status e alerta (pago, recebido, atrasada, erro, ação destrutiva), tom ajustado para sentar na paleta e passar 4,5:1 no creme.
- Aviso e ok (`--cor-aviso-*`, `--cor-ok-fundo`): recalibrar para os novos fundos.
- Cores de categoria de nota (`--cor-nota-*`): são conteúdo, ficam; só conferir 4,5:1 sobre os cards novos.

Por que o nome `--cor-principal` fica com o tom escuro (decisão minha, depois da leitura do construtor): hoje há cerca de 130 usos de `--cor-principal` como texto, borda e contorno em 58 arquivos. Com o tom escuro nesse token, todos continuam AA sem tocar nos arquivos, e o coral vivo entra só onde o componente pedir `--cor-principal-fundo`. Preenchimentos atuais com `bg-[var(--cor-principal)]` ficam em terracota `#B83E31` com texto creme (cerca de 4,8:1) até a fase 2 decidir, um a um, se viram coral vivo, neutro ou degrau.

Presets (`data-preset`), cada um troca `--cor-principal`, `--cor-sobre-principal` e `--cor-principal-fundo`; `--cor-sobre-principal-fundo` fica marinho no claro e `#141415` no escuro:

| Preset | Principal (claro) | Sobre principal (claro) | Fundo (claro) | Principal (escuro) | Fundo (escuro) |
|---|---|---|---|---|---|
| `coral` (padrão, sem atributo) | `#B83E31` | `#F4EDE0` | `#FF6B5B` | `#FF6B5B` | `#FF6B5B` |
| `musgo` | `#3F6B47` | `#F4EDE0` | `#8DB384` | `#9CC79F` | `#9CC79F` |
| `ceu` | `#245E86` | `#F4EDE0` | `#7FB3D5` | `#8EC1E3` | `#8EC1E3` |

No escuro, `--cor-sobre-principal` é `#141415` em todos os presets.

Preferência salva em `localStorage` (`aprumo-preferencias`, campo `presetCor`, hoje `'azul' | 'lima' | 'esmeralda' | 'indigo'`): migrar na leitura `azul` para `coral`, `lima` e `esmeralda` para `musgo`, `indigo` para `ceu`; valor desconhecido cai no padrão.

Cor da barra do navegador e do PWA: `theme-color` e `theme_color` passam de `#27187E` para `#14213D` (claro) e `#141415` (escuro, em `tema.ts`); `background_color` do manifest para `#F4EDE0`. Os testes `index-html.test.ts`, `manifest.test.ts`, `temaInit.test.ts` e `useTema.test.tsx` mudam junto.

## Superfície, profundidade, raio

- `.card` e `.superficie`: fundo sólido `--cor-card`, borda 1 px `--cor-linha`, sem `backdrop-filter`.
- `--fundo-degrade` sai; o shell usa `--cor-fundo` liso.
- Sombra: no claro, só neutra e pequena (`0 1px 2px rgba(20,33,61,.06)` em card; `0 8px 24px rgba(20,33,61,.08)` em coisa flutuante como dock, menu e modal). No escuro, nenhuma sombra em card; flutuante usa degrau de superfície mais borda, e pode ter destaque interno `inset 0 1px 0 rgba(255,255,255,.06)`.
- Raio: tag e chip 6; botão, campo e linha 10; card 14 (`--raio-card` de 22 para 14); painel, folha e modal 16 a 20. Raio interno = externo menos o padding, mínimo 4. Pílula (`rounded-full`) só em avatar, ponto de status, botão "Criar" circular e o interruptor de tema. A dock deixa de ser pílula e usa 16. O card de auth de 40 px e os campos de 20 px descem para a escala.
- Item ativo da navegação lateral (`Sidebar`, `DockLateral`): degrau `--cor-elevado` com o fio de prumo à esquerda (`inset 2px 0 0 var(--cor-principal)`), no lugar do bloco preenchido com o acento. Continua com texto, então a cor não é o único sinal.
- Item ativo da `DockInferior` (horizontal): degrau `--cor-elevado` com o rótulo visível, sem fio. O prumo é vertical; virado de lado seria um sublinhado comum (decisão minha).

## Tipo

- Inter continua (decisão minha: o unslop lista Inter para "preciso e calmo", e trocar a fonte não foi pedido).
- Pesos 400 e 500; 600 só para ênfase rara. Nada de 700 a 900 (`font-bold`, `font-black`, `font-extrabold`, `font-weight: 800/900` saem).
- Hierarquia por tamanho e cor. Título de página 28 px peso 500; número de destaque 28 a 32 px peso 500, `tabular-nums`.
- Sem caixa-alta com tracking: rótulos em sentence case ("Financeiro", "Reflexão do dia"). Tracking 0 abaixo de 16 px.
- Um formato de número: `−R$ 2.508,45` (sinal de menos U+2212 antes do R$, sem espaço entre sinal e R$) e abreviação com vírgula, `−2,5 mil`. Sem `k`, sem ponto decimal.
- Sem itálico como ênfase (a citação da reflexão do dia pode manter itálico só no título da obra, que é convenção bibliográfica; decisão minha).

## Movimento

- Uma curva: `cubic-bezier(0.22, 1, 0.36, 1)`. Hover e toque 120 a 180 ms; menu 160 a 220 ms; entrada e folha 300 a 500 ms (as regras atuais de 150 a 250 ms podem subir para entrada e folha).
- `transition-all` vira lista nomeada (`transition-colors`, `transition-[transform,opacity]`).
- Sem `hover:scale` em card e linha; toque pode ter escala 0,97 a 0,98.
- `animate-pulse` só onde é carregamento de verdade.
- Continua valendo: só cor, opacidade e transform; `prefers-reduced-motion` desliga tudo.

## Copy

- Sem "!" ("Objetivo alcançado", "Copiado", "…ou reformas").
- Sem emoji ("Concluída").
- Saudação vira o mês (decisão do Lucas).
- Rótulos curtos sem ponto final.

## Fases (um PR cada, com gate visual e revisão)

1. **Tokens e documento.** `index.css` (paleta, presets, superfície, sombra, raio, curva), migração do preset salvo, `theme-color` e manifest, `DESIGN_SYSTEM.md` reescrito nas seções afetadas (identidade, cores, presets, raio e superfícies, tipografia, movimento, "o que não fazer"), crédito ao unslop. Entram também, para não deixar acento espalhado entre fases, o item ativo de `Sidebar`, `DockLateral` e `DockInferior` (degrau, ver acima) e o `CardSobra` em card neutro com número grande. Ao fim, o app todo já está nas cores novas, sem vidro e sem degradê de fundo; os demais preenchimentos de acento ficam em terracota até a fase 2.
2. **Limpeza nos componentes.** Pesos, caixa-alta, pílulas, `transition-all`, `hover:scale`, formato de número, copy com "!" e emoji, saudação para o mês. Componentes que hoje pintam o item ativo com o acento passam ao degrau mais fio de prumo.
3. **Momentos.** Sobra do mês como número protagonista em card neutro (deixa de ser bloco preenchido com o acento), proporção do card da Sobra e de "Onde você mais gastou" em 1280 px sem vazio, gráfico do ano com receitas marinho, despesas coral e o fio de prumo no mês atual, Próximas contas com o fio na conta mais próxima de hoje, cartões com a cor real do banco e material neutro (grafite no escuro, creme no claro) para banco sem cor conhecida, sem brilho colorido. As cores dos bancos são dado do objeto, não tema: ficam numa constante própria (por exemplo `coresBancos.ts`), iguais nos dois temas, com variação de tom dentro do mesmo matiz permitida como material do cartão; nada de degradê entre matizes, nem roxo inventado para "Cartão" genérico (decisão minha). `FaixaSaldo`, `ReceitasCard` e `CardReflexao` sem degradê.
4. **Dívida de Metas.** `CardMeta`, `MetasPage`, `ModalMetaForm`, `ModalAporteMeta`, `CardConselheiroMetas`, `WidgetMetaInicio` e o restante de `CardReflexao` saem da paleta crua do Tailwind para tokens; ícone ✨ do vazio de Metas vira ícone lucide do mundo (por exemplo `PiggyBank` ou `Target`, escolha do construtor).

Ordem é essa. Cada fase deixa o app coerente sozinha.

## Restrições

- Ler `docs/DESIGN_SYSTEM.md` antes de qualquer tela; ele é atualizado na fase 1 e passa a valer.
- Só tokens `--cor-*`; `estilos.test.ts` reprova cor fixa em TSX.
- `designSystemDoc.test.ts` exige uma linha por token na tabela de Cores e a tabela de Presets batendo com o CSS: as tabelas do documento mudam junto com o `index.css`.
- Regras de 360 px, alvo de 44 px, foco visível e `prefers-reduced-motion` continuam.
- Código de front é do agent `frontend-developer`; gate visual com `agent-browser` (sessão `prints`, 360, 768 e 1280, claro e escuro) e `ui-ux-designer` com `accessibility-auditor`.

## Fica com o construtor

- Valores exatos de semânticos (alerta, positivo, aviso, ok) dentro das regras acima, provados pelo `estilos.test.ts`.
- Se o botão principal de cada tela é coral ou neutro (regra: uma ação principal por tela pode ser coral; as demais são secundárias).
- Ícone do vazio de Metas.
- Como dividir cada fase em tarefas.
