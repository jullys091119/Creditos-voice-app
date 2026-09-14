import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Zocial from "@expo/vector-icons/Zocial";
import { Button } from "expo-router/build/react-navigation";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  getClients,
  getTransactions,
  insertAmount,
  insertHistory,
  insertPay,
  itemDelete,
  pendingSet,
} from "../../../helpers";
import { supabase } from "../../../supabase";

function Main({ name }) {
  const [show, setShowName] = useState([]);
  const [date, setDate] = useState("");
  const [currentSale, setCurrentSale] = useState([]);
  const [modal, setModal] = useState(false);
  const [pay, setPay] = useState(0);
  const [clientId, setClientId] = useState(null);

  const pending = currentSale?.filter((i) => i.pending).length;
  const total = currentSale?.reduce((acc, item) => acc + item.amount, 0);

  async function insertAutomaticHistory(total, currentSale, clientId) {
    if (total !== 0) return;

    const { error } = await insertHistory(currentSale);
    if (error) {
      console.log("No se pudo insertar historial");
      return;
    }
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("client_id", clientId);
    if (deleteError) {
      console.log("Error al borrar transactions", deleteError);
      return;
    }

    setCurrentSale([]);
  }

  async function confirmation() {
    const result = await getClients();
    setShowName(result);

    const match = name.match(/\d+(?:[.,]\d+)?/);

    if (!match) {
      const client = result.data.find((client) =>
        client.aliases?.some(
          (alias) => alias.toLowerCase().trim() === name.toLowerCase().trim(),
        ),
      );

      if (!client) {
        return;
      }

      const response = await getTransactions(client.id);
      console.log(response, "respons")
      setClientId(client.id);
      setShowName(client);
      setCurrentSale(response);

      return;
    }

    const currentAmount = Number(match[0]);
    const clientName = name.replace(match[0], "").trim();

    if (result.error) {
      console.log("Error:", result.error);
      return;
    }

    const client = result.data.find((client) =>
      client.aliases?.some(
        (alias) =>
          alias.toLowerCase().trim() === clientName.toLowerCase().trim(),
      ),
    );

    setClientId(client.id);

    const user = result.data.find((i) => i?.id === client?.id);
    setShowName(user);

    if (!client) {
      Alert.alert("Cliente no encontrado", `No encontré a "${clientName}"`);
      return;
    }

    Alert.alert(
      "Agregar fiado",
      `${client.nombre}\n+$${currentAmount}\n\n¿Deseas agregarlo?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => {
            await insertAmount(client.id, currentAmount, "credit");
            const response = await getTransactions(client.id);
            setCurrentSale(response);
          },
        },
      ],
    );
  }

  async function handlePending(id, isPending) {
    await pendingSet(id, isPending);

    setCurrentSale(
      currentSale.map((item) =>
        item.id === id ? { ...item, pending: isPending } : item,
      ),
    );
  }

  function getDate() {
    const currentDate = new Date();

    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    setDate(`${day} de ${months[month]} de ${year}`);
  }

  async function payCount(id, pay, type) {
    await insertPay(id, pay, type);

    const data = await getTransactions(id);

    const total = data.reduce((acc, item) => acc + Number(item.amount), 0);

    await insertAutomaticHistory(total, data, id);

    if (total === 0) {
      setCurrentSale([]);
    } else {
      setCurrentSale(data);
    }

    setPay("");
    setModal(false);
  }

  async function handleItemDelete(id, idClient) {
    await itemDelete(id);

    const data = await getTransactions(clientId);

    setCurrentSale(data);
  }

  function openModal() {
    setModal(true);
  }

  useEffect(() => {
    getDate();
    confirmation();
    console.log(show);
  }, [name]);

  return (
    <View style={styles.containerBooks}>
      {
        <Modal
          animationType="slide"
          transparent={true}
          visible={modal}
          onRequestClose={() => setModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                height: 400,
                width: 300,
                backgroundColor: "white",
                padding: 30,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.name}>{show.nombre}</Text>
              <Text style={styles.actuallyTotal}>Saldo Actual: {total}</Text>
              <View style={{ paddingVertical: 20 }}>
                <Text style={styles.currentPay}>¿Cúanto abonó ?</Text>
                <TextInput
                  value={pay}
                  onChangeText={(text) => setPay(text)}
                  style={styles.input}
                />
              </View>
              <View style={styles.containerButtons}>
                <Button onPressIn={() => setModal(false)}>Cancelar</Button>
                <Button
                  onPressIn={() => {
                    payCount(clientId, pay, "pay");
                  }}
                >
                  Pagar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      }
      {currentSale?.length > 0 ? (
        <View style={styles.card}>
          <View>
            <View style={styles.containerItems}>
              <View style={styles.containerName}>
                <FontAwesome6 name="user-circle" size={24} color="white" />
                <Text style={styles.nameClient}>{show?.nombre}</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Zocial name="cart" size={24} color="white" />
                <Text style={styles.totalSales}>
                  Items: {currentSale.length}
                </Text>
              </View>
            </View>
            <View style={styles.thead}>
              <Text style={styles.txtVenta}>Venta</Text>
              <Text style={styles.txtFecha}>Fecha</Text>
            </View>
            <FlatList
              style={{
                maxHeight: 300,
                paddingLeft: 0,
                paddingVertical: 12,
              }}
              data={currentSale}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => {
                return (
                  <TouchableWithoutFeedback
                    onLongPress={() => handlePending(item.id, !item.pending)}
                  >
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: item.pending
                          ? "#D4240F"
                          : item.type === "pay"
                            ? "#5BC0BE40"
                            : null,
                        borderRadius: 7,
                        paddingVertical: 5,
                      }}
                    >
                      <Text style={styles.amount}>+${item.amount}</Text>
                      <Text style={styles.pay}>
                        {item.type === "pay" ? "Pago" : null}
                      </Text>
                      <View style={styles.containerDate}>
                        {!item.pending && (
                          <Text style={styles.date}>{date}</Text>
                        )}
                      </View>
                      {item.pending && (
                        <Text style={styles.pending}>Pendiente</Text>
                      )}
                      <TouchableOpacity
                        onPressIn={() => {
                          handleItemDelete(item.id, item.client_id);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={30}
                          color="#D96C6C"
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                );
              }}
            />

            <View style={styles.hr} />
            <View style={styles.containerTotal}>
              <Button onPressIn={openModal}>
                <Text style={styles.total}>Total: ${total || 0}</Text>
              </Button>
              <Text
                style={[
                  styles.currentPending,
                  { color: pending > 0 ? "#D4240F" : "white" },
                ]}
              >
                Pendientes: {pending}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#1C2541",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: "white", fontFamily: "Montserrat_600SemiBold" }}
          >
            Busca por voz a los clientes !!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerBooks: {
    overflow: "hidden",
    height: 530,
  },

  nameClient: {
    fontSize: 26,
    color: "white",
    fontFamily: "Montserrat_600SemiBold",
  },

  card: {
    backgroundColor: "#1C2541",
    padding: 20,
    height: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  amount: {
    color: "white",
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
  },

  containerItems: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  containerTotal: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  total: {
    color: "white",
    fontSize: 20,
    fontFamily: "Montserrat_500Medium",
  },
  totalSales: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },

  hr: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 22,
  },

  date: {
    color: "white",
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
  },
  containerDate: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 300,
  },
  pending: {
    color: "white",
    fontFamily: "Montserrat_500Medium",
    fontSize: 15,
  },
  currentPending: {
    fontSize: 19,
    fontFamily: "Montserrat_500Medium",
  },
  containerName: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  txtVenta: {
    color: "white",
  },
  txtFecha: {
    color: "white",
  },
  thead: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 70,
    marginTop: 20,
    marginBottom: 10,
  },
  containerButtons: {
    display: "flex",
    flexDirection: "row",
  },
  pay: {
    color: "white",
  },
  name: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 30,
  },
  currentPay: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 20,
    marginVertical: 10,
  },
  actuallyTotal: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 19,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3A506B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    color: "#0B132B",
    backgroundColor: "#F8FAFC",
  },
});

export default Main;
