import { db } from "../db";

export default async function handle_get_all_students(req: any, res: any) {
  const { address, eventId } = req.body;
  let all_students: any = [];
  try {
    const data = await db.allStudents.findMany({
      where: { eventId: Number(eventId) },
    });
    if (!data) {
      return res.status(500).json({
        error: "no entry found",
      });
    }
    all_students = data.map((i) => {
      return {
        studentEmail: i.studentmail,
        claimedAt: i.createdAt,
        claimStatus: i.claimStatus,
      };
    });
    return res.json({
      status: "successful",
      payload: all_students,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      error: "something went wrong",
    });
  }
}
