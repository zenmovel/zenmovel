# Achei Comprei Ofertas!

Landing page estática da comunidade, publicada no repositório existente `zenmovel/zenmovel`.

- URL canônica: https://zenmovel.com.br/
- Publicação preservada: branch `zenmovel-patch-1`, diretório raiz `/`, GitHub Pages com deploy nativo.
- Branch padrão: `main`. Os arquivos da entrega são sincronizados nas duas branches; o Pages continua na branch original.
- `CNAME` preservado: `zenmovel.com.br`. Não alterar DNS nem trocar a branch de publicação.
- Responsável informado: ZEN MOVEL — contato@zenmovel.com.br.
- Convite oficial: https://chat.whatsapp.com/GuXAktbMUMv31Ya7Q9BM5v
- Sem backend, banco, cadastro, redirecionamento automático ou credenciais privadas.

## Atualizar

1. Trabalhe a partir de `zenmovel-patch-1` e confira se está atualizada.
2. Edite `src/home.html` (conteúdo principal), `assets/site.css` (estilo), `assets/site.js` (consentimento e eventos), `site.config.json` (configuração) ou `scripts/build.mjs` (páginas, SEO e rodapé).
3. Com Node.js 20 ou superior, execute `npm ci`, `npm run build` e `npm test`.
4. O build valida a configuração, gera as páginas na raiz para o Pages existente e uma cópia limpa em `dist/` para teste. Não publique apenas `dist` em outra hospedagem.
5. Teste `dist` com um servidor local: `python -m http.server 8765 --bind 127.0.0.1 --directory dist`. Em outro terminal: `npm run test:browser`. O teste usa Microsoft Edge instalado e produz resultados em `test-results/`.
6. Versione fontes, páginas geradas e assets. Não versionar `dist`, `node_modules` ou resultados de teste.
7. Envie para `zenmovel-patch-1`, acompanhe o workflow nativo `pages build and deployment` e confira o domínio. Sincronize `main` somente sem sobrescrever trabalho novo.

O build não altera CNAME. Ele falha se `siteUrl` tiver outro domínio. Não existe workflow personalizado: o mecanismo nativo do GitHub Pages já publica a raiz da branch selecionada. A raiz contém arquivos de manutenção públicos (README, fontes, testes e configuração sem segredos); `dist/` é a versão mínima de teste.

## Integrações

Na entrega, GA4, Meta Pixel e AdSense estão desativados. IDs ficam vazios; não foram inventados identificadores. O convite funciona independentemente das integrações e até sem JavaScript. O site não sabe se o visitante efetivamente entrou na comunidade.

Consulte [ANALYTICS.md](ANALYTICS.md) para ativação, consentimento, relatórios e campanhas. Nunca colocar tokens, API secrets, senhas ou relatórios privados neste repositório público. IDs de medição, pixel e editor são identificadores públicos, não credenciais.

## Privacidade

O banner aparece somente quando existe uma ferramenta opcional configurada. Aceitar, recusar e personalizar são opções independentes da navegação. Nenhum script GA4, Meta ou AdSense carrega antes da permissão correspondente. Preferências expiram após 180 dias e são invalidadas quando os IDs/configuração mudam. Retirar uma permissão recarrega a página e tenta limpar cookies próprios conhecidos. O modo privado ou bloqueio de armazenamento pode impedir a persistência.

A política descreve o estado gerado pelo build. Revise-a quando a operação mudar. O gerenciador próprio não substitui CMP certificada exigida por plataformas de anúncios em certas regiões; veja a seção de AdSense. O texto não promete conformidade jurídica absoluta.

## Escopo e limitações

- Os guias são conteúdo editorial próprio; não há ofertas, descontos, avaliações ou métricas fictícias.
- Links externos e disponibilidade do convite dependem dos serviços de destino. Clique no convite não significa participação confirmada.
- Testes móveis são emulação de viewport/user agent, não testes em aparelhos físicos nem aplicativos Instagram/Facebook reais.
- Scripts externos podem ser bloqueados pelo navegador, extensões ou rede. O link do convite continua disponível.
- Os ensaios de analytics usam IDs sintéticos apenas em memória no navegador de teste, com requisições interceptadas; não enviam dados reais a fornecedores.

## Histórico e restauração

Por autorização expressa do proprietário, não foram criadas branch nem tag de backup. O histórico Git normal foi mantido; não houve force push nem reescrita do passado.

Referências anteriores à substituição:

- Site publicado (`zenmovel-patch-1`): `3105e7787d1abce45441e01e5ceaea7928604084`.
- Branch padrão (`main`): `839f26e3a635d0918f75596460f7edca3b7ff5d3`.

Para restaurar o conteúdo antigo, em um checkout limpo e atualizado da branch de publicação, use `git restore --source=3105e7787d1abce45441e01e5ceaea7928604084 --staged --worktree .`, revise o diff e CNAME, faça um novo commit e envie para `zenmovel-patch-1`. A operação reverte o conteúdo por novo commit, sem force push. Acompanhe o deploy e valide HTTPS. Não faça isso por cima de trabalho local não salvo. Restauração não foi executada na entrega.
