import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "ghostwhite",
  },

  label: {
    textAlign: "center",
    margin: 10,
  },

  address: {
    fontWeight: "bold",
  },

  mapView: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});