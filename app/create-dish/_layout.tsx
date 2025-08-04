import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Slot } from "expo-router";

export default function CreateDishLayout() {
  return (
    <BottomSheetModalProvider>
      <Slot />
    </BottomSheetModalProvider>
  );
}
