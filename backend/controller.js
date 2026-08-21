import express from "express";
import { saveAttendee, updateAttendeeCurrency } from "./service.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const controller = {};

controller.saveUser = async (req, res) => {
    try {
        const { firstName, lastName, birthdate, currency } = req.body;
        console.log(firstName, lastName, birthdate, currency);

        const data = await saveAttendee({ firstName, lastName, birthdate, currency });
        res.json({ message: "Attendee saved successfully", data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

controller.updateUserCurrency = async (req, res) => {
    try {
        const { id } = req.params;
        const { currency } = req.body;
        console.log(id, currency);

        await updateAttendeeCurrency(id, currency);
        res.json({ message: "Attendee currency updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export default controller;