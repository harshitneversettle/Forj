import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";
import { student } from "../types";
import { getPinata } from "../config/pinata";

export default async function process_file(
  csvFile: Express.Multer.File,
  templateFile: Express.Multer.File,
) {
  let file = csvFile.buffer.toString("utf8").split("\n");
  let all_students: student[] = [];
  file?.map((i) => {
    let arr = i.split(",");
    let name = arr[0];
    let enroll = arr[1];
    let email = arr[2];
    let position = arr[3] || null;
    const user: student = {
      name,
      enroll,
      email,
      position,
    };
    all_students.push(user);
  });

  // console.log(all_students);
  // used for uploding json

  const pinata = getPinata();
  const result1 = await pinata.pinJSONToIPFS(all_students);
  const cid1 = result1.IpfsHash;
  const template_stream = Readable.from(templateFile.buffer);
  const result2 = await pinata.pinFileToIPFS(template_stream, {
    pinataMetadata: {
      name: "template",
    },
  });
  const cid2 = result2.IpfsHash;

  return { all_students, cid1, cid2 };
}
