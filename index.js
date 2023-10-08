import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import errorMiddleware from "./middleware/errorMiddleware.js";
import path from "path";
import helmet from "helmet";
import dbConnection from "./dbConfig/index.js";
import router from "./routes/index.js";

const __dirname = path.resolve(path.dirname(""));

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "views/build")));

const PORT = process.env.PORT || 8800;

dbConnection();

app.use(helmet());

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET, PUT, POST, DELETE',
    credentials: true,
}
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(router);


app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on Port: ${PORT}`);
});
