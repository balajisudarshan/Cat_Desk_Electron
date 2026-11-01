const prisma = require("../config/prisma");

const addCourse = async (req, res) => {
  const { name, totalFee, duration, description } = req.body;

  try {
    if (!name || totalFee === undefined) {
      return res.status(400).json({ message: "Course name and total fee are required" });
    }

    const course = await prisma.course.create({
      data: {
        name,
        totalFee: Number(totalFee),
        duration: duration || null,
        description: description || null,
      },
    });

    return res.json({
      id: course.id,
      name: course.name,
      total_fee: course.totalFee,
      duration: course.duration,
      description: course.description,
    });
  } catch (error) {
    console.error("Error in addCourse:", error);
    return res.status(500).json({ message: "Error occurred while adding course" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        batches: {
          select: {
            id: true,
            batchName: true,
            batchCode: true,
            startTime: true,
            endTime: true,
            days: true,
            status: true,
            maxStudents: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const formatted = courses.map((c) => ({
      id: c.id,
      name: c.name,
      total_fee: c.totalFee,
      duration: c.duration,
      description: c.description,
      batches: c.batches,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in getAllCourses:", error);
    return res.status(500).json({ message: "Error fetching courses" });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.course.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(500).json({ message: "Error occurred when deleting the course" });
  }
};

const updateCourseFee = async (req, res) => {
  const { id } = req.params;
  const { newFee } = req.body;

  try {
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { totalFee: Number(newFee) },
    });

    return res.json({
      message: "Updated the fee successfully",
      data: {
        id: course.id,
        name: course.name,
        total_fee: course.totalFee,
      },
    });
  } catch (error) {
    console.error("Error in updateCourseFee:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(500).json({ message: "Error while updating the fee" });
  }
};

module.exports = { addCourse, getAllCourses, deleteCourse, updateCourseFee };
