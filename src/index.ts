import express, { Application,  } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routers/auth/auth.router.js"
import ticketsRouter from "./routers/tickets/tickets.router.js";
import eventsRouter from "./routers/events/events.router.js";
import ordersRouter from "./routers/orders/orders.router.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger.js";
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth/tikme/", authRouter);
app.use("/tickets", ticketsRouter);
app.use("/events", eventsRouter);
app.use("/orders", ordersRouter);

app.listen(PORT, () => {
    console.log(`localhost://${PORT}`);
});