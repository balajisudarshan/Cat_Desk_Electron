const express = require('express');
const router = express.Router();

const {
  addCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  updateCourseFee,
} = require('../controllers/course.controller');

router.post('/', addCourse);
router.get('/', getAllCourses);
router.put('/:id', updateCourse);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.patch('/:id/fee', updateCourseFee);

module.exports = router;
