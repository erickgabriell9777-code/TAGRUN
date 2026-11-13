# TagRun — Especificação do produto

## 1. Visão

TagRun é um aplicativo de apoio a jogos presenciais de pega-pega. O aplicativo organiza partidas, mostra o mapa da área, acompanha participantes e aplica regras digitais. A captura continua sendo um acontecimento físico entre jogadores.

## 2. Plataforma

- Primeira plataforma: Android.
- Diretriz: arquitetura preparada para iOS.
- Interface principal pensada para celular em orientação retrato.

## 3. Papéis da partida

- **Organizador:** cria a sala, configura a partida, define a área e inicia/encerra o jogo.
- **Pegador:** procura os fugitivos dentro da área.
- **Fugitivo:** tenta evitar ser pego e registra a captura quando houver toque presencial.

A quantidade de pegadores será híbrida: o sistema recomenda uma quantidade conforme o total de participantes, e o organizador pode ajustar. A tabela e os limites exatos ainda precisam ser definidos.

## 4. Fluxo previsto

1. Tela inicial.
2. Criar partida ou entrar em uma partida.
3. Sala de espera com participantes.
4. Configuração da partida e da área permitida.
5. Sorteio/atribuição dos papéis.
6. Mapa da partida com cronômetro, estado do radar e contador de capturas.
7. Encerramento e resultado.
8. Histórico de partidas.

## 5. Regras já discutidas

- O número de pegadores é recomendado pelo sistema e ajustável pelo organizador.
- O botão **FUI PEGO** fica com o fugitivo, que registra o toque presencial.
- O sistema deve impedir que a mesma captura seja contabilizada duas vezes.
- O objetivo de capturas deve representar uma parte dos fugitivos, mas o percentual ou cálculo exato ainda está **a definir**.
- O exemplo anterior de “7 de 9” era apenas ilustrativo, não uma regra fixa.

## 6. Radar

Diretrizes já escolhidas:
- Radar global e sincronizado para todos os pegadores.
- Mesmo intervalo, duração de visibilidade, alcance e horário de ativação para os pegadores.
- Ativação automática, sem depender de cada pegador apertar um botão.

Ainda precisa ser decidido:
- Intervalo entre ativações.
- Duração da janela de visibilidade.
- Alcance.
- Aviso antecipado.
- Se as posições são fotografadas no início ou atualizadas durante a janela.
- Se fugitivos recebem alguma informação sobre a ativação.
- Comportamento quando um aparelho perde comunicação ou GPS.

## 7. Mapa e localização

- Usar mapa geográfico real.
- Exibir a posição do próprio aparelho, limites da área, alcance do radar e participantes detectados conforme as regras.
- Exibir a idade/estado da localização; posição antiga nunca pode parecer posição ao vivo.
- O organizador define a área de jogo.

Método de delimitação (raio, polígono ou ambos) ainda **a definir**.

## 8. Offline: requisito e limite

O aplicativo deve oferecer funcionamento offline real para os recursos que podem operar localmente:
- Mapa baixado previamente.
- GPS local do aparelho.
- Cronômetro e regras previamente distribuídas.
- Registro local de capturas e outros eventos.
- Fila de sincronização para quando a internet voltar.

Para que aparelhos separados compartilhem posições e eventos sem internet, será necessária comunicação entre dispositivos. Bluetooth, Wi‑Fi Direct e redes locais têm limitações de alcance, compatibilidade e execução em segundo plano. Uma rede em malha só alcança aparelhos conectados por uma cadeia de retransmissão. O projeto deve medir essas limitações em aparelhos reais e não prometer alcance ilimitado.

## 9. Segurança e privacidade

Requisitos de produto:
- Área de jogo claramente visível.
- Orientações para não entrar em ruas, propriedades ou locais perigosos.
- Possibilidade de pausar/encerrar a partida.
- Compartilhamento de localização limitado à partida e aos participantes autorizados.
- Estados claros para GPS indisponível, permissão negada, bateria/restrição em segundo plano e conexão perdida.
- Coletar apenas os dados necessários e definir retenção/exclusão do histórico.

## 10. Modos futuros

A arquitetura deve permitir novos modos sem reescrever mapa, sala, participantes e comunicação. Os nomes e regras dos modos futuros ainda não estão aprovados.

## 11. Critérios de aceitação da primeira versão

- Criar e entrar em uma sala.
- Exibir corretamente participantes e papéis.
- Configurar e exibir uma área de jogo.
- Executar cronômetro e regras sem depender de internet após a preparação.
- Registrar captura uma única vez e atualizar o estado local.
- Identificar claramente dados de localização desatualizados.
- Recuperar e sincronizar eventos após reconexão.
- Testar a comunicação offline entre múltiplos Androids em diferentes distâncias e condições.
- Não iniciar uma partida quando condições essenciais de segurança ou comunicação não estiverem atendidas.
