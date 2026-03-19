import { db } from "../db";

export default async function handle_update_students(req: any, res: any) {
  const { all_mails, eventId } = req.body;
  try {
    await db.allStudents.createMany({
      data: Object.entries(all_mails).map(([_, i]) => ({
        claimStatus: false,
        eventId: eventId,
        studentmail: i as string,
      })),
      skipDuplicates: true,
    });
    res.json({
      status: "successful",
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      error: "something went wrong",
    });
  }
}
