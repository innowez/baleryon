import express from "express";
import next from "next";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

import connect from "./connect/connect.js";
import { errorHandler, notFound } from "./middlewares/errorMiddlware.js";
import productRouter from "./routes/productRouter.js";
import shopProductRouter from "./routes/shopProductRouter.js";
import userManagmentRouter from "./routes/userManagmentRouter.js";
import catalogRouter from "./routes/catalogRouter.js";
import cmsRouter from "./routes/cmsRouter.js";
import authRouter from "./routes/authRouter.js";
import sanitizedConfig from "./config.js";

let dev = sanitizedConfig.NODE_ENV === "production";
const nextApp = next({
  dev,
  dir: path.join(process.cwd(), "../client"),
});
const handle = nextApp.getRequestHandler();

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// db Connectig
connect()
  .then(() => console.log("PostgreSQL connected (Prisma)"))
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

app.use("/api/auth", authRouter);
app.use("/api/shop/products", shopProductRouter);
app.use("/api/admin/product/", productRouter);
app.use("/api/admin/catalog/", catalogRouter);
app.use("/api/admin/cms/", cmsRouter);

// user managment router
app.use("/api/admin/userManagment/", userManagmentRouter);

// let dirname = path.resolve();

// if (sanitizedConfig.NODE_ENV === "production") {
//   try {
//     app.use(express.static(path.join(dirname, "../client", ".next")));

//     app.use((req, res) => {
//       res.sendFile(path.resolve(dirname, "../client", ".next", "index.html"));
//     });
//   } catch (error) {
//     console.log(
//       error,
//       "errorerrorerrorerrorerrorerrorerrorerrorerrorerrorerrorerror"
//     );
//   }
// }

// app.get("/", (req, res) => {
//   res.send("API is running!");
// });

nextApp.prepare().then(() => {
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  app.use(notFound);
  app.use(errorHandler);

  const PORT = sanitizedConfig.PORT || 8000;

  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// const PORT = sanitizedConfig.PORT || 8000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
