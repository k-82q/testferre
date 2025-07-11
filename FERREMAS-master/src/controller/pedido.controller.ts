import { Request, Response } from "express";
import { db } from "../database/conexion";
import axios from "axios";

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "TU_ACCESS_TOKEN";

export const actualizarEstadoPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ["pendiente", "aceptado", "preparado", "entregado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido." });
    }

    const [result] = await db.query("UPDATE pedidos SET estado = ? WHERE id = ?", [estado, id]);

    // Opcional: verificar que haya fila actualizada
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    res.json({ message: `Estado del pedido ${id} actualizado a ${estado}` });
  } catch (error) {
    console.error("Error actualizando estado pedido:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, usuario_id, comprador_nombre } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No hay productos para crear el pedido." });
    }
    if (!usuario_id || !comprador_nombre) {
      return res.status(400).json({ message: "Datos de usuario incompletos." });
    }

    // Calcular total
    const total = items.reduce(
      (acc, item) => acc + Number(item.precio) * Number(item.cantidad || 1),
      0
    );

    // Insertar pedido con estado pendiente, guardando productos como JSON
    const [result] = await db.query(
      `INSERT INTO pedidos 
      (usuario_id, comprador_nombre, total, fecha, estado, estado_pago, productos) 
      VALUES (?, ?, ?, NOW(), 'pendiente', 'Pendiente', ?)`,
      [usuario_id, comprador_nombre, total, JSON.stringify(items)]
    );

    const insertResult: any = result;
    const pedidoId = insertResult.insertId;

    if (!pedidoId) {
      return res.status(500).json({ message: "No se pudo obtener el ID del pedido." });
    }

    // Crear preferencia para Mercado Pago con external_reference = pedidoId
    const preference = {
      items: items.map(item => ({
        id: item.id.toString(),
        title: item.nombre,
        quantity: item.cantidad || 1,
        unit_price: Number(item.precio),
      })),
      external_reference: pedidoId.toString(),
      back_urls: {
        success: "http://tu-dominio.com/pago-exitoso",
        failure: "http://tu-dominio.com/pago-fallido",
        pending: "http://tu-dominio.com/pago-pendiente",
      },
      auto_return: "approved",
      notification_url: "https://7a6eb25a022c.ngrok-free.app/api/pago/webhook"
    };

    // Crear preferencia MercadoPago
    try {
      const response = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        preference,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.status(201).json({
        message: "Pedido creado",
        pedidoId,
        url: response.data.init_point,
      });
    } catch (error) {
      console.error("Error al crear preferencia en Mercado Pago:", error);
      return res.status(500).json({ message: "Error al crear preferencia de pago." });
    }

  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ message: "Error interno al crear pedido." });
  }
};
