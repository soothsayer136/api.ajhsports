const httpStatus = require('http-status');
const { app, server } = require('../../app');
const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');


describe("Lesson Lesson Test", () => {
    let coachingId, superAdminToken;

    async function loginAsSuperAdmin() {
        const superAdminData = {
            email: "superadmin@ajh.com",
            password: "password"
        };

        const res = await request(app)
            .post('/api/user/login')
            .send(superAdminData);
        console.log("res", res.body);
        return res.body.data.token;
    }

    beforeAll(async () => {
        // Initialize the app before running tests
        superAdminToken = await loginAsSuperAdmin();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await new Promise(resolve => server.close(resolve));
    });

    it('Add Lesson, Check Validation', async () => {
        const res = await request(app).post('/api/coaching')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({
                description: "description",
                time: '10:00 AM',
                interval: '1 hour',
                location: "Sydney"
            });
        expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
        expect(res.body.success).toEqual(false);
    });
    
    it('Add Lesson | Success', async () => {
        const res = await request(app).post('/api/coaching')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({
                title: "Lesson",
                description: "description",
                time: '10:00 AM',
                interval: '1 hour',
                location: "Sydney",
                price: [
                    {
                        name: "marning",
                        private: 100,
                        group: 10
                    }
                ]
            });
            console.log(res.body)
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });
    
    it('Get Lessons', async () => {
        const res = await request(app).get('/api/coaching')
        coachingId = res.body.data.data[0]._id
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });
    
    it('Update Lesson', async () => {
        const res = await request(app).put('/api/coaching/'+coachingId)
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({
                coachingName: "Update Lesson",
            });
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });
    
    it('Delete Lesson', async () => {
        const res = await request(app).delete('/api/coaching/'+coachingId)
            .set('Authorization', `Bearer ${superAdminToken}`);
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });

});