
import express from "express";

const PORT = process.env.PORT;


const app = express();

console.log(PORT);

app.listen(PORT)