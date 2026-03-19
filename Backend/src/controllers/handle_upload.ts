import buildMerkleTreeAndProofs from "../helpers/merkle_stuff";
import process_file from "../helpers/process_files";
import {getPinata} from "../config/pinata";

export default async function handle_upload(req: any, res: any) {
  let { eventName, eventId } = req.body;
  if (!req.files || Array.isArray(req.files)) { 
    return res.status(400).json({ error: "Files not received correctly" });
  }
  const csvFile = req.files["csv"]?.[0];
  const templateFile = req.files["template"]?.[0];
  const { all_students, cid1, cid2 } = await process_file(
    csvFile,
    templateFile,
  );
  const { root, merkleProof } = buildMerkleTreeAndProofs(all_students);
  const pinata : any = getPinata() ;
  let result3 = await pinata.pinJSONToIPFS(merkleProof);
  let cid3 = result3.IpfsHash;

  let batchSize = all_students.length;
  const bitmapSize = Math.ceil(batchSize / 8);
  const bitMap = Buffer.alloc(bitmapSize);
  const merkleRoot = Array.from(
    Buffer.from(root.startsWith("0x") ? root.slice(2) : root, "hex"),
  );
  let metadataUri = `https://gateway.pinata.cloud/ipfs/${cid1}`;
  let templateUri = `https://gateway.pinata.cloud/ipfs/${cid2}`;
  let merkleProofUri = `https://gateway.pinata.cloud/ipfs/${cid3}`;
  // console.log(merkleProofUri);
  const data = {
    uniqueKey: eventId,
    eventName,
    eventId,
    batchSize,
    bitMap,
    merkleRoot,
    metadataUri,
    templateUri,
    all_students ,
    merkleProofUri,
  };
  res.json(data);
}
