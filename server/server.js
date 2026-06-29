import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import connect from "./connect/connect.js";
import { errorHandler, notFound } from "./middlewares/errorMiddlware.js";
import productRouter from "./routes/productRouter.js";
import shopProductRouter from "./routes/shopProductRouter.js";
import userManagmentRouter from "./routes/userManagmentRouter.js";
import catalogRouter from "./routes/catalogRouter.js";
import cmsRouter from "./routes/cmsRouter.js";
import orderRouter from "./routes/orderRoutes.js";
import orderTrackingRouter from "./routes/orderTrackerRouter.js";
import addressesRouter from "./routes/addressRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
// landing
import categoryRoute from "./routes//landing/categoryRoute.js";
import limitedSeasonRoute from "./routes/landing/limitedSeasonRoute.js";
import BannerRouter from "./routes/landing/bannerRouter.js"
import communityRoutes from "./routes/landing/communityRoutes.js"


import deliveryRoutes from "./routes/deliveryRouter.js"
import couponRoutes from "./routes/couponRoutes.js"





import authRouter from "./routes/authRouter.js";
import sanitizedConfig from "./config.js";

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
app.use("/api/orders", orderRouter);
app.use("/api/viewOrders", orderTrackingRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/limited-season", limitedSeasonRoute);
app.use("/api/banner", BannerRouter);
app.use("/api/community", communityRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/coupons", couponRoutes);

app.use("/api/addresses", addressesRouter);


// user managment router
app.use("/api/admin/userManagment/", userManagmentRouter);

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use(notFound);
app.use(errorHandler);

const PORT = sanitizedConfig.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
