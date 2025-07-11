import express, { Application } from "express";
import cors from "cors";
import path from "path";
import paymentRoutes from "./routes/payment.routes";
import productoRoutes from "./routes/producto.routes";
import authRoutes from "./routes/auth.routes";
import usuarioRoutes from "./routes/usuario.routes";
import pedidoRoutes from "./routes/pedido.routes";

export class Server{
    private app: Application;
    private port: string;
    private apiPaths= {
        pago: "/api/pago",
        productos: "/api/productos",
        auth: "/api/auth",
        usuarios: "/api/usuarios",
          pedidos: "/api/pedidos",
    };
    constructor(){
        this.app = express();
        this.port = process.env.PORT ?? '3000';
        this.middlewares();
        this.routes();
    }
    private routes(){
        this.app.use(this.apiPaths.pago, paymentRoutes);
        this.app.use(this.apiPaths.productos, productoRoutes);
        this.app.use(this.apiPaths.auth, authRoutes);
        this.app.use(this.apiPaths.usuarios, usuarioRoutes);
        this.app.use(this.apiPaths.pedidos, pedidoRoutes); 

    }

    private middlewares(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.resolve("src/public")));
    }
    public listen(){
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en el puerto: ", this.port);
        });
    }
}