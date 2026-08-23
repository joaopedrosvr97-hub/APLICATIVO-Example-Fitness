// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "storefront.fill": "storefront",
  "cart.fill": "shopping-cart",
  "heart.fill": "favorite",
  "person.fill": "person",
  // Actions
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "xmark": "close",
  "plus": "add",
  "minus": "remove",
  "magnifyingglass": "search",
  "bell.fill": "notifications",
  "heart": "favorite-border",
  "trash.fill": "delete",
  "checkmark.circle.fill": "check-circle",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "slider.horizontal.3": "tune",
  "tag.fill": "local-offer",
  "truck.box.fill": "local-shipping",
  "creditcard.fill": "credit-card",
  "qrcode": "qr-code",
  "doc.text.fill": "receipt",
  "star.fill": "star",
  "star": "star-border",
  "location.fill": "location-on",
  "bag.fill": "shopping-bag",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "lock.fill": "lock",
  "envelope.fill": "email",
  "phone.fill": "phone",
  "gear": "settings",
  "questionmark.circle.fill": "help",
  "arrow.right.square.fill": "logout",
  "photo.fill": "photo",
  "grid.fill": "grid-view",
  "list.bullet": "list",
  "checkmark": "check",
  "exclamationmark.circle.fill": "error",
  "info.circle.fill": "info",
  "arrow.clockwise": "refresh",
  "square.and.arrow.up": "share",
  "map.fill": "map",
  "percent": "percent",
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
