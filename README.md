# TagRun

**O pega-pega da vida real.**

TagRun é uma experiência de pega-pega presencial com apoio de mapa, GPS e comunicação entre participantes.

## Direção atual do projeto

A primeira versão será desenvolvida como **site responsivo**, acessível pelo navegador do celular, tablet e computador. A versão Android/iOS será iniciada depois que a primeira versão web estiver funcional.

## Prévia web

A interface web inicial usa React + TypeScript + Vite e reutiliza as regras puras de partida já existentes.

### O que já funciona nesta prévia
- Interface responsiva com identidade visual inicial do TagRun.
- Criar uma partida local com nome, duração e quantidade de pegadores.
- Iniciar e encerrar a partida.
- Cronômetro local baseado em timestamps.
- Registrar uma captura local uma única vez.
- Salvar e recuperar a partida no armazenamento do navegador.

### Limites desta prévia
- A partida ainda existe somente no navegador/dispositivo atual.
- Não há salas multiplayer, convites ou sincronização entre jogadores.
- O mapa exibido é apenas uma representação visual; GPS e mapa real ainda não estão conectados.
- O radar ainda não está conectado à partida web.
- O funcionamento offline entre aparelhos exige uma camada de comunicação local que ainda será desenvolvida e testada.

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
npm install
npm run web
```

Para gerar a versão estática:

```bash
npm run build:web
```

O resultado será criado na pasta `dist/`, pronta para hospedagem estática, por exemplo no Cloudflare Pages.

## Requisitos centrais do produto

- Uma pessoa organiza a partida e configura as regras.
- Participantes entram em uma sala compartilhada.
- O sistema recomenda a quantidade de pegadores; o organizador pode ajustar.
- Papéis de pegador e fugitivo são distribuídos para a partida.
- Fugitivos registram o toque presencial pelo botão **FUI PEGO**.
- O jogo acompanha tempo, participantes, capturas e resultado.
- O produto deve continuar útil sem internet, com mapa previamente baixado, GPS local e registro de eventos.
- GPS não transmite a localização para outros celulares. Comunicação offline entre aparelhos precisa ser implementada e testada; não será prometido alcance ilimitado.

## Documentação

- [Especificação do produto](docs/PRODUCT_SPEC.md)
- [Arquitetura e decisões técnicas](docs/TECHNICAL_ARCHITECTURE.md)
