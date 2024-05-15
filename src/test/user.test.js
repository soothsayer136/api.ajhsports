const httpStatus = require('http-status');
const { app, server } = require('../../app');
const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');

describe("User Test", () => {
    let user_id, userToken;

    async function loginAsSuperAdmin() {
        const superAdminData = {
            email: "superadmin@ajh.com",
            password: "password"
        };

        const res = await request(app)
            .post('/api/user/login')
            .send(superAdminData);
        console.log("bbbbbbbbb", res.body);
        return res.body.data.token;
    }

    beforeAll(async () => {

        // Initialize the app before running tests
        // await initializeApp();
        //login as superadmin
        superAdminToken = await loginAsSuperAdmin();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await new Promise(resolve => server.close(resolve));
    });

    it('User Register', async () => {
        const res = await request(app).post('/api/user/register')
            .send({
                firstname: "Test",
                lastname: "Testing",
                email: "test@gmail.com",
                password: "password",
                contact: "9800000000",
                address: "address",
                expertiseLevel: "beginner",
            });
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });

    it('User Login!! Invalid Credential', async () => {
        const res = await request(app).post('/api/user/login')
            .send({
                email: "test@gmail.com",
                password: "password123",
            });
        console.log("res", res.body);
        expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
        expect(res.body.success).toEqual(false);
    });

    it('User Login!! Success', async () => {
        const res = await request(app).post('/api/user/login')
            .send({
                email: "test@gmail.com",
                password: "password",
            });
        userToken = res.body.data.token;
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });

    it('User Update Profile !! Success', async () => {
        const res = await request(app).put('/api/user/update-profile')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                firstnama: "update"
            });
        expect(res.statusCode).toEqual(httpStatus.OK);
        expect(res.body.success).toEqual(true);
    });

    // it('User Delete!! Success', async () => {
    //     const res = await request(app).delete(`/users/delete-user/${user_id}`)
    //         .set('Authorization', `Bearer ${superAdminToken}`);
    //     expect(res.statusCode).toEqual(httpStatus.OK);
    //     expect(res.body.success).toEqual(true);
    // });


});