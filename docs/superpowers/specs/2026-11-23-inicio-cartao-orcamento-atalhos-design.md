# Início mais intuitiva: cartão, gastos por categoria e atalhos

Data: 2026-11-23. Tamanho: mudança normal, só front-end.

## Intenção

O Lucas quer a tela Início (`/`, `PainelPage`) mais intuitiva e com mais informação. Ao abrir o app, ele quase sempre vai para Cartões e Orçamento logo em seguida. O que ele procura nessas telas deve subir para a Início, e o caminho até elas deve ficar mais curto.

## Objetivos

- Mostrar **1 cartão** na Início: nome, dia de vencimento, fatura do mês, barra de % do limite usado e disponível.
- Mostrar **onde mais gastou** no mês: as 3 maiores categorias de despesa, com barra e %, e um link "Ver orçamento" para `/lancamentos`.
- Trazer de volta os **atalhos rápidos** (4, configuráveis), com as rotas corrigidas.
- Manter a "Sobra do mês" inteira acima da dock inferior em 360x640 (`docs/DESIGN_SYSTEM.md`, L98 e L191).

## Fora do escopo

- Widget na tela do Android (o TWA não faz isso).
- Sincronizar preferências entre aparelhos.
- Limite ou meta de gasto por categoria (não existe no produto).
- Mudar as telas Cartões e Orçamento.

## Anti-objetivos

- Início lenta: nenhuma requisição nova além de `/api/cartoes` e `/api/categorias`. `/api/resumo` já é buscado pela Início com a chave `['resumo', ano, mes]`.
- "Sobra do mês" atrás da dock em 360x640.
- Cor fixa em TSX (`estilos.test.ts` reprova); tudo pelos tokens `--cor-*` e pelos 3 presets.

## Abordagens

- **A) Só front (escolhida).** A escolha do cartão fica em `localStorage`, junto com os atalhos (`preferenciasStorage.ts`). O cartão vem de `GET /api/cartoes?ano&mes` (`CartaoUso`: fatura, limite, limiteUsado, limiteDisponivel, uso, faixa, diaVencimento). As categorias vêm de `GET /api/resumo` (`categorias`: categoriaId, nome, total, percentual, já ordenadas por valor), e a cor e o ícone vêm de `GET /api/categorias`, juntados por `categoriaId`. Custo: a escolha não acompanha o usuário entre aparelhos, como já acontece com os atalhos.
- **B) Front e back.** Preferência no servidor (Flyway V15, entidade, DTO, endpoint) e cor/ícone dentro de `CategoriaTotal`. Sincroniza entre aparelhos; cerca do dobro do trabalho por pouco ganho.
- **C) Endpoint agregador `/api/inicio`.** Exagero: os dados já existem em três endpoints.

O Lucas deixou a escolha com o agente ("siga com base nas recomendações"); ficou a A.

## Decisões do Lucas

- 1 cartão na Início, **escolhido nas preferências**. Sem escolha, mostra o de **maior fatura do mês**.
- Os atalhos **voltam nesta mudança**, logo abaixo da saudação.
- Nova ordem dos blocos da Início (pedida pelo dono, conforme L100 do `DESIGN_SYSTEM.md`):
  1. Saudação e data
  2. Atalhos rápidos (4)
  3. Finanças do mês (Sobra, Receitas, Despesas, Próximas contas, gráfico)
  4. Cartão
  5. Onde mais gastou (top 3 categorias)
  6. Meta (`WidgetMetaInicio`)
  7. Frase do dia (`CardReflexao`)

## Detalhes

- **Atalhos:** renderizar `AtalhosRapidosMobile` na `PainelPage` com acesso ao `ModalPersonalizarAtalhos`. Corrigir em `atalhosCatalogo.tsx`: `orcamento` para `/lancamentos` e `visao-geral` para `/financeiro`. Preferências antigas que já guardam esses ids continuam válidas, porque só a rota muda.
- **Cartão:** novo campo `cartaoInicioId` nas preferências (tipo, padrão `null`, validação em `preferenciasStorage.ts`, setter no contexto). Se o id salvo não existir mais (cartão removido), usar o de maior fatura. Sem nenhum cartão, o bloco não aparece. A escolha é feita no próprio bloco (um controle "trocar cartão") e/ou na tela de preferências, como os atalhos.
- **Onde mais gastou:** usa `resumo.categorias` do mês atual, primeiras 3. Sem despesas no mês, o bloco mostra um estado vazio curto ou some (decisão do builder, ver abaixo).
- **Estados:** carregando (esqueleto do mesmo tamanho), erro (mensagem curta com tentar de novo, sem derrubar os outros blocos), vazio, texto longo (nome de cartão ou categoria comprido trunca com reticências).
- **Acessibilidade:** barra de limite e barras de categoria com o valor em texto, não só visual; alvos de toque de 44 px; o bloco do cartão tem um link "Ver cartões" para `/cartoes` (o bloco inteiro não vira link porque tem o botão "Trocar" dentro).
- **Documentação:** atualizar `docs/DESIGN_SYSTEM.md` com a ordem nova e a nova medição da Sobra em 360x640, e corrigir a L130, que hoje diz que o Painel mostra `AtalhosRapidosMobile` e `NotaFixada`.

## Restrições

- Medição em 360x640: a "Sobra do mês" precisa caber inteira acima de y ≈ 555 (início da dock).
- Testes de front com fixtures copiadas do JSON real da API (lição do #76), não no formato do front.
- Gate visual (`docs/TESTING.md`): 360, 768 e 1280, claro e escuro.

## Fica com o builder

- Visual dos blocos novos, seguindo o `DESIGN_SYSTEM.md` (cards, tokens, presets).
- Se "Onde mais gastou" some ou mostra estado vazio quando não há despesa.
- Onde fica o controle de troca do cartão (no bloco, nas preferências ou nos dois), desde que fique a 1 toque do bloco.
- Atalhos em telas largas (1280): mesma fileira ou ocultos, se a dock lateral já cobre os destinos.
