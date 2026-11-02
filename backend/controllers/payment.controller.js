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

const editPaymentHistory = async (req, res) => {
  const { id } = req.params;
  const { amount_paid, payment_method } = req.body;

  const newAmount = Number(amount_paid);

  try {
    if (isNaN(newAmount) || newAmount < 0) {
      return res.status(400).json({
        message: "Please enter a valid payment amount (must be 0 or greater)",
      });
    }

    const history = await prisma.paymentHistory.findUnique({
      where: { id: parseInt(id) },
      include: {
        payment: {
          include: {
            history: true,
          },
        },
      },
    });

    if (!history) {
      return res.status(404).json({
        message: "Payment transaction record not found",
      });
    }

    // Check if new total paid would exceed finalFee
    const otherHistoriesPaid = history.payment.history
      .filter((h) => h.id !== history.id)
      .reduce((sum, h) => sum + Number(h.amountPaid), 0);

    const projectedTotalPaid = otherHistoriesPaid + newAmount;
    const finalFee = Number(history.payment.finalFee);

    if (projectedTotalPaid > finalFee) {
      return res.status(400).json({
        message: `Total payment cannot exceed final fee of ₹${finalFee.toLocaleString("en-IN")}. Maximum allowed for this entry is ₹${Math.max(0, finalFee - otherHistoriesPaid).toLocaleString("en-IN")}`,
      });
    }

    let updatedHistory = null;
    let updatedPayment = null;

    await prisma.$transaction(async (tx) => {
      // 1. Update Payment History
      updatedHistory = await tx.paymentHistory.update({
        where: { id: parseInt(id) },
        data: {
          amountPaid: newAmount,
          ...(payment_method && { paymentMethod: payment_method.trim() }),
        },
      });

      // 2. Recalculate Payment totals
      const newBalance = Math.max(0, finalFee - projectedTotalPaid);

      updatedPayment = await tx.payment.update({
        where: { id: history.paymentId },
        data: {
          totalPaid: projectedTotalPaid,
          balance: newBalance,
        },
      });
    });

    return res.status(200).json({
      message: "Payment transaction updated successfully",
      data: {
        history: updatedHistory,
        payment: updatedPayment,
      },
    });
  } catch (error) {
    console.error("Error in editPaymentHistory:", error);
    return res.status(500).json({
      message: "Error while updating payment transaction",
    });
  }
};

module.exports = {
  addPayment,
  getAllPayments,
  editPaymentHistory,
};
