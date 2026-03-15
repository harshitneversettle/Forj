import MerkleTree from "merkletreejs";
import crypto from "crypto";
import { student } from "../types";
import { Make_hash } from "./making_hashes";

export default function buildMerkleTreeAndProofs(all_students: student[]) {
  // making hashes
  const leaves = all_students.map((i) => {
    const data = JSON.stringify(i, Object.keys(i).sort());
    return Make_hash(data);
  });

  // basically the 2nd parameter , hash function is there , to define if we have to need to hash something (ever) use this hash function
  const Merkle_tree = new MerkleTree(
    leaves,
    (i: any) => {
      return Make_hash(i);
    },
    { sortPairs: true },
  );

  // merkle proof har student ke hash se node tk pauchne me jo jo nodes help krte hain un sbke hash  ,, like siblings

  let merkleProof = all_students.map((i) => {
    const data = JSON.stringify(i, Object.keys(i).sort());
    const hash = Make_hash(data);
    return Merkle_tree.getHexProof(hash);
  });
  const root = Merkle_tree.getHexRoot();
  
  return { root, merkleProof };
}
