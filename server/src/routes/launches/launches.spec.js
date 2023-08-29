const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../../services/mongo');

describe('Launches API Test', () => {
  // Starting MongoDB for test environment
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should response with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

  describe('Test POST /lanch', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 138-D',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2029',
    };

    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 138-D',
      target: 'Kepler-62 f',
    };

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 138-D',
      target: 'Kepler-62 f',
      launchDate: 'Jsdfgdfg',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect(201)
        .expect('Content-Type', /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property!',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
