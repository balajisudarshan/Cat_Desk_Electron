const prisma = require("../config/prisma");

const addPayment = async (req, res) => {
  const { reg_no, amount_paid, payment_method } = req.body;
  const paidAmount = Number(amount_paid);

  try {
    if (!reg_no || !payment_method || isNaN(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({
        message: "Please enter valid reg_no, amount_paid and payment_method",
      });
    }

    const student = await prisma.student.findUnique({
      where: { regNo: reg_no },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student with this registration number not found",
      });
    }

    const outstandingPayments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
        balance: { gt: 0 },
      },
      orderBy: { id: "asc" },
    });

    if (outstandingPayments.length === 0) {
      return res.status(404).json({
        message: "No pending payment record found for this student",
      });
    }

    const totalBalance = outstandingPayments.reduce(
      (sum, row) => sum + Number(row.balance),
      0
    );

    if (paidAmount > totalBalance) {
      return res.status(400).json({ message: "Amount Exceeds Balance" });
    }

    // Execute deductions within a transaction
    let remaining = paidAmount;
    let lastUpdatedPayment = null;

    await prisma.$transaction(async (tx) => {
      for (const row of outstandingPayments) {
        if (remaining <= 0) break;

        const currentBalance = Number(row.balance);
        const deduct = Math.min(remaining, currentBalance);

        const updated = await tx.payment.update({
          where: { id: row.id },
          data: {
            totalPaid: { increment: deduct },
            balance: { decrement: deduct },
          },
        });
        lastUpdatedPayment = updated;

        await tx.paymentHistory.create({
          data: {
            paymentId: row.id,
            amountPaid: deduct,
            paymentMethod: payment_method,
            paymentDate: new Date(),
          },
        });

        remaining -= deduct;
      }
    });

    return res.status(200).json({
      message: "Payment added successfully",
      data: lastUpdatedPayment,
    });
  } catch (error) {
    console.error("Error in addPayment:", error);
    return res.status(500).json({
      message: "Internal Server Error when adding payment",
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            regNo: true,
            phone: true,
            email: true,
          },
        },
        history: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { id: "desc" },
    });

    const formatted = payments.map((p) => {
      const balance = Number(p.balance);
      const totalPaid = Number(p.totalPaid);
      const finalFee = Number(p.finalFee);

      let status = "Paid";
      if (balance > 0 && totalPaid > 0) {
        status = "Partial";
      } else if (balance > 0 && totalPaid === 0) {
        status = "Pending";
      }

      const latestHistory = p.history[0];

      return {
        id: `INV-${String(p.id).padStart(4, "0")}`,
        rawId: p.id,
        studentId: p.student.id,
        student: p.student.name,
        regNo: p.student.regNo,
        phone: p.student.phone,
        email: p.student.email,
        totalFee: Number(p.totalFee),
        discount: Number(p.discount),
        finalFee: finalFee,
        totalPaid: totalPaid,
        balance: balance,
        paymentMode: p.paymentMode || "Full Payment",
        method: latestHistory?.paymentMethod || p.paymentMode || "Cash",
        date: latestHistory?.paymentDate || p.createdAt,
        status: status,
        historyCount: p.history.length,
      };
    });

    const totalCollected = formatted.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalPending = formatted.reduce((sum, item) => sum + item.balance, 0);
    const totalBilled = formatted.reduce((sum, item) => sum + item.finalFee, 0);
    const completedCount = formatted.filter((item) => item.status === "Paid").length;
    const pendingCount = formatted.filter((item) => item.balance > 0).length;

    return res.status(200).json({
      payments: formatted,
      summary: {
        totalCollected,
        totalPending,
        totalBilled,
        completedCount,
        pendingCount,
        totalInvoices: formatted.length,
      },
    });
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    return res.status(500).json({ message: "Error fetching payments" });
  }
};

module.exports = {
  addPayment,
  getAllPayments,
};
