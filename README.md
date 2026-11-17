# TagRun

**O pega-pega da vida real.**

TagRun é um aplicativo para organizar partidas presenciais de pega-pega usando os celulares dos participantes como mapa, GPS e ferramenta de comunicação da partida.

## Objetivo inicial

Desenvolver primeiro para **Android**, mantendo a arquitetura preparada para uma versão futura para **iOS**.

## Conceito da primeira modalidade

- Uma pessoa organiza a partida e configura as regras.
- Os participantes entram em uma sala.
- O sistema recomenda a quantidade de pegadores conforme o número de participantes; o organizador pode ajustar essa quantidade dentro dos limites definidos.
- Os papéis de pegador e fugitivo são atribuídos para a partida.
- Os pegadores procuram os fugitivos dentro da área definida.
- O fugitivo registra que foi pego pelo botão **FUI PEGO** após o toque presencial.
- A partida acompanha tempo, participantes, capturas e resultado.

## Requisito central: funcionamento offline

O TagRun deve continuar útil sem internet: mapa previamente baixado, GPS local, cronômetro, regras e registro local de eventos.

**Limite técnico importante:** GPS permite que cada aparelho descubra sua própria posição, mas não transmite essa posição aos demais. Para compartilhar posições e eventos sem internet, será necessário implementar e testar comunicação local entre aparelhos. Nenhuma solução deve prometer comunicação offline ilimitada entre celulares.

## Princípios do projeto

- Priorizar segurança física e privacidade dos participantes.
- Indicar claramente quando uma posição estiver desatualizada ou indisponível.
- Não tratar GPS como prova de toque físico.
- Evitar perda de dados quando a conexão cair e sincronizar eventos quando possível.
- Manter as regras da partida separadas da infraestrutura compartilhada, permitindo novos modos no futuro.

## Documentação

- [Especificação do produto](docs/PRODUCT_SPEC.md)
- [Arquitetura e decisões técnicas](docs/TECHNICAL_ARCHITECTURE.md)

## Aplicativo — protótipo 0.1.0

A primeira base do aplicativo foi iniciada com Expo + React Native + TypeScript.

### O que já existe no protótipo
- Tela inicial com identificação do jogador.
- Fluxo local de configuração e sala de espera.
- Configuração de duração e quantidade de pegadores.
- Tela de partida com cronômetro funcional.
- Solicitação de permissão e leitura da localização GPS do próprio aparelho.
- Registro local do botão **FUI PEGO** e tela de resultado.

### O que ainda NÃO está implementado
- Salas reais entre vários celulares.
- Comunicação entre aparelhos sem internet.
- Mapa real, mapas offline e marcadores de outros jogadores.
- Sorteio e distribuição real de papéis.
- Sincronização de capturas, radar e resultados entre participantes.
- Testes em aparelhos físicos e validação de compilação.

### Como iniciar o protótipo
Com Node.js instalado:
```bash
npm install
npx expo start
```
Depois, abra o projeto no Expo Go para testar a interface e o fluxo local.

## Status

A base inicial do aplicativo está no repositório, mas ainda é um **protótipo local**, não uma versão multiplayer pronta. As decisões ainda marcadas como **a definir** não devem ser tratadas como requisitos fechados.
