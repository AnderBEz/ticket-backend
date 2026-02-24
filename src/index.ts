import express, { Application,  } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routers/auth/auth.router.js"
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger.js";
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth/tikme/",authRouter);

app.listen(PORT, () => {
    console.log(`localhost://${PORT}`);
});