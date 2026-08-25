import path from "path";
import express from "express";
import router from "./routes";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", router);
