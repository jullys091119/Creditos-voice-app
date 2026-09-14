import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useAppContext } from "../../context";
const DropdownUser = ({ data }) => {
  const { setValue, value } = useAppContext();
  const [isFocus, setIsFocus] = useState(false);
  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data?.data ?? []}
        maxHeight={300}
        labelField="nombre"
        valueField="id"
        placeholder={!isFocus ? 'Seleccionar usuario' : '...'}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          console.log('Usuario seleccionado:', item);
          setValue(item.id);
          setIsFocus(false);
        }}
        /* renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? 'blue' : 'black'}
            name="Safety"
            size={20}
          />
        )} */
      />
    </View>
  );
};

export default DropdownUser;

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    width: 170,
    
  },
  icon: {
    marginRight: 5,
    color: "white",
  },

  placeholderStyle: {
    fontSize: 16,
    color: "white"
},
selectedTextStyle: {
    fontSize: 16,
    color: "white"
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
