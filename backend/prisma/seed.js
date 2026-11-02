const prisma = require("../config/prisma");

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing records (in reverse relation order)
  await prisma.paymentHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.batchStudent.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // 2. Create Courses
  const mern = await prisma.course.create({
    data: {
      name: "Full Stack Web Development (MERN)",
      totalFee: 35000.0,
      duration: "6 Months",
      description: "Master React, Node.js, Express, and MongoDB with modern JavaScript.",
      isActive: true,
    },
  });

  const python = await prisma.course.create({
    data: {
      name: "Python Full Stack & AI",
      totalFee: 40000.0,
      duration: "6 Months",
      description: "Comprehensive Python programming, Django, FastApi, and AI fundamentals.",
      isActive: true,
    },
  });

  const dataScience = await prisma.course.create({
    data: {
      name: "Data Science & Machine Learning",
      totalFee: 45000.0,
      duration: "6 Months",
      description: "Data analysis, Pandas, NumPy, Scikit-Learn, and Deep Learning.",
      isActive: true,
    },
  });

  const uiux = await prisma.course.create({
    data: {
      name: "UI/UX Design Masterclass",
      totalFee: 25000.0,
      duration: "3 Months",
      description: "Figma, wireframing, prototyping, user research, and design systems.",
      isActive: true,
    },
  });

  console.log("✅ Courses created.");

  // 3. Create Batches
  const mernMorning = await prisma.batch.create({
    data: {
      courseId: mern.id,
      batchName: "MERN Morning Batch",
      batchCode: "MERN-MRN-01",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      days: "Mon-Fri",
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-07-10"),
      maxStudents: 25,
      status: "ONGOING",
    },
  });

  const pyEvening = await prisma.batch.create({
    data: {
      courseId: python.id,
      batchName: "Python Evening Batch",
      batchCode: "PY-EVN-01",
      startTime: "05:00 PM",
      endTime: "07:00 PM",
      days: "Mon-Fri",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-08-01"),
      maxStudents: 30,
      status: "ONGOING",
    },
  });

  const dsWeekend = await prisma.batch.create({
    data: {
      courseId: dataScience.id,
      batchName: "Data Science Weekend Batch",
      batchCode: "DS-WKD-01",
      startTime: "10:00 AM",
      endTime: "02:00 PM",
      days: "Sat-Sun",
      startDate: new Date("2025-02-15"),
      endDate: new Date("2025-08-15"),
      maxStudents: 20,
      status: "UPCOMING",
    },
  });

  console.log("✅ Batches created.");

  // 4. Create Students
  const s1 = await prisma.student.create({
    data: {
      regNo: "REG-2025-001",
      name: "Rahul Sharma",
      fName: "Sanjay Sharma",
      phone: "9876543210",
      email: "rahul.sharma@example.com",
      address: "12/4 Anna Nagar, Chennai",
      status: true,
    },
  });

  const s2 = await prisma.student.create({
    data: {
      regNo: "REG-2025-002",
      name: "Priya Nair",
      fName: "Mohan Nair",
      phone: "9876543211",
      email: "priya.nair@example.com",
      address: "54 MG Road, Bangalore",
      status: true,
    },
  });

  const s3 = await prisma.student.create({
    data: {
      regNo: "REG-2025-003",
      name: "Anand Kumar",
      fName: "Ramesh Kumar",
      phone: "9876543212",
      email: "anand.k@example.com",
      address: "88 Gandhi Street, Coimbatore",
      status: true,
    },
  });

  console.log("✅ Students created.");

  // 5. Enrollments & Batch allocations
  await prisma.enrollment.create({
    data: {
      studentId: s1.id,
      courseId: mern.id,
      batchId: mernMorning.id,
      timings: "09:00 AM - 11:00 AM",
      courseFee: 35000.0,
    },
  });
  await prisma.batchStudent.create({
    data: {
      batchId: mernMorning.id,
      studentId: s1.id,
      status: "ACTIVE",
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: s2.id,
      courseId: python.id,
      batchId: pyEvening.id,
      timings: "05:00 PM - 07:00 PM",
      courseFee: 40000.0,
    },
  });
  await prisma.batchStudent.create({
    data: {
      batchId: pyEvening.id,
      studentId: s2.id,
      status: "ACTIVE",
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: s3.id,
      courseId: uiux.id,
      timings: "10:00 AM - 01:00 PM",
      courseFee: 25000.0,
    },
  });

  console.log("✅ Enrollments created.");

  // 6. Payments and Payment Histories
  // Student 1: Partial payment (installment)
  const p1 = await prisma.payment.create({
    data: {
      studentId: s1.id,
      totalFee: 35000.0,
      discount: 5000.0,
      finalFee: 30000.0,
      totalPaid: 15000.0,
      balance: 15000.0,
      paymentMode: "installment",
    },
  });
  await prisma.paymentHistory.create({
    data: {
      paymentId: p1.id,
      amountPaid: 15000.0,
      paymentMethod: "upi",
      receiptNo: "REC-2025001",
    },
  });

  // Student 2: Full payment
  const p2 = await prisma.payment.create({
    data: {
      studentId: s2.id,
      totalFee: 40000.0,
      discount: 0.0,
      finalFee: 40000.0,
      totalPaid: 40000.0,
      balance: 0.0,
      paymentMode: "full-payment",
    },
  });
  await prisma.paymentHistory.create({
    data: {
      paymentId: p2.id,
      amountPaid: 40000.0,
      paymentMethod: "card",
      receiptNo: "REC-2025002",
    },
  });

  // Student 3: Installment
  const p3 = await prisma.payment.create({
    data: {
      studentId: s3.id,
      totalFee: 25000.0,
      discount: 2000.0,
      finalFee: 23000.0,
      totalPaid: 10000.0,
      balance: 13000.0,
      paymentMode: "installment",
    },
  });
  await prisma.paymentHistory.create({
    data: {
      paymentId: p3.id,
      amountPaid: 10000.0,
      paymentMethod: "cash",
      receiptNo: "REC-2025003",
    },
  });

  console.log("✅ Payments and receipts created.");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

