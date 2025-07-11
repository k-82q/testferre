import { ACCESS_TOKEN } from "../config";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { Request, Response } from "express";
import { db } from "../database/conexion";
import fetch from "node-fetch";

const BASE_URL = process.env.BASE_URL || "https://testferre-production.up.railway.app";

const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function obtenerPagoConReintentos(id: string, intentos: number = 5): Promise<any> {
  for (let i = 0; i < intentos; i++) {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    const data = await response.json();
    if (data && data.status !== 404 && data.error !== "not_found") return data;
    await delay(1500);
  }
  throw new Error("No se pudo obtener el pago después de varios intentos.");
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const itemsToPay = req.body.items.map((item: any) => ({
      id: item.id,
      title: item.nombre,
      description: item.nombre,
      quantity: 1,
      unit_price: item.precio,
    }));
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: itemsToPay,
        back_urls: {
          success: `${BASE_URL}/index.html`,
          failure: `${BASE_URL}/index.html`,
          pending: `${BASE_URL}/index.html`,
        },
        notification_url: `${BASE_URL}/api/pago/webhook`,
        metadata: {
          usuario_id: req.body.usuario_id,
          productos: req.body.items,
        },
      },
      requestOptions: { timeout: 5000 },
    });
    res.status(200).json({ url: result.sandbox_init_point });
  } catch (error) {
    console.log("Error al crear un pago: ", error);
    res.status(500).json({ message: "Error al crear el pago" });
  }
};

export const webhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const tipo = body.type || body.topic;
    const id = body.data?.id || body["data.id"];
    if (tipo === "payment" && id) {
      let paymentData;
      try {
        paymentData = await obtenerPagoConReintentos(id, 5);
      } catch (error) {
        await db.query(
          `INSERT INTO pedidos (id_pago, estado) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE estado=VALUES(estado)`,
          [id, "pendiente"]
        );
        return res.status(200).send("Payment not found yet after retries");
      }
      const estado = paymentData.status;
      const id_pago = paymentData.id;
      const usuario_id = paymentData.metadata?.usuario_id || null;
      const comprador_nombre = (paymentData.payer?.first_name || '') + ' ' + (paymentData.payer?.last_name || '');
      const productos = paymentData.metadata?.productos || [];
      if (estado === "approved") {
        await db.query(
          "INSERT INTO pedidos (id_pago, estado, productos, usuario_id, comprador_nombre) VALUES (?, ?, ?, ?, ?)",
          [id_pago, "Pendiente", JSON.stringify(productos), usuario_id, comprador_nombre]
        );
      } else {
        await db.query(
          `INSERT INTO pedidos (id_pago, estado, productos, usuario_id, comprador_nombre, estado_pago) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             estado = VALUES(estado),
             productos = VALUES(productos),
             usuario_id = VALUES(usuario_id),
             comprador_nombre = VALUES(comprador_nombre),
             estado_pago = VALUES(estado_pago)`,
          [id_pago, estado, JSON.stringify(productos), usuario_id, comprador_nombre, estado]
        );
      }
    }
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook de Mercado Pago:", error);
    return res.status(500).send("Error");
  }
};
