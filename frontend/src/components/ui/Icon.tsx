import React from "react";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
  Search1Outlined,
  Cart1Outlined,
  User4Outlined,
  CheckCircle1Outlined,
  XmarkOutlined,
  PlusOutlined,
  MinusOutlined,
  Shield2Outlined,
  Shield2CheckOutlined,
  Bolt2Outlined,
  MapMarker1Outlined,
  PhoneOutlined,
  TruckDelivery1Outlined,
  ArrowRightOutlined,
  ArrowDownwardOutlined,
  ChevronDownOutlined,
  MenuHamburger1Outlined,
  ClipboardOutlined,
  Bell1Outlined,
  IconData,
} from "@lineiconshq/free-icons";

export type IconName =
  | "search"
  | "cart"
  | "shopping-cart"
  | "user"
  | "user-round"
  | "plus"
  | "minus"
  | "close"
  | "chevron"
  | "chevron-down"
  | "check"
  | "lock"
  | "shield"
  | "shield-check"
  | "truck"
  | "calendar"
  | "card"
  | "arrow"
  | "bolt"
  | "fileText"
  | "clock"
  | "mapPin"
  | "map-pin"
  | "tool"
  | "star"
  | "phone"
  | "box"
  | "package"
  | "help"
  | "alert"
  | "download"
  | "menu"
  | "bell";

interface IconProps {
  name: IconName | string;
  size?: number;
  className?: string;
  color?: string;
}

const ICON_MAP: Record<string, IconData> = {
  // Búsqueda
  search:          Search1Outlined,
  // Carrito / compras
  cart:            Cart1Outlined,
  "shopping-cart": Cart1Outlined,
  // Usuarios
  user:            User4Outlined,
  "user-round":    User4Outlined,
  // Acciones / feedback
  check:           CheckCircle1Outlined,
  close:           XmarkOutlined,
  plus:            PlusOutlined,
  minus:           MinusOutlined,
  arrow:           ArrowRightOutlined,
  chevron:         ChevronDownOutlined,
  "chevron-down":  ChevronDownOutlined,
  download:        ArrowDownwardOutlined,
  // Seguridad
  shield:          Shield2Outlined,
  "shield-check":  Shield2CheckOutlined,
  lock:            Shield2Outlined,
  // Logística
  truck:           TruckDelivery1Outlined,
  package:         ClipboardOutlined,
  box:             ClipboardOutlined,
  // Contacto / ubicación
  phone:           PhoneOutlined,
  mapPin:          MapMarker1Outlined,
  "map-pin":       MapMarker1Outlined,
  // Notificaciones
  bell:            Bell1Outlined,
  // UI / navegación
  menu:            MenuHamburger1Outlined,
  // Varios (fallbacks semánticos)
  bolt:            Bolt2Outlined,
  tool:            Bolt2Outlined,
  fileText:        ClipboardOutlined,
  clock:           Search1Outlined,
  calendar:        TruckDelivery1Outlined,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  className = "",
  color = "currentColor",
}) => {
  const iconData = ICON_MAP[name] ?? Bolt2Outlined;

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <Lineicons icon={iconData} size={size} color={color} />
    </span>
  );
};
