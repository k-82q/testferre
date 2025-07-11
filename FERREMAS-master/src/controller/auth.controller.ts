import { Request, Response } from "express";
import { db } from "../database/conexion";
import bcrypt from "bcryptjs";
import validator from "validator";

// Login
export const login = async (req: Request, res: Response) => {
  const { correo, clave } = req.body;

  // Validación básica de campos vacíos
  if (!correo || !clave) {
    return res.status(400).json({ error: "Debes ingresar correo y contraseña." });
  }

  // Validación de formato de correo
  if (!validator.isEmail(correo)) {
    return res.status(400).json({ error: "Correo electrónico no válido." });
  }

  // Validación de contraseña
  try {
    const [rows]: any = await db.query("SELECT * FROM usuarios WHERE Correo = ?", [correo]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(clave, usuario.Clave);// Compara la contraseña ingresada con la almacenada
    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    res.json({
      message: "¡Inicio de sesión exitoso!",
      usuario: {
        id: usuario.id,
        nombre: usuario.NombreCompleto,
        correo: usuario.Correo,
        rol: usuario.Rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Registro de usuario
export const register = async (req: Request, res: Response) => {
  const { nombre, correo, clave } = req.body;

  // Validación básica de campos vacíos
  if (!nombre || !correo || !clave) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  // Validación de nombre
  if (nombre.trim() === "") {
    return res.status(400).json({ error: "El nombre no puede estar vacío." });
  }
  if (nombre.length < 3 || nombre.length > 30) {
    return res.status(400).json({ error: "El nombre debe tener entre 3 y 30 caracteres." });
  }
  // Validación de correo
  if (!validator.isEmail(correo)) {
    return res.status(400).json({ error: "Correo electrónico no válido." });
  }

  // Validación de contraseña(caracteres, mayúsculas, minúsculas y números)
  if (
    !validator.isStrongPassword(clave, {
      minLength: 5,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    return res.status(400).json({
      error:
        "La contraseña debe tener al menos 5 caracteres, una mayúscula, una minúscula y un número.",
    });
  }

  try {
    // Verifica si el correo ya existe
    const [rows]: any = await db.query("SELECT * FROM usuarios WHERE Correo = ?", [correo]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }

    // Hashea la contraseña
    const hash = await bcrypt.hash(clave, 10);

    // Inserta el usuario
    await db.query(
      "INSERT INTO usuarios (NombreCompleto, Correo, Clave) VALUES (?, ?, ?)",
      [nombre, correo, hash]
    );

    res.json({ message: "Usuario registrado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario." });
  }
};
