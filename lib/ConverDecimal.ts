import { Decimal } from "@prisma/client/runtime/library";

export function convertDecimal(obj: any): any {
  if (obj == null) return obj;

  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDecimal);
  }

  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertDecimal(value)])
    );
  }

  return obj;
}
