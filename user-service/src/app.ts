import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import appConfig from "./config/app.config";
import userRoutes from "./routes/user.routes";
import creatorRoutes from "./routes/creator.routes";
import adminRoutes from "./routes/admin.routes";
import walletRoutes from "./routes/wallet.routes";
import balanceRoutes from "./routes/balance.routes";

class App {
    private app: Express;

    constructor() {
        this.app = express()

        this.initMiddlewares();
        this.initRoutes();
    }

    private initMiddlewares() {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(cors({
            origin: "http://localhost:3000",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            credentials: true
        }))
    }

    private initRoutes() {
        this.app.use("/api/auth", authRoutes);
        this.app.use("/api/user", userRoutes);
        this.app.use("/api/balance", balanceRoutes);
        this.app.use("/api/creators", creatorRoutes);
        this.app.use("/api/admin", adminRoutes);
        this.app.use("/api/wallet", walletRoutes);
    }

    public start() {
        const { port, host } = appConfig;

        this.app.listen(port, host, () => {
            console.log(`server is running on http://${host}:${port}`);

        })
    }
}

export default App;