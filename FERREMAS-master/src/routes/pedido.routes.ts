import { Router } from "express";
import { actualizarEstadoPedido, createOrder } from "../controller/pedido.controller";
import { db } from "../database/conexion";

const router = Router();

// Crear pedido
router.post("/", createOrder);

// Actualizar estado del pedido
router.put("/:id/estado", actualizarEstadoPedido);

// Listar pedidos
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pedidos ORDER BY fecha DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
});

export default router;
