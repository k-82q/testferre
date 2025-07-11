import { Request, Response } from "express";
import { db } from "../database/conexion";

export const getProductos = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const getProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.query("SELECT * FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const { Nombre, Descripcion, Precio, Imagen, categoria } = req.body;

    if (!Nombre || !Descripcion || !Precio || !Imagen || !categoria) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const [result]: any = await db.query(
      "INSERT INTO productos (Nombre, Descripcion, Precio, Imagen, categoria) VALUES (?, ?, ?, ?, ?)",
      [Nombre, Descripcion, Precio, Imagen, categoria]
    );

    res.json({ id: result.insertId, Nombre, Descripcion, Precio, Imagen, categoria });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Nombre, Descripcion, Precio, Imagen, categoria } = req.body;

    await db.query(
      "UPDATE productos SET Nombre = ?, Descripcion = ?, Precio = ?, Imagen = ?, categoria = ? WHERE id = ?",
      [Nombre, Descripcion, Precio, Imagen, categoria, id]
    );

    res.json({ id, Nombre, Descripcion, Precio, Imagen, categoria });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM productos WHERE id = ?", [id]);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};