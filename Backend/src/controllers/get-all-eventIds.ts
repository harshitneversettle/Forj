import { db } from "../db";

export default async function handle_get_all_eventIds(req: any, res: any) {
  const { address } = req.body;
  console.log(address);
  try {
    const data = await db.admins.findFirst({
      where: { address: address },
    });
    if (!data) {
      return res.status(200).json({
        error: "no entry found",
      });
    }
    const id = data.id;
    console.log(data.id);

    const data2 = await db.events.findMany({
      where: { adminId: id },
    });
    const student_details = data2.map((i) => {
      return {
        eventId: i.eventId,
        eventName: i.eventName,
      };
    });
    console.log(student_details);
    return res.json({
      status: "successful",
      payload: student_details,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      error: "something went wrong",
    });
  }
}
