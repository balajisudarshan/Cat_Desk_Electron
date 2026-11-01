const PDFDocument = require("pdfkit");
const prisma = require("../config/prisma");

const generateReceipt = async (req, res) => {
  try {
    const { reg_no } = req.params;
    const requestedIds =
      req.body?.history_ids ||
      (req.query?.history_ids
        ? String(req.query.history_ids).split(",").map(Number)
        : null);

    const student = await prisma.student.findUnique({
      where: { regNo: reg_no },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        payments: {
          include: {
            history: {
              orderBy: { paymentDate: "asc" },
            },
          },
        },
      },
    });

    if (!student || student.payments.length === 0) {
      return res.status(404).json({
        message: "Student or payment record not found",
      });
    }

    // Flatten payment history items
    let allHistory = [];
    let totalFee = 0;
    let totalPaid = 0;
    let balance = 0;

    student.payments.forEach((p) => {
      totalFee += Number(p.totalFee);
      totalPaid += Number(p.totalPaid);
      balance += Number(p.balance);

      p.history.forEach((h) => {
        allHistory.push({
          receipt_id: h.id,
          amount_paid: Number(h.amountPaid),
          payment_method: h.paymentMethod,
          payment_date: h.paymentDate,
        });
      });
    });

    // If specific history IDs were selected (some vs all)
    if (requestedIds && Array.isArray(requestedIds) && requestedIds.length > 0) {
      allHistory = allHistory.filter((h) =>
        requestedIds.includes(Number(h.receipt_id))
      );
    }

    if (allHistory.length === 0) {
      return res.status(404).json({
        message: "No payment history found matching the selected items",
      });
    }

    const coursesList = student.enrollments
      .map((e) => e.course?.name)
      .filter(Boolean)
      .join(", ") || "General Enrollment";

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${student.regNo}.pdf`
    );

    doc.pipe(res);

    // --- Header Banner ---
    doc.rect(0, 0, 600, 95).fill("#1E3A8A");

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("FEE PAYMENT RECEIPT", 45, 25);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#93C5FD")
      .text("Official Student Fee Acknowledgement", 45, 52);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("white")
      .text(`Receipt Date: ${new Date().toLocaleDateString("en-IN")}`, 400, 30, { align: "right", width: 155 })
      .text(`Reg No: ${student.regNo}`, 400, 50, { align: "right", width: 155 });

    doc.fillColor("black");

    // --- Student Information Card ---
    let y = 115;
    doc
      .roundedRect(40, y, 520, 85, 6)
      .lineWidth(1)
      .strokeColor("#E5E7EB")
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#1E3A8A")
      .text("Student Details", 55, y + 12);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#374151")
      .text(`Student Name: `, 55, y + 35, { continued: true })
      .font("Helvetica-Bold")
      .text(student.name)
      .font("Helvetica")
      .text(`Contact: ${student.phone || "N/A"}`, 55, y + 55);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Registration No: `, 320, y + 35, { continued: true })
      .font("Helvetica-Bold")
      .text(student.regNo)
      .font("Helvetica")
      .text(`Courses: ${coursesList}`, 320, y + 55, { width: 220, ellipsis: true });

    // --- Transactions Table Header ---
    y += 110;
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#1E3A8A")
      .text("Payment Breakdown", 42, y);

    y += 20;
    doc
      .fillColor("#1E3A8A")
      .rect(40, y, 520, 24)
      .fill();

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Txn / Receipt ID", 55, y + 7)
      .text("Payment Date", 175, y + 7)
      .text("Payment Mode", 320, y + 7)
      .text("Amount Paid", 460, y + 7, { align: "right", width: 85 });

    y += 24;

    // --- Transactions Rows ---
    let selectedPaidSum = 0;
    allHistory.forEach((payment, index) => {
      selectedPaidSum += payment.amount_paid;

      if (index % 2 === 0) {
        doc.fillColor("#F8FAFC").rect(40, y, 520, 24).fill();
      }

      doc
        .fillColor("#1E293B")
        .font("Helvetica")
        .fontSize(9.5)
        .text(`#${payment.receipt_id}`, 55, y + 7)
        .text(new Date(payment.payment_date).toLocaleDateString("en-IN"), 175, y + 7)
        .text(String(payment.payment_method).toUpperCase(), 320, y + 7)
        .font("Helvetica-Bold")
        .text(`Rs. ${payment.amount_paid.toLocaleString("en-IN")}`, 460, y + 7, {
          align: "right",
          width: 85,
        });

      y += 24;
    });

    // Subtotal of selected payments line
    doc.rect(40, y, 520, 1).fillColor("#CBD5E1").fill();
    y += 12;

    // --- Fee Summary Box ---
    y += 10;
    doc
      .roundedRect(40, y, 520, 95, 6)
      .lineWidth(1)
      .strokeColor("#E2E8F0")
      .fillColor("#F8FAFC")
      .fillAndStroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0F172A")
      .text("Fee Account Summary", 55, y + 14);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#475569")
      .text(`Total Course Fee`, 55, y + 38)
      .font("Helvetica-Bold")
      .fillColor("#0F172A")
      .text(`Rs. ${totalFee.toLocaleString("en-IN")}`, 180, y + 38);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#475569")
      .text(`Selected Receipt Paid`, 55, y + 58)
      .font("Helvetica-Bold")
      .fillColor("#16A34A")
      .text(`Rs. ${selectedPaidSum.toLocaleString("en-IN")}`, 180, y + 58);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#475569")
      .text(`Overall Total Paid`, 320, y + 38)
      .font("Helvetica-Bold")
      .fillColor("#16A34A")
      .text(`Rs. ${totalPaid.toLocaleString("en-IN")}`, 430, y + 38);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#475569")
      .text(`Outstanding Balance`, 320, y + 58)
      .font("Helvetica-Bold")
      .fillColor(balance > 0 ? "#DC2626" : "#16A34A")
      .text(`Rs. ${balance.toLocaleString("en-IN")}`, 430, y + 58);

    y += 125;

    // --- Signatory & Stamp Section ---
    doc
      .moveTo(380, y + 30)
      .lineTo(540, y + 30)
      .strokeColor("#94A3B8")
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#475569")
      .text("Authorized Signatory", 380, y + 36, { align: "center", width: 160 });

    doc
      .font("Helvetica-Oblique")
      .fontSize(8.5)
      .fillColor("#94A3B8")
      .text("CAT Desk Administration", 55, y + 36);

    // --- Footer Note ---
    y += 75;
    doc
      .moveTo(40, y)
      .lineTo(560, y)
      .strokeColor("#E2E8F0")
      .lineWidth(0.5)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor("#94A3B8")
      .text("This is an official computer generated fee receipt. No physical signature required.", 0, y + 10, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("Error in generateReceipt:", error);
    return res.status(500).json({
      message: "Receipt generation failed",
    });
  }
};

module.exports = generateReceipt;
