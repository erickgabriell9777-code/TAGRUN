import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { createMatch, finishMatch, getRemainingSeconds, hasLocalCapture, registerCapture, startMatch, type MatchSession } from "./src/domain/match";
import { clearMatch, loadMatch, saveMatch } from "./src/storage/matchStorage";
import { getLocationFreshness, formatLocationAge, type DeviceLocation } from "./src/domain/location";
import { isInsideMatchArea, validateMatchAreaRadius } from "./src/domain/area";

type Screen = "home" | "setup" | "lobby" | "game" | "results";
const COLORS = { bg: "#07111F", panel: "#101F32", panel2: "#162A40", cyan: "#35D6E8", white: "#F4F8FC", muted: "#91A4B8", red: "#FF647C", green: "#53D69A" };

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerName, setPlayerName] = useState("");
  const [duration, setDuration] = useState("10");
  const [pegadores, setPegadores] = useState("1");
  const [match, setMatch] = useState<MatchSession | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [clock, setClock] = useState(Date.now());
  const [locationFix, setLocationFix] = useState<DeviceLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState("Localização ainda não solicitada");
  const [areaRadius, setAreaRadius] = useState("300");
  const [areaMessage, setAreaMessage] = useState("");
  const [storageWarning, setStorageWarning] = useState("");

  useEffect(() => {
    let active = true;
    loadMatch().then((saved) => {
      if (!active) return;
      if (saved) {
        setMatch(saved);
        setPlayerName(saved.playerName);
        setDuration(String(saved.durationSeconds / 60));
        setPegadores(String(saved.captorCount));
        setScreen(saved.status === "waiting" ? "lobby" : saved.status === "running" ? "game" : "results");
        if (saved.status === "running" && getRemainingSeconds(saved) === 0) {
          const finished = finishMatch(saved);
          setMatch(finished);
          setScreen("results");
        }
      }
    }).catch(() => {
      if (active) setStorageWarning("Não foi possível recuperar a última partida salva.");
    }).finally(() => {
      if (active) setRestoring(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (restoring || !match) return;
    saveMatch(match).then(() => setStorageWarning("")).catch(() => setStorageWarning("Falha ao salvar localmente. Verifique o espaço disponível no aparelho."));
  }, [match, restoring]);

  useEffect(() => {
    if (screen !== "game") return;
    const timer = setInterval(() => setClock(Date.now()), 500);
    return () => clearInterval(timer);
  }, [screen]);

  const remaining = useMemo(() => match ? getRemainingSeconds(match, clock) : 0, [match, clock]);

  useEffect(() => {
    if (screen === "game" && match?.status === "running" && remaining <= 0) {
      const finished = finishMatch(match);
      setMatch(finished);
      setScreen("results");
    }
  }, [screen, match, remaining]);

  useEffect(() => {
    if (screen !== "game") return;
    let active = true;
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          if (active) setLocationMessage("Permissão negada. Ative a localização nas configurações do celular.");
          return;
        }
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
          (position) => {
            if (!active) return;
            setLocationFix({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: position.timestamp });
            setLocationMessage("");
          }
        );
        if (!active) subscription.remove();
      } catch {
        if (active) setLocationMessage("Não foi possível acompanhar o GPS. Verifique se a localização está ativada.");
      }
    })();
    return () => { active = false; subscription?.remove(); };
  }, [screen]);

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const Button = ({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) => (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabledButton]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );

  const createRoom = () => {
    try {
      const created = createMatch({ playerName, durationMinutes: Number(duration), captorCount: Number(pegadores) });
      setMatch(created);
      setScreen("lobby");
    } catch (error) {
      Alert.alert("Confira as configurações", error instanceof Error ? error.message : "Não foi possível criar a partida.");
    }
  };

  const beginMatch = () => {
    if (!match) return;
    setMatch(startMatch(match));
    setClock(Date.now());
    setScreen("game");
  };

  const markCaptured = () => {
    if (!match) return;
    setMatch(registerCapture(match));
  };

  const returnHome = async () => {
    try {
      await clearMatch();
      setMatch(null);
      setScreen("home");
      setLocationFix(null);
      setLocationMessage("Localização ainda não solicitada");
    } catch {
      Alert.alert("Aviso", "Não foi possível limpar a partida salva neste aparelho.");
    }
  };

  if (restoring) {
    return <SafeAreaView style={styles.safe}><StatusBar style="light" /><View style={styles.loading}><Text style={styles.logo}>TAG<Text style={{ color: COLORS.cyan }}>RUN</Text></Text><Text style={styles.muted}>Recuperando partida salva...</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>TAG<Text style={{ color: COLORS.cyan }}>RUN</Text></Text>
          <Text style={styles.tagline}>O pega-pega da vida real.</Text>
        </View>

        {screen === "home" && <>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>BEM-VINDO AO JOGO</Text>
            <Text style={styles.heading}>A rua virou{"\n"}seu campo de jogo.</Text>
            <Text style={styles.muted}>Crie uma partida ou continue uma experiência local de teste.</Text>
          </View>
          <Text style={styles.label}>SEU NOME</Text>
          <TextInput value={playerName} onChangeText={setPlayerName} placeholder="Como quer aparecer?" placeholderTextColor={COLORS.muted} style={styles.input} maxLength={20} />
          <Button label="CRIAR PARTIDA" onPress={() => setScreen("setup")} />
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Modo offline local</Text>
            <Text style={styles.muted}>Configuração, cronômetro e eventos da partida ficam salvos neste celular. Isso ainda não conecta jogadores de aparelhos diferentes.</Text>
          </View>
        </>}

        {screen === "setup" && <>
          <Text style={styles.eyebrow}>NOVA PARTIDA</Text>
          <Text style={styles.heading}>Configure a caçada.</Text>
          <Text style={styles.label}>DURAÇÃO (1 A 180 MINUTOS)</Text>
          <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" style={styles.input} />
          <Text style={styles.label}>QUANTIDADE DE PEGADORES</Text>
          <TextInput value={pegadores} onChangeText={setPegadores} keyboardType="number-pad" style={styles.input} />
          <View style={styles.infoCard}><Text style={styles.cardTitle}>Antes de começar</Text><Text style={styles.muted}>Escolha uma área segura, longe de vias movimentadas e locais proibidos. Todos devem concordar com os limites da partida.</Text></View>
          <Button label="CRIAR SALA DE ESPERA" onPress={createRoom} />
          <Button label="VOLTAR" secondary onPress={() => setScreen("home")} />
        </>}

        {screen === "lobby" && match && <>
          <Text style={styles.eyebrow}>SALA DE ESPERA • SALVA NO APARELHO</Text>
          <Text style={styles.heading}>Tudo pronto?</Text>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Sua partida</Text>
            <Text style={styles.muted}>Organizador: {match.playerName}</Text>
            <Text style={styles.muted}>Pegadores configurados: {match.captorCount}</Text>
            <Text style={styles.muted}>Duração: {match.durationSeconds / 60} minutos</Text>
            <Text style={styles.code}>LOCAL • {match.id.slice(-6).toUpperCase()}</Text>
          </View>
          <Text style={styles.label}>RAIO DA ÁREA DE JOGO (METROS)</Text>
          <TextInput value={areaRadius} onChangeText={setAreaRadius} keyboardType="number-pad" style={styles.input} />
          <Text style={styles.note}>Defina o centro usando o GPS deste aparelho. Escolha uma área segura, sem atravessar ruas movimentadas ou locais proibidos.</Text>
          <Button label="DEFINIR CENTRO PELO MEU GPS" secondary onPress={async () => {
            try {
              const radius = validateMatchAreaRadius(Number(areaRadius));
              const permission = await Location.requestForegroundPermissionsAsync();
              if (!permission.granted) { setAreaMessage("Permissão de localização necessária para definir a área."); return; }
              const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              setMatch({ ...match, area: { center: { latitude: position.coords.latitude, longitude: position.coords.longitude }, radiusMeters: radius } });
              setAreaMessage("Centro e raio da área salvos nesta partida.");
            } catch (error) { setAreaMessage(error instanceof Error ? error.message : "Não foi possível definir a área."); }
          }} />
          {!!match.area && <Text style={styles.muted}>Área definida: raio de {match.area.radiusMeters} m • centro {match.area.center.latitude.toFixed(5)}, {match.area.center.longitude.toFixed(5)}</Text>}
          {!!areaMessage && <Text style={styles.note}>{areaMessage}</Text>}
          <Text style={styles.note}>Esta sala ainda é local. Participantes de outros celulares e convites multiplayer ainda não estão conectados.</Text>
          <Button label="INICIAR TESTE DE PARTIDA" onPress={beginMatch} />
          <Button label="VOLTAR AO INÍCIO" secondary onPress={returnHome} />
        </>}

        {screen === "game" && match && <>
          <Text style={styles.eyebrow}>PARTIDA EM ANDAMENTO • DADOS LOCAIS</Text>
          <Text style={styles.heading}>Caçada!</Text>
          <View style={styles.timerCard}><Text style={styles.label}>TEMPO RESTANTE</Text><Text style={styles.timer}>{formatTime(remaining)}</Text></View>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>⌖</Text>
            <Text style={styles.cardTitle}>LOCALIZAÇÃO DO APARELHO</Text>
            {locationFix ? <>
              <Text style={styles.muted}>{locationFix.latitude.toFixed(5)}, {locationFix.longitude.toFixed(5)}</Text>
              <Text style={styles.muted}>Precisão aproximada: {Math.round(locationFix.accuracy ?? 0)} m</Text>
              <Text style={[styles.note, getLocationFreshness(locationFix, clock) === "stale" && styles.warning]}>{getLocationFreshness(locationFix, clock) === "fresh" ? "GPS AO VIVO • atualizado " + formatLocationAge(clock - locationFix.timestamp) + " atrás" : "POSIÇÃO DESATUALIZADA • última leitura " + formatLocationAge(clock - locationFix.timestamp) + " atrás"}</Text>
            </> : <Text style={styles.muted}>{locationMessage || "Aguardando primeira leitura do GPS..."}</Text>}
            {match.area && locationFix ? <Text style={[styles.note, isInsideMatchArea(locationFix, match.area) ? styles.muted : styles.warning]}>{isInsideMatchArea(locationFix, match.area) ? "DENTRO DA ÁREA DE JOGO" : "FORA DA ÁREA DE JOGO"} • raio de {match.area.radiusMeters} m</Text> : <Text style={styles.note}>Defina uma área antes da partida para acompanhar o limite local. O mapa visual e os outros participantes ainda não estão implementados.</Text>}
            <Text style={styles.note}>A posição e o limite são verificados neste aparelho; não há sincronização multiplayer ainda.</Text>
          </View>
          <View style={styles.infoCard}><Text style={styles.cardTitle}>Eventos registrados</Text><Text style={styles.muted}>Captura local: {hasLocalCapture(match) ? "registrada" : "nenhuma"}</Text><Text style={styles.muted}>Total de eventos: {match.events.length}</Text></View>
          <Button label={hasLocalCapture(match) ? "CAPTURA JÁ REGISTRADA" : "FUI PEGO"} disabled={hasLocalCapture(match)} onPress={markCaptured} />
          <Button label="ENCERRAR TESTE" secondary onPress={() => { setMatch(finishMatch(match)); setScreen("results"); }} />
        </>}

        {screen === "results" && match && <>
          <Text style={styles.eyebrow}>FIM DA PARTIDA</Text>
          <Text style={styles.heading}>Partida encerrada.</Text>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Resumo do teste</Text>
            <Text style={styles.muted}>Jogador local: {match.playerName}</Text>
            <Text style={styles.muted}>Captura registrada neste aparelho: {hasLocalCapture(match) ? "Sim" : "Não"}</Text>
            <Text style={styles.muted}>Eventos registrados: {match.events.length}</Text>
            <Text style={styles.muted}>Tempo restante: {formatTime(getRemainingSeconds(match))}</Text>
            <Text style={styles.code}>SALVO NESTE APARELHO</Text>
          </View>
          <Button label="NOVA PARTIDA" onPress={returnHome} />
        </>}

        {!!storageWarning && <Text style={styles.warning}>{storageWarning}</Text>}
        <Text style={styles.footer}>TAGRUN • VERSÃO 0.2.0 • PROTÓTIPO OFFLINE LOCAL</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, paddingTop: 34, paddingBottom: 40 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: { marginBottom: 36 },
  logo: { color: COLORS.white, fontSize: 27, fontWeight: "900", letterSpacing: 2 },
  tagline: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  hero: { backgroundColor: COLORS.panel, borderRadius: 22, padding: 22, marginBottom: 26, borderWidth: 1, borderColor: "#203A52" },
  eyebrow: { color: COLORS.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 12 },
  heading: { color: COLORS.white, fontSize: 31, lineHeight: 37, fontWeight: "800", marginBottom: 12 },
  muted: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  label: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 9, marginTop: 14 },
  input: { backgroundColor: COLORS.panel, borderColor: "#29445E", borderWidth: 1, borderRadius: 13, color: COLORS.white, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: COLORS.cyan, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 12 },
  buttonText: { color: "#04121D", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  secondaryButton: { backgroundColor: COLORS.panel2, borderWidth: 1, borderColor: "#29445E" },
  secondaryButtonText: { color: COLORS.white },
  disabledButton: { opacity: 0.45 },
  spacer: { height: 18 },
  note: { color: "#71879D", fontSize: 11, lineHeight: 17, marginTop: 16 },
  warning: { color: COLORS.red, fontSize: 12, lineHeight: 18, marginTop: 16 },
  infoCard: { backgroundColor: COLORS.panel, borderRadius: 17, padding: 18, borderWidth: 1, borderColor: "#203A52", marginVertical: 18, gap: 8 },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: "800", marginBottom: 5 },
  code: { color: COLORS.cyan, fontSize: 15, fontWeight: "900", letterSpacing: 1.5, marginTop: 10 },
  timerCard: { backgroundColor: COLORS.panel, borderRadius: 20, padding: 22, alignItems: "center", marginVertical: 14 },
  timer: { color: COLORS.cyan, fontSize: 56, fontWeight: "900", fontVariant: ["tabular-nums"] },
  mapPlaceholder: { minHeight: 190, backgroundColor: "#0C1D2B", borderRadius: 20, borderWidth: 1, borderColor: "#29445E", alignItems: "center", justifyContent: "center", padding: 20, marginVertical: 12 },
  mapIcon: { color: COLORS.cyan, fontSize: 40, marginBottom: 10 },
  footer: { color: "#52677D", textAlign: "center", fontSize: 10, letterSpacing: 1.2, marginTop: 36 }
});
