# IoT Control — MQTT em React Native

Checkpoint 3 — Mobile Development & IoT (FIAP).

Aplicativo mobile em **React Native + Expo + TypeScript** que monitora e controla um ambiente inteligente simulado via **MQTT sobre WebSocket**. O app recebe leituras de **temperatura** e **umidade** em tempo real e liga/desliga uma **lâmpada virtual**. O estado exibido da lâmpada vem sempre da confirmação publicada pelo dispositivo, não do toque no botão.

## Integrantes

| Nome completo | RM |
|---|---|
| Ricardo Di Tilia | RM555155 |
| Bento Rangel | RM559124 |
| Eric Yuji | RM554869 |
| Kaue Pires | RM554403 |
| Higor Batista | RM558907 |

## Tecnologias

| Tecnologia | Versão |
|---|---|
| Expo SDK | 58 (`expo ~58.0.19`) |
| React Native | 0.88.0 |
| React | 19.3.0 |
| TypeScript | ~6.0.3 |
| Expo Router (navegação por abas) | ~58.0.26 |
| mqtt (MQTT.js) | ^5.16.1 |
| @react-native-async-storage/async-storage | 2.2.0 |
| Node.js (simulador) | 20+ (testado com 24) |

## Instalação e execução

```bash
git clone <url-deste-repositorio>
cd <pasta>
npm install

# 1) Em um terminal: inicie o simulador do dispositivo
npm run simulator

# 2) Em outro terminal: inicie o app
npx expo start
```

No terminal do Expo, pressione `a` (Android), `i` (iOS) ou `w` (Web), ou leia o QR code com o **Expo Go**. O app conecta automaticamente ao broker padrão ao abrir.

Outros comandos:

```bash
npm test           # testes da validação de payloads
npm run typecheck  # checagem de tipos (tsc --noEmit)
```

## Broker MQTT

| Item | Valor |
|---|---|
| Broker | HiveMQ público (sem login) |
| URL usada no app | `wss://broker.hivemq.com:8884/mqtt` |
| Protocolo / porta | WebSocket seguro (WSS), porta **8884**, caminho `/mqtt` |

> A porta **1883** é MQTT TCP e **não** funciona no app (React Native/Web só falam WebSocket). A URL pode ser alterada em **Configurações**. Ela fica salva no AsyncStorage. Nenhuma credencial é usada nem versionada.

Alternativa: `wss://broker.emqx.io:8084/mqtt`. Para usar outro broker no simulador: `MQTT_URL=<url> npm run simulator`.

## Tópicos MQTT

Tópico base exclusivo do grupo: **`fiap/3ess/iotctl-x7k3q`** (definido em `src/services/topics.ts` e `simulator/simulator.js`).

| Tópico | Direção no app | Payload | Quem publica |
|---|---|---|---|
| `fiap/3ess/iotctl-x7k3q/sensor/temperatura` | Subscribe | `{"value":24.5}` | Simulador (a cada 5 s) |
| `fiap/3ess/iotctl-x7k3q/sensor/umidade` | Subscribe | `{"value":58}` | Simulador (a cada 5 s) |
| `fiap/3ess/iotctl-x7k3q/lampada/comando` | Publish | `{"action":"ON"}` / `{"action":"OFF"}` | App |
| `fiap/3ess/iotctl-x7k3q/lampada/estado` | Subscribe | `{"state":"ON"}` / `{"state":"OFF"}` | Simulador (após cada comando, com `retain`) |

Payloads fora desse formato (JSON inválido, `value` não numérico, `state` diferente de `ON`/`OFF`) são ignorados pela interface e aparecem no histórico marcados como **inválida**. O app não quebra.

## Simulador

`simulator/simulator.js` é um cliente MQTT em Node que faz o papel do dispositivo:

- publica temperatura (15–35 °C) e umidade (30–90 %) com variação aleatória a cada `INTERVAL_MS` (padrão 5000 ms);
- assina `lampada/comando` e, ao receber `ON`/`OFF`, publica o novo estado em `lampada/estado` (com `retain`, então o app recebe o estado atual assim que conecta);
- ignora e registra no console comandos inválidos.

```bash
npm run simulator
# variáveis opcionais:
MQTT_URL=wss://broker.emqx.io:8084/mqtt BASE_TOPIC=fiap/3ess/iotctl-x7k3q INTERVAL_MS=2000 npm run simulator
```

### Roteiro de verificação (ciclo completo)

1. Rode `npm run simulator` e abra o app. O Dashboard mostra **Conectado**.
2. Em até 5 s a **temperatura** e a **umidade** atualizam sozinhas, com o horário.
3. Toque em **Ligar**. Aparece "Aguardando confirmação…".
4. O simulador recebe o comando (`<-` no console) e publica `{"state":"ON"}`.
5. O app mostra a lâmpada **Ligada**.
6. Repita com **Desligar**. O app mostra **Desligada**.
7. Pare o simulador e toque em Ligar. Após 5 s o app avisa que o dispositivo não confirmou.
8. Em Configurações, toque em **Desconectar** e depois em Ligar. O app avisa que não há conexão e não publica.

### Sem o script (cliente MQTT manual)

Em qualquer cliente MQTT (ex.: [MQTTX](https://mqttx.app) ou o [HiveMQ WebSocket Client](https://www.hivemq.com/demos/websocket-client/)), conecte em `broker.hivemq.com`, porta `8884`, SSL ligado, caminho `/mqtt`:

- publique `{"value":26}` em `fiap/3ess/iotctl-x7k3q/sensor/temperatura`;
- assine `fiap/3ess/iotctl-x7k3q/lampada/comando` e, ao ver `{"action":"ON"}`, publique `{"state":"ON"}` em `fiap/3ess/iotctl-x7k3q/lampada/estado`.

## Telas e funcionalidades

| Dashboard | Histórico | Configurações |
|---|---|---|
| ![Dashboard](docs/dashboard.png) | ![Histórico](docs/historico.png) | ![Configurações](docs/configuracoes.png) |

- **Dashboard:** status da conexão (conectando / conectado / desconectado / erro, com mensagem e botão **Reconectar**), cards de temperatura e umidade com o último valor e o horário, e o estado da lâmpada com botões Ligar/Desligar. Mostra o feedback de "aguardando confirmação", de falta de conexão e de timeout.
- **Histórico:** as 10 mensagens mais recentes (enviadas e recebidas), com direção, tópico, payload e horário. Atualiza em tempo real.
- **Configurações:** URL do broker (salva no AsyncStorage), Conectar/Desconectar, restaurar a URL padrão e alternância de tema **Light/Dark** (salva no AsyncStorage). O tema vale para todas as telas.

## Organização do código

```text
simulator/simulator.js        # dispositivo simulado (Node)
src/
  app/                        # rotas (Expo Router)
    _layout.tsx               # carrega preferências e monta os providers
    (tabs)/_layout.tsx        # navegação por abas
    (tabs)/index|history|settings.tsx
  components/                 # Button, ConnectionStatus, SensorCard, MessageItem
  context/                    # MqttContext (estado MQTT), ThemeContext (tema)
  screens/                    # DashboardScreen, HistoryScreen, SettingsScreen
  services/
    mqttService.ts            # toda a comunicação MQTT, isolada da interface
    storageService.ts         # AsyncStorage (URL do broker e tema)
    payload.ts                # validação dos payloads recebidos (+ payload.test.ts)
    topics.ts                 # tópicos e broker padrão
  themes/colors.ts            # paletas light/dark
  types/mqtt.ts               # tipos de status, mensagens e leituras
```

- O `mqttService` expõe `onStatus`/`onMessage`, que retornam funções de remoção. O `MqttContext` registra os listeners num `useEffect` e os remove no cleanup, então não há eventos duplicados.
- `disconnect()` cancela as inscrições (`unsubscribe`), remove os listeners do cliente e encerra a conexão.
- Reconexão automática a cada 5 s após queda (`reconnectPeriod`), além do botão **Reconectar**.

## Limitações e observações

- O broker público do HiveMQ é compartilhado e sem autenticação. Qualquer pessoa pode publicar nos tópicos. Por isso o tópico base é exclusivo do grupo e todo payload é validado.
- Broker público pode ter instabilidade ou latência. Se não conectar, teste a URL alternativa da EMQX (no app e no simulador).
- Redes corporativas/universitárias podem bloquear a porta 8884. Nesse caso, use outra rede ou o 4G.
- QoS 0 em todas as mensagens: suficiente para telemetria; uma confirmação perdida gera o aviso de timeout.
- O histórico fica só em memória (requisito: enquanto o app está aberto).
