# TagRun — Arquitetura e decisões técnicas

## 1. Objetivo arquitetural

Construir primeiro para Android, com separação suficiente para suportar iOS posteriormente. O requisito mais difícil é a comunicação entre celulares sem internet; ele deve ser validado antes de depender dele para o fluxo principal.

## 2. Separação por camadas

### Aplicativo
- Interface e navegação.
- Estado da sala e da partida.
- Regras específicas de cada modo.
- Permissões, GPS, notificações e vibração.

### Núcleo compartilhado
- Participantes, salas e convites.
- Estado da partida e relógio sincronizado.
- Eventos (entrada, saída, captura, pausa, encerramento).
- Localização com timestamp e indicador de validade.
- Adaptador de comunicação, sem acoplar as regras a uma tecnologia de rádio específica.

### Dados
- Banco local para estado e fila de eventos.
- Serviço online para criação de salas, autenticação e sincronização quando houver internet.
- Resolução de conflitos baseada em eventos identificados de forma única e ordenados por versão/tempo de origem, sem confiar apenas no relógio do aparelho.

## 3. Estratégia online/offline

O aplicativo deve distinguir explicitamente:
- **Online:** servidor disponível e sincronização ativa.
- **Offline local:** aparelho opera com dados já baixados e registra eventos localmente.
- **Conectividade entre pares:** aparelhos conseguem trocar dados diretamente por uma tecnologia local.
- **Desconectado:** não há internet nem caminho local até determinado participante.

Não apresentar a posição de outro participante como atual se não houver atualização recente. Cada posição deve carregar timestamp e estado de confiança/atualidade.

## 4. Comunicação entre dispositivos

Tecnologias a avaliar em protótipo:
- Bluetooth Low Energy: descoberta e troca de pequenos eventos, com alcance limitado.
- Wi‑Fi Direct ou rede Wi‑Fi local: maior capacidade, mas compatibilidade e comportamento variam por sistema e fabricante.
- Malha com retransmissão: pode estender o alcance quando existe uma cadeia de aparelhos conectados, mas não cria cobertura onde não há nós intermediários.
- Soluções com hardware externo só devem ser consideradas se a experiência desejada não puder ser atendida pelos celulares.

A escolha final depende de testes em aparelhos reais, permissões do Android, execução em segundo plano, consumo de bateria e estratégia futura para iOS. Não assumir que uma API Android terá equivalente direto no iOS.

## 5. Mapas offline

O mapa precisa ser preparado/baixado antes da partida. A implementação deverá verificar:
- Fonte e licença dos dados cartográficos.
- Política de cache e uso offline do provedor.
- Armazenamento por região.
- Indicador de área ainda não baixada.
- Atualização dos pacotes de mapa.

## 6. Localização

- Solicitar somente as permissões necessárias e explicar por que são usadas.
- Tratar permissão negada, GPS desligado e precisão reduzida.
- Registrar timestamp, precisão reportada e origem de cada atualização.
- Não usar GPS como prova de captura física.
- Testar funcionamento com tela apagada e restrições de bateria.

## 7. Integridade de eventos

- Cada evento deve ter identificador único.
- Captura deve ser idempotente: o mesmo evento não pode contar duas vezes.
- Guardar eventos localmente antes de tentar sincronizar.
- Preservar trilha de auditoria para correções administrativas.
- Definir política de conflito quando dois aparelhos enviarem estados incompatíveis.

## 8. Tecnologias candidatas — ainda não aprovadas

- React Native + TypeScript para a aplicação.
- SQLite para persistência local.
- MapLibre para renderização cartográfica, sujeito à validação da fonte/licença dos mapas offline.
- Camada nativa Android para recursos de localização em segundo plano e comunicação entre dispositivos.
- Backend online a escolher; Supabase é uma possibilidade, não uma decisão fechada.

A seleção deve considerar maturidade, suporte Android/iOS, permissões, manutenção e testes offline. Não iniciar dependência irreversível antes do protótipo de comunicação.

## 9. Fases técnicas

1. Validar comunicação offline entre Androids e mapear limitações.
2. Definir stack e criar estrutura mínima do aplicativo.
3. Implementar persistência local e sincronização de eventos.
4. Implementar mapa offline e localização.
5. Implementar salas e participantes online.
6. Implementar comunicação local e estados de conectividade.
7. Implementar regras da primeira modalidade e radar.
8. Testar em aparelhos reais, inclusive tela apagada, distâncias variadas e reconexão.
9. Preparar compatibilidade iOS com base nos resultados dos testes.

## 10. Decisões pendentes prioritárias

- Quantidade recomendada de pegadores por total de participantes.
- Percentual/quantidade de fugitivos que precisam ser capturados para vencer.
- Forma de desenhar a área de jogo.
- Parâmetros do radar.
- Comportamento do radar durante perda de conexão.
- Tecnologia de comunicação local suportada e alcance realista.
- Backend e autenticação.
- Política de privacidade, retenção e exclusão de dados.
