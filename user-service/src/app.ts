import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import appConfig from "./config/app.config.js";
import userRoutes from "./routes/user.routes.js";
import creatorRoutes from "./routes/creator.routes.js";
import adminRoutes from "./routes/admin.routes.js";

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
            origin: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            credentials: true
        }))
    }

    private initRoutes() {
        this.app.use("/api/auth", authRoutes);
        this.app.use("/api/user", userRoutes);
        this.app.use("/api/creators", creatorRoutes);
        this.app.use("/api/admin", adminRoutes);
    }

    public start() {
        const { port, host } = appConfig;

        this.app.listen(port, host, () => {
            console.log(`server is running on http://${host}:${port}`);

        })
    }
}

export default App;