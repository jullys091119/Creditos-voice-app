import { useAppContext } from "@/context";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { BarChart } from "../../components/charts/bar-chart";
import { getClients, getHistory } from "../../helpers";
import DropdownUser from "../../src/app/components/DropdownUser";
export default function TabTwoScreen() {
  const { value } = useAppContext();
  const [total, setTotal] = useState(0);
  const [numberOfPurchases, setNumberOfPurchases] = useState(0);
  const [lastPayed, setLastPayed] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const id = value || undefined;
  const [data, setData] = useState<{
    data: any[] | null;
  } | null>(null);

  const chartColors = ["#2D4059", "#002B5B", "#EA5455", "#F07B3F", "#2D4059"];

  useEffect(() => {
    (async function () {
      const data = await getClients();
      setData(data);

      const amounts = await getHistory(id);

      const total = amounts
        .filter((i) => Math.sign(i.amount) !== -1)
        .reduce((a, b) => a + b.amount, 0);
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
        .slice(0, 7)
        .map((item, index) => ({
          value: Number(item.amount),
          label: item.date
            ? new Date(item.date).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
              })
            : "",
          color: chartColors[index % chartColors.length],
        }));

      setChartData(chartData);
    })();
  }, [id]);

  return (
    <View style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <DropdownUser data={data} />
      </View>
      {id ? (
        <FlatList
          data={lastPayed}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <>
              <Text style={styles.resumeClient}>Resumen del cliente</Text>
              <View style={styles.containerResume}>
                <BarChart data={chartData} />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginVertical: 30,
                  }}
                >
                  <Text style={styles.totalPayed}>
                    Total acumulado : ${total}
                  </Text>
                  <Text style={styles.totalPurchases}>
                    Total de compras: {numberOfPurchases}
                  </Text>
                </View>
              </View>
            </>
          }
        />
      ) : (
        <View style={styles.containerSelected}>
          <Text style={{ color: "white" }}>Selecciona Usuario</Text>
        </View>
      )}
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
    marginTop: 30,
  },
  containerResume: {
    gap: 40,
    paddingLeft: 30,
    marginVertical: 30,
  },
  totalPayed: {
    color: "white",
    fontSize: 16,
  },
  totalPurchases: {
    color: "white",
    fontSize: 16,
  },
  payed: {
    color: "white",
    marginVertical: 20,
    marginLeft: 30,
    fontSize: 20,
  },
  containerSelected: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
