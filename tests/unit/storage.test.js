const storage = require('../../src/services/storage')

beforeEach(() => {
  storage.reset()
  storage.seed()
})

describe('Storage — Students', () => {
  test('should list seeded students', () => {
    const students = storage.list('students')
    expect(students.length).toBe(3)
    expect(students[0].name).toBe('Alice')
  })

  test('should create a new student', () => {
    const result = storage.create('students', {
      name: 'David',
      email: 'david@example.com'
    })
    expect(result.name).toBe('David')
    expect(storage.list('students').length).toBe(4)
  })

  test('should not allow duplicate student email', () => {
    const result = storage.create('students', {
      name: 'Eve',
      email: 'alice@example.com'
    })
    expect(result.error).toBe('Email must be unique')
  })

  test('should delete a student not enrolled', () => {
    const student = storage.list('students')[0]
    const result = storage.remove('students', student.id)
    expect(result).toBe(true)
  })

  test('should not delete a student who is enrolled', () => {
    const course = storage.list('courses')[0]
    storage.enroll(1, course.id)
    const result = storage.remove('students', 1)
    expect(result.error).toBe('Cannot delete student: enrolled in a course')
  })

  test('should return false when deleting non-existing student', () => {
    const result = storage.remove('students', 999)
    expect(result).toBe(false)
  })
})

describe('Storage — Courses', () => {
  test('should create a new course', () => {
    const result = storage.create('courses', {
      title: 'Biology',
      teacher: 'Dr. Green'
    })
    expect(result.title).toBe('Biology')
  })

  test('should not allow duplicate course title', () => {
    const result = storage.create('courses', {
      title: 'Math',
      teacher: 'Someone'
    })
    expect(result.error).toBe('Course title must be unique')
  })

  test('should not delete a course with enrolled students', () => {
    storage.enroll(1, 1)
    const result = storage.remove('courses', 1)
    expect(result.error).toBe('Cannot delete course: students are enrolled')
  })

  test('should delete course without students', () => {
    const course = storage.list('courses')[0]
    const result = storage.remove('courses', course.id)
    expect(result).toBe(true)
  })

  test('should return false when deleting non-existing course', () => {
    const result = storage.remove('courses', 999)
    expect(result).toBe(false)
  })
})

describe('Storage — Enrollment', () => {
  test('should enroll a student in a course', () => {
    const result = storage.enroll(1, 1)
    expect(result.success).toBe(true)
  })

  test('should not enroll if course not found', () => {
    const result = storage.enroll(1, 999)
    expect(result.error).toBe('Course not found')
  })

  test('should not enroll if student not found', () => {
    const result = storage.enroll(999, 1)
    expect(result.error).toBe('Student not found')
  })

  test('should not enroll twice', () => {
    storage.enroll(1, 1)
    const result = storage.enroll(1, 1)
    expect(result.error).toBe('Student already enrolled in this course')
  })

  test('should not enroll more than 3 students in a course', () => {
    storage.enroll(1, 1)
    storage.enroll(2, 1)
    storage.enroll(3, 1)

    const extra = storage.create('students', {
    name: 'Extra',
    email: 'extra@example.com'
  })

    const result = storage.enroll(extra.id, 1)
    expect(result.error).toBe('Course is full')
})


  test('should unenroll a student', () => {
    storage.enroll(1, 1)
    const result = storage.unenroll(1, 1)
    expect(result.success).toBe(true)
  })

  test('should return error when unenrollment does not exist', () => {
    const result = storage.unenroll(1, 1)
    expect(result.error).toBe('Enrollment not found')
  })
})

describe('Storage — Helpers', () => {
  test('should return student courses', () => {
    storage.enroll(1, 1)
    const courses = storage.getStudentCourses(1)
    expect(courses.length).toBe(1)
    expect(courses[0].title).toBe('Math')
  })

  test('should return course students', () => {
    storage.enroll(1, 1)
    const students = storage.getCourseStudents(1)
    expect(students.length).toBe(1)
    expect(students[0].name).toBe('Alice')
  })

  test('reset should reset IDs', () => {
    storage.reset()
    const newStudent = storage.create('students', {
      name: 'Zed',
      email: 'zed@example.com'
    })
    expect(newStudent.id).toBe(1)
  })
})
