const express = require('express')
const { getAllCourses } = require('../controllers/course.controller')
const { getAllStudents, addStudent,updateStudentStatus, deleteStudent,getStudent,getStudentByRegNo } = require('../controllers/student.controller')
const router = express.Router()

router.get('/',getAllStudents);
router.post('/',addStudent)
router.patch('/:id',updateStudentStatus)
router.delete('/:id',deleteStudent)
router.get('/:id',getStudent)
router.get('/regNo/:regNo',getStudentByRegNo)
module.exports = router