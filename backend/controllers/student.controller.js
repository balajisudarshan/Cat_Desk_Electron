const prisma = require("../config/prisma");

const addStudent = async (req, res) => {
  const { name, phone, f_name, address, email, regNo } = req.body;

  try {
    if (!name || !phone || !f_name || !address || !regNo) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const student = await prisma.student.create({
      data: {
        name,
        phone,
        fName: f_name,
        address,
        email: email || null,
        regNo,
        status: true,
      },
    });

    return res.json({
      message: "Student added successfully",
      data: {
        id: student.id,
        name: student.name,
        phone: student.phone,
        f_name: student.fName,
        address: student.address,
        status: student.status,
        email: student.email,
        reg_no: student.regNo,
      },
    });
  } catch (error) {
    console.error("Error in addStudent:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Student with this Registration Number already exists",
      });
    }
    return res.status(500).json({ message: "Error while adding the student" });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        batchStudents: {
          include: {
            batch: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const formatted = students.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      f_name: s.fName,
      address: s.address,
      status: s.status,
      email: s.email,
      reg_no: s.regNo,
      batches: s.batchStudents.map((bs) => ({
        batch_id: bs.batchId,
        batch_name: bs.batch.batchName,
        timings: `${bs.batch.startTime} - ${bs.batch.endTime}`,
        days: bs.batch.days,
        status: bs.status,
      })),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    return res.status(500).json({ message: "Error while fetching the students" });
  }
};

const updateStudentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof status !== "boolean") {
    return res.status(400).json({ message: "Invalid status, must be boolean" });
  }

  try {
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return res.status(200).json({
      message: "Status updated successfully",
      data: {
        id: student.id,
        name: student.name,
        status: student.status,
      },
    });
  } catch (err) {
    console.error("Error in updateStudentStatus:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.status(500).json({ message: "Error while updating the student" });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await prisma.student.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      message: "Student Deleted Successfully",
      data: {
        id: student.id,
        name: student.name,
        reg_no: student.regNo,
      },
    });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.status(500).json({ message: "Error occurred when deleting the student" });
  }
};

const getStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
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
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      id: student.id,
      name: student.name,
      phone: student.phone,
      f_name: student.fName,
      address: student.address,
      status: student.status,
      email: student.email,
      reg_no: student.regNo,
      enrollments: student.enrollments,
    });
  } catch (error) {
    console.error("Error in getStudent:", error);
    return res.status(500).json({ message: "Error while fetching the student" });
  }
};

const getStudentByRegNo = async (req, res) => {
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
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      id: student.id,
      name: student.name,
      phone: student.phone,
      f_name: student.fName,
      address: student.address,
      status: student.status,
      email: student.email,
      reg_no: student.regNo,
      enrollments: student.enrollments,
    });
  } catch (error) {
    console.error("Error in getStudentByRegNo:", error);
    return res.status(500).json({ message: "Error while fetching the student" });
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  updateStudentStatus,
  deleteStudent,
  getStudent,
  getStudentByRegNo,
};
