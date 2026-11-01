const prisma = require("../config/prisma");

const getAllBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { batchStudents: true }
        }
      },
      orderBy: { id: "desc" }
    })
    res.status(200).json({ success: true, batches })

  } catch (error) {
    console.log("Error fetching batches", error);
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}
const createBatch = async (req, res) => {
  const { courseId, batchName, batchCode, startTime, endTime, startDate, endDate } = req.body
  try {
    if (!courseId || !batchName) {
      return res.status(400).json({
        message: "Course id and batch name are required"
      })
    }
    const course = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId)
      }
    })
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const batch = await prisma.batch.create({
      data: {
        courseId: parseInt(courseId),
        batchName,
        batchCode: batchCode || null,
        startTime,
        endTime,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    res.status(201).json({ success: true, batch })
  } catch (error) {
    console.log("Error creating batch:", error);
    res.status(500).json({ success: false, message: "Internal server error" })

  }
}
module.exports = {
  getAllBatches,
  createBatch
}