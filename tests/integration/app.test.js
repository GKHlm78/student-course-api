const request = require('supertest')
const app = require('../../src/app')
const storage = require('../../src/services/storage')

beforeEach(() => {
  storage.reset()
  storage.seed()
})

describe('API Integration — Students', () => {
  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students')
    expect(res.statusCode).toBe(200)
    expect(res.body.students.length).toBe(3)
  })

  test('GET /students/:id should return student', async () => {
    const res = await request(app).get('/students/1')
    expect(res.statusCode).toBe(200)
    expect(res.body.student.name).toBe('Alice')
  })

  test('GET /students/:id should return 404', async () => {
    const res = await request(app).get('/students/999')
    expect(res.statusCode).toBe(404)
  })

  test('POST /students should create student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' })
    expect(res.statusCode).toBe(201)
  })

  test('POST /students should return 400 for duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' })
    expect(res.statusCode).toBe(400)
  })

  test('PUT /students/:id should update student', async () => {
    const res = await request(app)
      .put('/students/1')
      .send({ name: 'Alice Updated' })
    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe('Alice Updated')
  })

  test('DELETE /students/:id should delete student', async () => {
    const res = await request(app).delete('/students/1')
    expect(res.statusCode).toBe(204)
  })

  test('DELETE /students/:id should return 400 if enrolled', async () => {
    await request(app).post('/courses/1/students/1')
    const res = await request(app).delete('/students/1')
    expect(res.statusCode).toBe(400)
  })
})

describe('API Integration — Courses', () => {
  test('GET /courses should return courses', async () => {
    const res = await request(app).get('/courses')
    expect(res.statusCode).toBe(200)
  })

  test('GET /courses/:id should return one course', async () => {
    const res = await request(app).get('/courses/1')
    expect(res.statusCode).toBe(200)
  })

  test('POST /courses should create course', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ title: 'Biology', teacher: 'Green' })
    expect(res.statusCode).toBe(201)
  })

  test('POST /courses should return 400 for duplicate title', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ title: 'Math', teacher: 'X' })
    expect(res.statusCode).toBe(400)
  })

  test('PUT /courses/:id should update course', async () => {
    const res = await request(app)
      .put('/courses/1')
      .send({ teacher: 'Updated' })
    expect(res.statusCode).toBe(200)
  })

  test('DELETE /courses/:id should return 400 if students enrolled', async () => {
    await request(app).post('/courses/1/students/1')
    const res = await request(app).delete('/courses/1')
    expect(res.statusCode).toBe(400)
  })

  test('POST /courses/:courseId/students/:studentId should enroll', async () => {
    const res = await request(app).post('/courses/1/students/1')
    expect(res.statusCode).toBe(201)
  })

  test('DELETE /courses/:courseId/students/:studentId should unenroll', async () => {
    await request(app).post('/courses/1/students/1')
    const res = await request(app).delete('/courses/1/students/1')
    expect(res.statusCode).toBe(204)
  })
})
