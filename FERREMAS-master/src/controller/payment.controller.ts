import { ACCESS_TOKEN } from "../config";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { Request, Response } from "express";
import { PayerRequest } from "mercadopago/dist/clients/payment/create/types";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { db } from "../database/conexion";
import fetch from "node-fetch"; 

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reintenta obtener el pago desde MercadoPago
async function obtenerPagoConReintentos(id: string, intentos: number = 5): Promise<any> {
  for (let i = 0; i < intentos; i++) {
    console.log(`🔁 Intento ${i + 1} de ${intentos} para obtener pago...`);
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    const data = await response.json();

    if (data && data.status !== 404 && data.error !== "not_found") {
      return data;
    }

    await delay(1500); // Espera 1.5 segundos entre intentos
  }

  throw new Error("❌ No se pudo obtener el pago después de varios intentos.");
}

const payment = new Payment(client);

//Crea orden de pago


export const createOrder = async (req: Request, res: Response) => {
  try {
    const itemsToPay = req.body.items.map((item: any) => ({
  id: item.id,
  title: item.nombre,
  description: item.nombre,
  quantity: 1,
  unit_price: item.precio,
}));
    // Validación de items
    let result: PreferenceResponse | undefined;
    const preference = new Preference(client);
    await preference.create({
      body: {
        items: itemsToPay,
        back_urls: {
          success: "http://localhost:3000/api/pago/success",
          failure: "http://localhost:3000/api/pago/failure",
          pending: "http://localhost:3000/api/pago/pending",
        },
        notification_url: "https://7a6eb25a022c.ngrok-free.app/api/pago/webhook",

        metadata: {
            usuario_id: req.body.usuario_id,
            productos: req.body.items       
        }
    },
      requestOptions: {
        timeout: 5000,
      },
    }).then(x => {
        console.log(x)
        result = x;
    }).catch(err => {
        console.log(err);
    });
    console.log("Pago creado: ",result);
    res.status(200).json({url: result?.sandbox_init_point});
  } catch (error) {
    console.log("Error al crear un pago: ", error);
    res.status(500).json({ message: "Error al crear el pago" });
  }

};

// Procesa el pago exitoso
export const success = async(req: Request, res: Response) => {
    try {
        const data = req.query as unknown as PaymentResponse;
        console.log("Data del pago recibido: ", data);
        //Procesar el estado del pago en la base de datos
        res.status(200).json({
            message:"Pago relizado de forma exitosa",
            data,
        });
    } catch (error) {
        console.log('Error en el pago: ', error);
    }
}

// Procesa el pago fallido
export const failure = async(req: Request, res: Response) => {
    try {
        const data = req.query as unknown as PaymentResponse;
        console.log("Data del pago recibido: ", data);
    } catch (error) {
        console.log('Error en el pago: ', error);
    }
}

// Procesa el pago pendiente
export const pending = async(req: Request, res: Response) => {
    try {
        const data = req.query as unknown as PaymentResponse;
        console.log("Data del pago recibido: ", data);
    } catch (error) {
        console.log("Error en el pago: ", error);
    }
}

// Webhook para recibir notificaciones de Mercado Pago
/*export const webhook = async (req: Request, res: Response) => {
    try {
        console.log("WEBHOOK RECIBIDOOOOOO!!!!!:", JSON.stringify(req.body)); // <-- Agrega este log

        const body = req.body;

        // Verifica que el body tenga la estructura esperada
        if (body.type === "payment" || body.topic === "payment") {
            const paymentId = body.data?.id || body["data.id"];
            if (!paymentId) return res.status(400).send("No payment id");

            // Consulta el detalle del pago a la API de Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN || ACCESS_TOKEN}`,
                },
            });
            const paymentData = await response.json() as any;

            // Extrae los datos relevantes
            const estado = paymentData.status;
            const id_pago = paymentData.id;
            const usuario_id = paymentData.metadata?.usuario_id || null;
            const comprador_nombre = paymentData.payer?.first_name + " " + paymentData.payer?.last_name;
            const productos = paymentData.metadata?.productos || "[]";

            // Guarda el pedido solo si es aprobado
            console.log("ESTADO DEL PAGO!!!!:", estado);
            console.log("paymentData!!!:", paymentData);
            if (estado === "approved") {
                await db.query(
                    "INSERT INTO pedidos (id_pago, estado, productos, usuario_id, comprador_nombre) VALUES (?, ?, ?, ?, ?)",
                    [id_pago, "Pendiente", JSON.stringify(productos), usuario_id, comprador_nombre]
                );
            }
        }

        res.status(200).send("Webhook recibido correctamente");
    } catch (error) {
        console.log("Error en webhook de Mercado Pago:", error);
        res.status(500).send("Error");
    }
};*/

export const webhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const tipo = body.type || body.topic;
    const id = body.data?.id || body["data.id"];

    console.log("✅ Webhook ejecutado correctamente");
    console.log("Datos recibidos en webhook:", JSON.stringify(req.body, null, 2));

    if (tipo === "payment" && id) {
      let paymentData;
      try {
        paymentData = await obtenerPagoConReintentos(id, 5); // 5 intentos con delay
      } catch (error) {
        console.log("⚠️ Pago no disponible aún tras varios intentos");

        // Guardar pago pendiente para reintento futuro (si no existe)
        await db.query(
          `INSERT INTO pedidos (id_pago, estado) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE estado=VALUES(estado)`,
          [id, "pendiente"]
        );

        return res.status(200).send("Payment not found yet after retries");
      }

      console.log("🔁 Datos del pago desde MercadoPago API:", JSON.stringify(paymentData, null, 2));

      const estado = paymentData.status;
      const id_pago = paymentData.id;
      const usuario_id = paymentData.metadata?.usuario_id || null;
      const comprador_nombre = (paymentData.payer?.first_name || '') + ' ' + (paymentData.payer?.last_name || '');
      const productos = paymentData.metadata?.productos || [];

      console.log("📦 Preparando INSERT/UPDATE en DB con:");
      console.log("➡️ id_pago:", id_pago);
      console.log("➡️ estado:", estado);
      console.log("➡️ productos:", productos);
      console.log("➡️ usuario_id:", usuario_id);
      console.log("➡️ comprador_nombre:", comprador_nombre);

      if (estado === "approved") {
        await db.query(
          `INSERT INTO pedidos (id_pago, estado, productos, usuario_id, comprador_nombre, estado_pago) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             estado = VALUES(estado),
             productos = VALUES(productos),
             usuario_id = VALUES(usuario_id),
             comprador_nombre = VALUES(comprador_nombre),
             estado_pago = VALUES(estado_pago)`,
          [id_pago, "realizado", JSON.stringify(productos), usuario_id, comprador_nombre, "Aprobado"]
        );
        console.log("✅ Pedido insertado o actualizado correctamente en la base de datos.");
      } else {
        // Para otros estados (ej: pending, in_process, rejected...), guarda o actualiza el estado
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
        console.log(`ℹ️ Pedido guardado con estado ${estado} para seguimiento futuro.`);
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error en webhook de Mercado Pago:", error);
    return res.status(500).send("Error");
  }
};
