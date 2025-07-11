import { Request, Response } from "express";
import { db } from "../database/conexion";
import bcrypt from "bcryptjs";

// Obtener todos los usuarios
export const getUsuarios = async (_req: Request, res: Response) => {
  const [rows]: any = await db.query("SELECT id, NombreCompleto, Correo, Rol FROM usuarios");
  res.json(rows);
};

// Crear usuario
export const createUsuario = async (req: Request, res: Response) => {
  const { nombre, correo, rol, clave } = req.body;
  if (!nombre || !correo || !rol || !clave) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  const hash = await bcrypt.hash(clave, 10);
  await db.query(
    "INSERT INTO usuarios (NombreCompleto, Correo, Rol, Clave) VALUES (?, ?, ?, ?)",
    [nombre, correo, rol, hash]
  );
  res.json({ message: "Usuario creado correctamente." });
};

// Editar usuario
export const updateUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, correo, rol, clave } = req.body;
  let query = "UPDATE usuarios SET NombreCompleto=?, Correo=?, Rol=?";
  let params: any[] = [nombre, correo, rol];
  if (clave) {
    query += ", Clave=?";
    params.push(await bcrypt.hash(clave, 10));
  }
  query += " WHERE id=?";
  params.push(id);
  await db.query(query, params);
  res.json({ message: "Usuario actualizado correctamente." });
};

// Eliminar usuario
export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.query("DELETE FROM usuarios WHERE id=?", [id]);
  res.json({ message: "Usuario eliminado correctamente." });
};