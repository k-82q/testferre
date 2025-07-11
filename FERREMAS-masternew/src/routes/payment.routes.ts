import { Router } from "express";
import { createOrder, webhook} from "../controller/payment.controller";

const paymentRoutes = Router();

paymentRoutes.post("/create", createOrder);


paymentRoutes.post("/webhook", webhook);

export default paymentRoutes;
