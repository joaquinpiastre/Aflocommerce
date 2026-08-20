export const BRAND = {
  name: "Aflo",
  colors: {
    black: "#0A0A0C",
    blackWarm: "#1A1616",
    red: "#B7262D",
    redHover: "#D32D35",
    gold: "#C3966A",
    bone: "#E7E1DA",
    white: "#FFFFFF",
  },
} as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_FLOW = [
  "PENDIENTE",
  "PAGADO",
  "EN_PREPARACION",
  "ENVIADO",
  "ENTREGADO",
] as const;

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia bancaria",
  MERCADO_PAGO: "Mercado Pago",
};

export const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const DRINKWARE_SIZES = ["350ml", "500ml", "1L"] as const;

export const AFLO_COLORS = [
  { name: "Negro", hex: "#0A0A0C" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Rojo", hex: "#B7262D" },
  { name: "Dorado", hex: "#C3966A" },
  { name: "Gris", hex: "#4A4645" },
  { name: "Hueso", hex: "#E7E1DA" },
] as const;

export const FREE_SHIPPING_THRESHOLD = 80000;
export const FLAT_SHIPPING_COST = 4500;

export const LOW_STOCK_THRESHOLD = 5;
