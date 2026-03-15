import pinataSDK from "@pinata/sdk";
export function getPinata() {
  const pinata = new pinataSDK({ pinataJWTKey : process.env.JWT });
  return pinata;
}
