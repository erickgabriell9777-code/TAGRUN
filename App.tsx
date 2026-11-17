import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";

type Screen = "home" | "setup" | "lobby" | "game" | "results";

const COLORS = { bg: "#07111F", panel: "#101F32", panel2: "#162A40", cyan: "#35D6E8", white: "#F4F8FC", muted: "#91A4B8", red: "#FF647C", green: "#53D69A" };

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [duration, setDuration] = useState("10");
  const [pegadores, setPegadores] = useState("1");
  const [remaining, setRemaining] = useState(600);
  const [captured, setCaptured] = useState(false);
  const [locationText, setLocationText] = useState("Localização ainda não solicitada");

  useEffect(() => {
    if (screen !== "game" || remaining <= 0) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [screen, remaining > 0]);

  useEffect(() => {
    if (screen === "game" && remaining === 0) setScreen("results");
  }, [remaining, screen]);

  const requestLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationText("Permissão negada. Ative a localização nas configurações do celular.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocationText(`GPS ativo: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
    } catch {
      setLocationText("Não foi possível obter a localização neste momento.");
    }
  };

  const startGame = () => {
    const minutes = Math.max(1, Math.min(180, Number(duration) || 10));
    setRemaining(minutes * 60);
    setCaptured(false);
    setScreen("game");
    void requestLocation();
  };

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const Button = ({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) => (
    <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );

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
            <Text style={styles.heading}>A rua virou{ "\n" }seu campo de jogo.</Text>
            <Text style={styles.muted}>Crie uma partida ou entre em uma sala para começar.</Text>
          </View>
          <Text style={styles.label}>SEU NOME</Text>
          <TextInput value={playerName} onChangeText={setPlayerName} placeholder="Como quer aparecer?" placeholderTextColor={COLORS.muted} style={styles.input} maxLength={20} />
          <Button label="CRIAR PARTIDA" onPress={() => setScreen("setup")} />
          <View style={styles.spacer} />
          <Text style={styles.label}>CÓDIGO DA SALA</Text>
          <TextInput value={roomCode} onChangeText={setRoomCode} placeholder="Ex.: TR-4821" placeholderTextColor={COLORS.muted} style={styles.input} autoCapitalize="characters" maxLength={12} />
          <Button label="ENTRAR NA SALA" secondary onPress={() => Alert.alert("Próxima etapa", "A entrada multiplayer será conectada quando implementarmos as salas online/offline.")} />
          <Text style={styles.note}>Protótipo inicial: criar partida e testar o fluxo local. Salas multiplayer ainda não estão conectadas.</Text>
        </>}

        {screen === "setup" && <>
          <Text style={styles.eyebrow}>NOVA PARTIDA</Text>
          <Text style={styles.heading}>Configure a caçada.</Text>
          <Text style={styles.label}>DURAÇÃO (MINUTOS)</Text>
          <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" style={styles.input} />
          <Text style={styles.label}>QUANTIDADE DE PEGADORES</Text>
          <TextInput value={pegadores} onChangeText={setPegadores} keyboardType="number-pad" style={styles.input} />
          <View style={styles.infoCard}><Text style={styles.cardTitle}>Antes de começar</Text><Text style={styles.muted}>Escolha uma área segura, longe de vias movimentadas e locais proibidos. Todos devem concordar com os limites da partida.</Text></View>
          <Button label="CRIAR SALA DE ESPERA" onPress={() => setScreen("lobby")} />
          <Button label="VOLTAR" secondary onPress={() => setScreen("home")} />
        </>}

        {screen === "lobby" && <>
          <Text style={styles.eyebrow}>SALA DE ESPERA</Text>
          <Text style={styles.heading}>Tudo pronto?</Text>
          <View style={styles.infoCard}><Text style={styles.cardTitle}>Sua partida</Text><Text style={styles.muted}>Organizador: {playerName.trim() || "Jogador"}</Text><Text style={styles.muted}>Pegadores configurados: {Math.max(1, Number(pegadores) || 1)}</Text><Text style={styles.muted}>Duração: {Math.max(1, Number(duration) || 10)} minutos</Text><Text style={styles.code}>LOCAL • TESTE</Text></View>
          <Text style={styles.note}>Esta sala ainda funciona somente neste aparelho. Convites e sincronização entre celulares serão implementados na etapa multiplayer.</Text>
          <Button label="INICIAR TESTE DE PARTIDA" onPress={startGame} />
          <Button label="VOLTAR" secondary onPress={() => setScreen("setup")} />
        </>}

        {screen === "game" && <>
          <Text style={styles.eyebrow}>PARTIDA EM ANDAMENTO</Text>
          <Text style={styles.heading}>Caçada!</Text>
          <View style={styles.timerCard}><Text style={styles.label}>TEMPO RESTANTE</Text><Text style={styles.timer}>{formatTime(remaining)}</Text></View>
          <View style={styles.mapPlaceholder}><Text style={styles.mapIcon}>⌖</Text><Text style={styles.cardTitle}>MAPA / LOCALIZAÇÃO</Text><Text style={styles.muted}>{locationText}</Text><Text style={styles.note}>Mapa real e posições dos outros jogadores ainda não conectados.</Text></View>
          <Button label={captured ? "CAPTURA REGISTRADA" : "FUI PEGO"} onPress={() => setCaptured(true)} />
          <Button label="ENCERRAR TESTE" secondary onPress={() => setScreen("results")} />
        </>}

        {screen === "results" && <>
          <Text style={styles.eyebrow}>FIM DA PARTIDA</Text>
          <Text style={styles.heading}>Partida encerrada.</Text>
          <View style={styles.infoCard}><Text style={styles.cardTitle}>Resumo do teste</Text><Text style={styles.muted}>Captura registrada neste aparelho: {captured ? "Sim" : "Não"}</Text><Text style={styles.muted}>Tempo restante: {formatTime(remaining)}</Text></View>
          <Button label="VOLTAR AO INÍCIO" onPress={() => setScreen("home")} />
        </>}
        <Text style={styles.footer}>TAGRUN • VERSÃO 0.1.0 • PROTÓTIPO</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, paddingTop: 34, paddingBottom: 40 },
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
  spacer: { height: 18 },
  note: { color: "#71879D", fontSize: 11, lineHeight: 17, marginTop: 16 },
  infoCard: { backgroundColor: COLORS.panel, borderRadius: 17, padding: 18, borderWidth: 1, borderColor: "#203A52", marginVertical: 18, gap: 8 },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: "800", marginBottom: 5 },
  code: { color: COLORS.cyan, fontSize: 18, fontWeight: "900", letterSpacing: 2, marginTop: 10 },
  timerCard: { backgroundColor: COLORS.panel, borderRadius: 20, padding: 22, alignItems: "center", marginVertical: 14 },
  timer: { color: COLORS.cyan, fontSize: 56, fontWeight: "900", fontVariant: ["tabular-nums"] },
  mapPlaceholder: { minHeight: 190, backgroundColor: "#0C1D2B", borderRadius: 20, borderWidth: 1, borderColor: "#29445E", alignItems: "center", justifyContent: "center", padding: 20, marginVertical: 12 },
  mapIcon: { color: COLORS.cyan, fontSize: 40, marginBottom: 10 },
  footer: { color: "#52677D", textAlign: "center", fontSize: 10, letterSpacing: 1.2, marginTop: 36 }
});