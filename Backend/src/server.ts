import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import upload_route from "./routes/upload_route";
import claim_route from "./routes/claim_route";
import verify_route from "./routes/verify_route";
import generate_cert_route from "./routes/generate_cert_route";

let app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://forj.harshityad4v.in"],
    credentials: true,
  }),
);

app.use("/api/upload", upload_route);
app.use("/api/claim", claim_route);
app.use("/api/generate-certificate", generate_cert_route);
app.use("/api/verify", verify_route);

app.listen(3001, () => {
  console.log(`Server running on http://localhost:${3001}`);
});
