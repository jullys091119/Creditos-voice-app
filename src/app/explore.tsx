import { useAppContext } from "@/context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit/v2";
import { getClients, getHistory } from "../../helpers";
import DropdownUser from "../../src/app/components/DropdownUser";
export default function TabTwoScreen() {
  const { value } = useAppContext();
  const [total, setTotal] = useState(0);
  const [numberOfPurchases, setNumberOfPurchases] = useState(0);
  const [lastPayed, setLastPayed] = useState<any[]>([]);
  const [chartData, setCharData] = useState<any[]>([]);

  const id = value || undefined;
  const [data, setData] = useState<{
    data: any[] | null;
  } | null>(null);

  useEffect(() => {
    (async function () {
      const data = await getClients();
      setData(data);

      const amounts = await getHistory(id);

      const total = amounts
        .filter((i) => Math.sign(i.amount) !== -1)
        .reduce((a, b) => a + b.amount, 0);
      console.log(total, "total");
      setTotal(total);

      const purchases = amounts.filter(
        (i) => Math.sign(i.amount) !== -1,
      ).length;
      setNumberOfPurchases(purchases);

      const lastPayed = amounts
        .filter((i) => i.amount < 0)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      setLastPayed(lastPayed);

      const chartData = amounts
        .filter((item) => item.amount > 0)
        .map((item) => ({
          value: Number(item.amount),
          label: item.date,
        }));
      setCharData(chartData);
    })();
  }, [id]);

  const datos = [
    { month: "Jan", signups: 180 },
    { month: "Feb", signups: 520 },
    { month: "Mar", signups: 260 },
    { month: "Apr", signups: 740 },
    { month: "May", signups: 390 },
    { month: "Jun", signups: 860 },
  ];

  type ItemProps = { amount: number; datePay: string };

  const Pay = ({ amount, datePay }: ItemProps) => (
    <View style={styles.containerPayed}>
      <Ionicons name="calendar-outline" size={24} color="white" />
      <Text style={styles.datePayed}>{datePay}</Text>
      <Text style={styles.amountPayed}>${Math.abs(amount)}</Text>
    </View>
  );
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Historial</Text>
    <DropdownUser data={data} />
  </View>;

  return (
    <View style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <DropdownUser data={data} />
      </View>
      <FlatList
        data={lastPayed}
        renderItem={({ item }) => (
          <Pay amount={item.amount} datePay={item.date} />
        )}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <Text style={styles.resumeClient}>Resumen del cliente</Text>

            {chartData.length > 0 && (
              <BarChart
                data={datos}
                xKey="month"
                yKey="signups"
                width={410}
                height={240}
              />
            )}
            <View style={styles.containerResume}>
              <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                <FontAwesome5 name="shopify" size={24} color="white" />
                <Text style={styles.totalPayed}>${total}</Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                <FontAwesome name="shopping-basket" size={24} color="white" />
                <Text style={styles.totalPurchases}>{numberOfPurchases}</Text>
              </View>
            </View>
            <Text style={styles.payed}>Pagos</Text>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#1C2541",
    height: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    height: 120,
    backgroundColor: "#3A506B",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
    alignItems: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontFamily: "Montserrat_500Medium",
    color: "white",
  },
  containerPayed: {
    display: "flex",
    flexDirection: "row",
    gap: 30,
    backgroundColor: "#5379AE70",
    marginHorizontal: 30,
    paddingLeft: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
  amountPayed: {
    color: "white",
  },
  datePayed: {
    color: "white",
  },
  resumeClient: {
    color: "white",
    fontSize: 28,
    fontFamily: "Montserrat_600SemiBold",
    margin: 15,
    paddingLeft: 15,
  },
  containerResume: {
    gap: 40,
    paddingLeft: 30,
    marginVertical: 30,
  },
  totalPayed: {
    color: "white",
    fontSize: 20,
  },
  totalPurchases: {
    color: "white",
    fontSize: 20,
  },
  payed: {
    color: "white",
    marginVertical: 20,
    marginLeft: 30,
    fontSize: 20,
  },
});
