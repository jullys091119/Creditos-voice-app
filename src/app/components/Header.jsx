import { StyleSheet, Text, View } from "react-native";

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title} className="text-3xl">
        Libreta eléctronica
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 120,
    backgroundColor: "#3A506B",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  title: {
    fontSize: 25,
    color: "white",
  },
});

export default Header;
