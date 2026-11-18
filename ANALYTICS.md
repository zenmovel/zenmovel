# Métricas, campanhas e publicidade

## Estado inicial

Não há coleta pelo GA4 ou Meta Pixel, e nenhum anúncio é carregado. Os campos de IDs em `site.config.json` estão vazios. O AdSense está `enabled: false`; `ads.txt` contém somente um comentário e não autoriza nenhum editor. A hospedagem pode manter seus próprios registros técnicos, conforme a política do GitHub.

## GA4

1. Use uma propriedade GA4 de sua conta e um fluxo Web para `https://zenmovel.com.br`.
2. Copie o ID público `G-...` para `ga4Id` em `site.config.json`, revise privacidade, execute o build e publique.
3. Não instale outra tag GA4 via GTM ou outro mecanismo. Desative a medição automática de mudanças de histórico e de cliques externos se quiser usar somente os eventos desta implementação. O código envia um `page_view` explícito, com `send_page_view: false`, e um `whatsapp_invite_click` por acionamento (com proteção de 750 ms contra duplo toque).
4. Teste no Tempo real/DebugView ou Tag Assistant com consentimento concedido. O teste local usa stubs e não valida a propriedade real. Bloqueadores e recusas reduzem a amostra.
5. O evento inclui `link_placement` (header, hero, steps, bottom, contact), domínio de destino e campanha. Cadastre `link_placement` como dimensão personalizada com escopo de evento se quiser comparar botões.
6. Não marque o evento como entrada na comunidade. Caso seja configurado como evento principal, nomeie-o explicitamente como clique no convite.

Google Signals e personalização de anúncios ficam desabilitados no GA4. A URL enviada ao GA4 não inclui query string; origem de referência é limitada à origem do domínio. Campos `campaign_source`, `campaign_medium`, `campaign_name`, `campaign_content`, `campaign_term` e `campaign_id` usam UTMs válidas. Não enviamos `user_id` nem dados de formulário.

## Onde ver os indicadores

Use a interface privada do GA4; o site não tem painel público nem credenciais de consulta.

| Indicador | Como interpretar/ver |
| --- | --- |
| Visitantes | Usuários totais ou ativos em relatórios; escolher uma definição e mantê-la |
| Visualizações | Contagem de `page_view` em Páginas e telas |
| Cliques no convite | Contagem de `whatsapp_invite_click` em Eventos |
| Pessoas que clicaram | Usuários com o evento `whatsapp_invite_click`, em Explorações |
| Taxa por visitante | Usuários únicos que clicaram / usuários únicos que visitaram a landing, no mesmo período × 100 |
| Cliques por visualização | Eventos de clique / visualizações da landing × 100; pode superar 100% se houver mais de um clique por visita |
| Origem/campanha | Aquisição de tráfego e Explorações por origem/mídia/campanha da sessão |
| Dispositivos | Categoria de dispositivo nos relatórios de tecnologia ou Explorações |

Filtre o caminho `/` quando calcular indicadores da landing; os guias também geram visualizações. Use o mesmo período, fuso e filtros no numerador e denominador. Não misture número de eventos com usuários únicos. Não existem métricas reais anteriores à ativação, e cliques não comprovam novas participações.

Para gasto Meta / cliques no convite, importe os gastos do mesmo período e campanha e divida pelo número de cliques consentidos observados. Nomeie como custo por clique no convite medido no site. Esse resultado não é o CPC de link exibido pela Meta, cujo denominador é outro, e não é custo por participante adquirido. Sem dados de gasto, não é possível calcular custo real.

## UTMs

Exemplo de URL de campanha (sem qualquer dado pessoal):

`https://zenmovel.com.br/?utm_source=instagram&utm_medium=paid_social&utm_campaign=comunidade_ofertas&utm_content=criativo_a`

Suporte a `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` e `utm_id`. Valores aceitam letras ASCII, números, hífen e sublinhado, com até 100 caracteres. Utilize rótulos de campanhas, nunca nome, e-mail ou telefone. UTMs não são anexadas ao convite nem armazenadas antes do consentimento. Após consentimento, parâmetros desconhecidos e fragmentos são retirados da barra de endereço antes de carregar terceiros. IDs de clique como `fbclid` não são preservados: isso reduz sinais de atribuição da Meta em favor de minimização de dados.

## Meta Pixel

Coloque o ID público em `metaPixelId`, revise a política e publique o build. O carregamento exige consentimento de mensuração de campanhas. Eventos: `PageView` e `WhatsAppInviteClick` via `trackCustom`. Não é disparado `Lead`, `Purchase` ou evento de entrada confirmada. AutoConfig é desativado e não há correspondência avançada. Confirme a recepção em Testar eventos no Gerenciador de Eventos com sua conta; só esse teste valida o Pixel real. Não há Conversions API ou credenciais de servidor.

## AdSense: preparação, não aprovação

O site não foi aprovado ou submetido ao AdSense por esta implementação. Três guias originais e páginas institucionais foram incluídos, mas isso não garante elegibilidade. Para fortalecer a candidatura, mantenha guias úteis e atualizados, desenvolva mais conteúdo próprio com profundidade e informações claras sobre a operação. Revise políticas, qualidade e tráfego antes de solicitar análise.

Para ativar no futuro:

1. Obtenha aprovação e IDs oficiais em sua conta. Não use identificadores de exemplo.
2. Revise os países de audiência e implemente a solução de consentimento exigida pelo Google; para regiões sujeitas à exigência, configure uma CMP certificada com TCF e faça a integração real. O diálogo próprio NÃO é CMP certificada nem emite sinais TCF. O campo `consentIntegrationReady` é uma trava administrativa, não uma implementação de CMP.
3. Preencha `publisherId` (`ca-pub-...`) e `slotId`, configure a integração de consentimento de fato, e só então marque `consentIntegrationReady: true` e `enabled: true`.
4. Execute o build. `ads.txt` é gerado com o editor informado e o bloco responsivo aparece somente após consentimento de publicidade. O slot fica entre os guias e as dúvidas, identificado como “Publicidade”, longe do botão principal.
5. Valide autorização de domínio, ads.txt, sinais de consentimento e entrega real no painel AdSense. Se não houver anúncios ou a rede bloquear o script, não há promessa de preenchimento.

Não há anúncios automáticos, atualização periódica de blocos, incentivo a clicar ou publicidade disfarçada de convite. AdSense permanece desativado na entrega porque IDs, aprovação e CMP não foram fornecidos.

## Referências oficiais

- [Configuração do GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
- [Medição de visualizações](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Implementação do Meta Pixel](https://developers.facebook.com/docs/meta-pixel/implementation/)
- [Exigências Google de CMP](https://support.google.com/adsense/answer/13554116)
- [ads.txt no AdSense](https://support.google.com/adsense/answer/7532444)

As exigências dos fornecedores podem mudar. Verifique a documentação antes de ativar.
