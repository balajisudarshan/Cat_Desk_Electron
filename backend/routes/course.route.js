const express = require('express')
const router = express.Router()

const {addCourse,getAllCourses,deleteCourse,updateCourseFee} = require('../controllers/course.controller')

router.post('/',addCourse)
router.get('/',getAllCourses)
router.delete('/:id',deleteCourse)
router.patch('/:id',updateCourseFee)
module.exports = router;