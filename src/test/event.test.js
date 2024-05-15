const httpStatus = require('http-status');
const { app, server } = require('../../app');
const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');


describe("Event Test", () => {
    let eventSlug, superAdminToken;

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

    it('Add Event, Check Validation', async () => {
        const res = await request(app).post('/api/event')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({
                eventName: "Test Event",
                eventDescription: "EventDescription",
                startTime: '10:00 AM',
                endTime: '13:00 PM',
            });
        expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
        expect(res.body.success).toEqual(false);
    });
    
    it('Add Event | Success', async () => {
        const res = await request(app).post('/api/event')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({
                eventName: "Test Event",
                eventDescription: "EventDescription",
                startTime: '10:00 AM',
                endTime: '13:00 PM',
                occurrence: ["weekdays"],
                location: "Sydney"
            });
            console.log(res.body)
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });
    
    it('Get Events', async () => {
        const res = await request(app).get('/api/event')
        console.log(res.body)
        eventSlug = res.body.data.data[0].eventSlug
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });
    
    it('Update Event', async () => {
        const res = await request(app).put('/api/event/'+eventSlug)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
            eventName: "Update Event",
        });
        console.log(res.body)
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });

    it('Get Events', async () => {
        const res = await request(app).get('/api/event')
        eventSlug = res.body.data.data[0].eventSlug
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });
    
    it('Delete Event', async () => {
        const res = await request(app).delete('/api/event/'+eventSlug)
            .set('Authorization', `Bearer ${superAdminToken}`);
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });

});