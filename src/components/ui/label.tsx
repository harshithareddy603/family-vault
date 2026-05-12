import * as React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

const Label = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => {
  return (
    <Text style={[styles.label, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 4,
  },
});

export { Label };
