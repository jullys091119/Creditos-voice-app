// context/AppContext.js
import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState("julian");
 const [value, setValue] = useState(null);
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        setValue,
        value,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext debe usarse dentro de AppProvider");
  }

  return context;
};
