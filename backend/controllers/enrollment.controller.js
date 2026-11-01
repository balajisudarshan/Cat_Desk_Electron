const prisma = require("../config/prisma");

const addEnrollment = async (req, res) => {
  const {
    reg_no,
    course_ids,
    batch_id,
    timings,
    discount,
    payment_mode,
    payment_type,
    amount_paid,
  } = req.body;

  const paid = Number(amount_paid || 0);

  try {
    if (!reg_no || !course_ids || course_ids.length === 0) {
      return res.status(400).json({
        message: "Please enter all required fields (reg_no and course_ids)",
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

    let parsedBatchId = batch_id ? parseInt(batch_id) : null;
    let resolvedTimings = timings || null;

    if (parsedBatchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: parsedBatchId },
      });
      if (batch) {
        resolvedTimings = `${batch.startTime} - ${batch.endTime} (${batch.days})`;
        // Also ensure student is added to batch_students
        await prisma.batchStudent.upsert({
          where: {
            batchId_studentId: {
              batchId: parsedBatchId,
              studentId: student.id,
            },
          },
          update: {},
          create: {
            batchId: parsedBatchId,
            studentId: student.id,
          },
        });
      }
    }

    const insertedCourse = [];
    let total_fee = 0;

    for (let rawCourseId of course_ids) {
      const courseId = parseInt(rawCourseId);
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) continue;

      // Check if already enrolled in this course
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          courseId: courseId,
        },
      });

      if (existingEnrollment) continue;

      const course_fee = Number(course.totalFee);
      total_fee += course_fee;

      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: courseId,
          batchId: parsedBatchId,
          timings: resolvedTimings,
          courseFee: course_fee,
        },
      });

      insertedCourse.push(courseId);
    }

    const dis = Number(discount || 0);
    const final_fee = total_fee - dis;
    const balance = final_fee - paid;

    const payment = await prisma.payment.create({
      data: {
        studentId: student.id,
        totalFee: total_fee,
        discount: dis,
        finalFee: final_fee,
        totalPaid: paid,
        balance: balance,
        paymentMode: payment_mode || "Cash",
      },
    });

    if (paid > 0) {
      await prisma.paymentHistory.create({
        data: {
          paymentId: payment.id,
          amountPaid: paid,
          paymentMethod: payment_type || payment_mode || "Cash",
          paymentDate: new Date(),
        },
      });
    }

    return res.status(201).json({
      message: "Enrollment added successfully",
      data: insertedCourse,
    });
  } catch (error) {
    console.error("Error in addEnrollment:", error);
    return res.status(500).json({
      message: "Error while adding enrollment",
    });
  }
};

const getStudentEnrollment = async (req, res) => {
  const { id } = req.params; // Can be numeric id or reg_no

  try {
    const isNum = !isNaN(Number(id));
    const student = await prisma.student.findFirst({
      where: isNum ? { OR: [{ id: parseInt(id) }, { regNo: id }] } : { regNo: id },
      include: {
        enrollments: {
          include: {
            course: true,
            batch: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const rows = student.enrollments.map((e) => ({
      student_name: student.name,
      reg_no: student.regNo,
      course_name: e.course.name,
      batch_name: e.batch?.batchName || null,
      timings: e.timings || (e.batch ? `${e.batch.startTime} - ${e.batch.endTime}` : "N/A"),
      course_fee: e.courseFee,
    }));

    return res.json(rows);
  } catch (error) {
    console.error("Error in getStudentEnrollment:", error);
    return res.status(500).json({
      message: "Error while getting enrollments",
    });
  }
};

module.exports = {
  addEnrollment,
  getStudentEnrollment,
};
