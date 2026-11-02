const prisma = require("../config/prisma");

const getFullHistory = async (req, res) => {
  const { regNo } = req.params;

  try {
    const student = await prisma.student.findUnique({
      where: { regNo },
      include: {
        enrollments: {
          include: {
            course: true,
            batch: true,
          },
        },
        payments: {
          include: {
            history: {
              orderBy: { paymentDate: "desc" },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student with this registration number not found",
      });
    }

    const enrollments = student.enrollments.map((e) => ({
      course_name: e.course.name,
      batch_name: e.batch?.batchName || null,
      timings: e.timings || (e.batch ? `${e.batch.startTime} - ${e.batch.endTime}` : "N/A"),
      course_fee: Number(e.courseFee),
    }));

    const payments = student.payments.map((p) => ({
      id: p.id,
      total_fee: Number(p.totalFee),
      discount: Number(p.discount),
      final_fee: Number(p.finalFee),
      payment_mode: p.paymentMode,
      total_paid: Number(p.totalPaid),
      balance: Number(p.balance),
    }));

    const paymentHistory = student.payments.flatMap((p) =>
      p.history.map((h) => ({
        id: h.id,
        payment_id: h.paymentId,
        amount_paid: Number(h.amountPaid),
        payment_method: h.paymentMethod,
        payment_date: h.paymentDate,
      }))
    );

    return res.json({
      student: {
        id: student.id,
        name: student.name,
        reg_no: student.regNo,
        phone: student.phone,
        email: student.email,
        address: student.address,
        status: student.status,
      },
      enrollments,
      payments,
      paymentHistory,
    });
  } catch (error) {
    console.error("Error in getFullHistory:", error);
    return res.status(500).json({ message: "Error while fetching history" });
  }
};

module.exports = getFullHistory;