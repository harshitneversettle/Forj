import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import upload_route from "./routes/upload_route";
import claim_route from "./routes/claim_route";
import verify_route from "./routes/verify_route";
import generate_cert_route from "./routes/generate_cert_route";
import update_event_route from "./routes/update_event_route";
import update_student_route from "./routes/update_student_route";
import send_mails_route from "./routes/send_mails_route";
import get_all_students_route from "./routes/get_all_students_route";
import get_all_eventIds_route from "./routes/get_all_eventIds_route";
;

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
app.use("/api/update-event", update_event_route);
app.use("/api/update-students", update_student_route);
app.use("/api/send-emails", send_mails_route);
app.use("/api/get-all-students", get_all_students_route);
app.post("/api/get-all-eventIds", get_all_eventIds_route);
app.listen(3001, () => {
  console.log(`Server running on http://localhost:${3001}`);
});
