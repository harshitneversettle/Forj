import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { backend_url } from "../config/be_url";
import { FaLock } from "react-icons/fa";

export default function AdminDashboard() {
  const eventIdRef = useRef<HTMLInputElement | null>(null);
  const [showdata, setShowdata] = useState(false);
  const { publicKey } = useWallet();
  console.log(publicKey?.toString());
  const address = publicKey?.toString();
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState<[]>();

  async function handleCheck() {
    if (!eventIdRef.current) return;
    const query = eventIdRef.current.value;
    console.log(query);
    const resopnse = await axios.post(`${backend_url}/api/get-all-students`, {
      address,
      eventId: eventIdRef.current.value,
    });
    console.log(resopnse.data.payload);
    setData1(resopnse.data.payload);
    setShowdata(true);
    eventIdRef.current.value = "";
  }

  useEffect(() => {
    if (!address) return;
    async function temp() {
      const response = await axios.post(`${backend_url}/api/get-all-eventIds`, {
        address,
        eventId: eventIdRef.current?.value,
      });
      setData2(response.data.payload);
    }
    temp();
  }, [address]);

  if (!publicKey) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <FaLock size={28} className="text-zinc-200" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white text-2xl font-semibold">
              Wallet not connected
            </p>
            <p className="text-gray-500 text-md">
              Connect your Solana wallet to issue certificates
            </p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex justify-between gap-50 pb-40 ">
        <div className="flex flex-col gap-10 mt-10 ">
          <div className="">
            <input
              ref={eventIdRef}
              type="number"
              className="text-black bg-white text-lg mr-5"
              placeholder="Enter eventId"
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleCheck();
                }
              }}
            />
            <button
              className="bg-white rounded-md px-1 py-1 border border-zinc-200 "
              onClick={handleCheck}
            >
              check
            </button>
          </div>

          <div className="text-white border text-left border-zinc-200/20 rounded-2xl p-5">
            <table className="w-100">
              <thead className=" border-b  border-zinc-700 text-lg uppercase">
                <tr>
                  <th>event name</th>
                  <th>Event Id</th>
                </tr>
              </thead>
              <tbody className="">
                {data2?.map((i: any) => (
                  <tr>
                    <td className="pt-5 text-md">{i.eventName}</td>
                    <td className="pt-5 text-md">
                      <button
                        onClick={() => {
                          if (!eventIdRef.current) return;
                          eventIdRef.current.value = i.eventId;
                        }}
                        className="w-fit px-5 inline-flex items-center gap-1.5 text-sm px-2 py-1 rounded-md bg-gray-700/20 border-white/20
                        text-white/100 border hover:bg-gray-600 hover:scale[1.5] transition-all duration-200 hover:scale-[1.25]"
                      >
                        {i.eventId}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showdata && (
          <div className="text-white tracking-widest w-full border border-zinc-200/20 mt-10 rounded-2xl px-5">
            <div className="text-white text-left ">
              <table className="w-full mt-10 mb-5">
                <thead className="border-b border-zinc-700 text-lg uppercase ">
                  <tr>
                    <th>email</th>
                    <th>claimed status</th>
                    <th>Claimed at</th>
                  </tr>
                </thead>
                <tbody className="">
                  {data1?.map((i: any) => (
                    <tr>
                      <td className="pt-5 text-md">{i.studentEmail}</td>
                      <td className="pt-5 text-md">
                        <span
                          className={`min-w-30 inline-flex items-center gap-1.5 text-sm px-2 py-1 rounded-md ${
                            i.claimStatus
                              ? `bg-green-500/50 border-white/20`
                              : `bg-red-500/10 border-red-700/60`
                          } text-white/100 border `}
                        >
                          {`${i.claimStatus ? `Claimed` : "Unclaimed"} `}
                        </span>
                      </td>
                      <td className="pt-5 text-md">{i.claimedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
