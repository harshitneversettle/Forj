import axios from "axios";
import { PDFDocument } from "pdf-lib";

export async function generate_certificate(req : any , res : any){
     const { templateUri, ...data } = req.body;
     console.log(data);
     const response = await axios.get(templateUri, {
       responseType: "arraybuffer",
     });
     const certificate = await PDFDocument.load(response.data);
     const form = certificate.getForm();

     Object.entries(data).forEach(([key, val]) => {
       try {
         form.getTextField(key).setText(val as string);
       } catch {}
     });
     form.flatten();
     const pdfBytes = await certificate.save();
     res.send(Buffer.from(pdfBytes));
}