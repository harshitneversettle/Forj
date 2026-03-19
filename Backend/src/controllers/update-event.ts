import { db } from "../db";

export default async function handle_update_event(req: any, res: any) {
  console.log("insode update event ");
  const { eventName, eventId, issueAmount, adminAddress } = req.body;
  try {
    const check = await db.events.findUnique({
      where: { eventId: Number(eventId) },
    });
    if (check) {
      res.json({
        message: "event already exists",
      });
    }
    const response = await db.events.create({
      data: {
        eventName,
        eventId: Number(eventId),
        issueAmount,
        admin: {
          connectOrCreate: {
            where: { address: adminAddress },
            create: { address: adminAddress },
          },
        },
      },
    });
    res.json({
      messsage: "successful",
      payload: response,
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: "Something is wrong , try again",
    });
  }
}
