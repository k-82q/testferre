import { Router } from "express";
import { createOrder, success,  failure, pending, webhook} from "../controller/payment.controller";

const paymentRoutes = Router();

paymentRoutes.post("/create", createOrder);
paymentRoutes.get("/success", success);
paymentRoutes.get("/failure", failure);
paymentRoutes.get("/pending", pending);

paymentRoutes.post("/webhook", webhook);

export default paymentRoutes;
