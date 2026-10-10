import { describe, expect, it } from "vitest";
import { INSTITUTE_WHATSAPP } from "@/config/app";
import { bookingLink } from "@/lib/pdf/booking-link";

describe("bookingLink", () => {
  it("opens a WhatsApp chat with the digits of the institute number and the encoded message", () => {
    const url = new URL(bookingLink("¡Hola! Quiero reservar."));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${INSTITUTE_WHATSAPP.replace(/\D/g, "")}`);
    expect(url.searchParams.get("text")).toBe("¡Hola! Quiero reservar.");
  });
  it("accepts another number and strips spaces and the plus", () => {
    expect(bookingLink("x", "+44 7700 900123")).toBe("https://wa.me/447700900123?text=x");
  });
});
