import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAudioPlayer } from "expo-audio";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Header from "./components/Header";
import Main from "./components/Main";

export default function HomeScreen() {
  const audioSource = require("../../assets/sounds/tono.mp3");
  const player = useAudioPlayer(audioSource);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  type Props = {
    handleStart: () => void;
  };

  function Recognizing({ handleStart }: Props) {
    useSpeechRecognitionEvent("start", () => setRecognizing(true));
    useSpeechRecognitionEvent("end", () => setRecognizing(false));

    useSpeechRecognitionEvent("result", (event) => {
      setTranscript(event.results[0]?.transcript);
    });
    useSpeechRecognitionEvent("error", (event) => {
      console.log("error code:", event.error, "error message:", event.message);
    });

    return (
      <>
        {!recognizing ? (
          <FontAwesome
            name="microphone"
            size={54}
            color="white"
            onPress={handleStart}
          />
        ) : (
          <FontAwesome
            name="microphone-slash"
            size={54}
            color="white"
            onPress={() => ExpoSpeechRecognitionModule.stop()}
          />
        )}
      </>
    );
  }

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "es-ES",
      interimResults: true,
      continuous: false,
    });
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.container}>
      <Header />
      <Main name={transcript} />
      <View style={styles.containerMicro}>
        <Recognizing handleStart={handleStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  code: {
    textTransform: "uppercase",
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  containerMicro: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C2541",
  },
});
