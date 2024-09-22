import express from "express";
import { doctorRouter } from "./doctor-router";

export const routes = express.Router();

routes.use("/doctor", doctorRouter);