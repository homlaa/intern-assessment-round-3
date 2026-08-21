//set up a dev servers running onport 5000 
import express from "express";
import cors from "cors";
import controller from "./controller.js";
import { initDb } from "./service.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/api/attendees", controller.saveUser);
app.patch("/api/attendees/:id", controller.updateUserCurrency);

initDb().then(() => {
    app.listen(5000, () => {
        console.log("Server is running on port 5000");
    });
}).catch(err => {
    console.error("Failed to initialize database", err);
});