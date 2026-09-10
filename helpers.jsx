import { supabase } from "./supabase";

async function getClients() {
  const { data, error } = await supabase.from("clients").select("*");
  return { data, error };
}

async function getTransactions(id) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_id", id)
    .order("id", { ascending: false });

  if (error) console.log(error, "No get transactions");

  return data || [];
}

async function getAllTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("id", { ascending: false });

  if (error) console.log(error, "No get transactions");

  return data;
}

async function insertAmount(client, amount, type) {
  const { error } = await supabase
    .from("transactions")
    .insert({ client_id: client, amount, type, pending: "FALSE" });
  if (error) console.log(error, "error al insertar");
  console.log("success insert");
  return { error };
}

async function insertPay(client, amount, type) {
  const { error } = await supabase
    .from("transactions")
    .insert({ client_id: client, amount: -amount, type: type });

  if (error) console.log(error, "error al insertar");
  console.log("success insert");
  return { error };
}

async function insertHistory(items) {
  const registros = items.map(({ client_id, amount, type, date }) => ({
    client_id,
    amount,
    type,
    date,
  }));
  console.log(registros, "registros");

  const { error } = await supabase.from("history").insert(registros);

  if (error) {
    console.log(error, "error al insertar historial");
    return { error };
  }

  return { error: null };
}

async function pendingSet(id, pending) {
  const { data, error } = await supabase
    .from("transactions")
    .update({ pending: pending })
    .eq("id", id)
    .select("*");

  return data;
}

async function itemDelete(id) {
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.log("Error al borrar el item", error);
    return;
  }

  console.log("Borrado correctamente");

  return data;
}

export {
    getAllTransactions,
    getClients,
    getTransactions,
    insertAmount,
    insertHistory,
    insertPay,
    itemDelete,
    pendingSet
};

