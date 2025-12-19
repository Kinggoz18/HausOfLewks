import request from 'supertest';
import initExpressApp from '../src/config/app.js';
import connectToDb from '../src/config/database.js';
import { serverEnvVaiables } from '../src/config/enviornment.js';
import septemberSchedules from './data/scheduleData.js';
import hairServicesData from './data/hairServicesData.js';

describe('Test the root path', () => {
  let databaseClient;
  let app;

  //Connect to the database
  beforeAll(async () => {
    databaseClient = await connectToDb();
    app = await initExpressApp(databaseClient);
  });

  /******************************************************************************************************************/
  /******************************************* Schedule Tests ********************************************************/
  /******************************************************************************************************************/
  let schedules = [];

  // test('It should CREATE a schedule at the POST method', async () => {
  //   const path = `${serverEnvVaiables.basePath}/schedule/create`;

  //   for (let i = 0; i < 5; i++) {
  //     const response = await request(app)
  //       .post(path)
  //       .send(septemberSchedules[i]);
  //     expect(response.statusCode).toBe(201);
  //   }
  // });

  test('It should GET ALL schedule at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/schedule`;
    const response = await request(app).get(path);
    const allSchedule = response?._body?.content;

    expect(response.statusCode).toBe(200);
    schedules = allSchedule;
  });

  test('It should GET a schedule at the POST method', async () => {
    const path = `${serverEnvVaiables.basePath}/schedule/${schedules[0]?._id}`;
    const response = await request(app).get(path);
    const schedule = response?._body?.content;

    expect(response.statusCode).toBe(200);
    // expect(schedule).toBe(schedules[0]);
  });

  test('It should UPDATE a schedule at the POST method', async () => {
    const path = `${serverEnvVaiables.basePath}/schedule/update`;

    const scheduleToUpdate = {
      scheduleId: schedules[0]?._id,
      startTime: '00:30am',
      endTime: '10:30am'
    };

    const response = await request(app).post(path).send(scheduleToUpdate);
    expect(response.statusCode).toBe(200);
  });

  // test('It should DELETE a schedule at the POST method', async () => {
  //   const path = `${serverEnvVaiables.basePath}/schedule/delete`;

  //   for (let i = 0; i < 5; i++) {
  //     const scheduleId = schedules[i]?._id;
  //     const response = await request(app).post(path).send({ scheduleId });
  //     expect(response.statusCode).toBe(200);
  //     const data = response?._body?.content;
  //     schedules.push(data);
  //   }
  // });

  /***********************************************************************************************************************/
  /******************************************* Hair Service Tests ********************************************************/
  /***********************************************************************************************************************/
  let hairServices = [];

  // test('It should CREATE a Hair Service at the POST method', async () => {
  //   const path = `${serverEnvVaiables.basePath}/hair-service`;

  //   for (let i = 0; i < hairServicesData.length; i++) {
  //     const response = await request(app).post(path).send(hairServicesData[i]);
  //     expect(response.statusCode).toBe(201);
  //     const data = response?._body?.content;
  //     hairServices.push(data);
  //   }
  // });

  test('It should GET All Hair Services by category at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/hair-service`;
    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    const data = response?._body?.content;
    hairServices = data;
  });

  test('TEST 1: It should GET a Hair Service by scheduleId at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/hair-service/available`;
    const data1 = {
      scheduleId: schedules[1]?._id,
      startTime: '15:00pm'
    };

    const response = await request(app).post(path).send(data1);
    expect(response.statusCode).toBe(200);
  });

  test('TEST 2: It should GET a Hair Service by scheduleId at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/hair-service/available`;
    const data2 = {
      scheduleId: schedules[1]?._id,
      startTime: '10:00am'
    };

    const response = await request(app).post(path).send(data2);
    expect(response.statusCode).toBe(200);
  });

  // test('It should UPDATE Hair Services by category at the POST method', async () => {
  //   const data = {
  //     id: hairServices['Box Braids'][0]?._id,
  //     title: 'Test title',
  //     price: 100,
  //     category: 'Box Braids'
  //   };

  //   const path = `${serverEnvVaiables.basePath}/hair-service/update`;
  //   const response = await request(app).post(path).send(data);
  //   expect(response.statusCode).toBe(200);
  //   hairServices = data;
  // });

  // test('It should DELETE Hair Services by category using DELETE method', async () => {
  //   const categories = Object.values(hairServices); // gets the arrays (Box Braids, Knotless, etc.)

  //   for (const services of categories) {
  //     for (const service of services) {
  //       const path = `${serverEnvVaiables.basePath}/hair-service/${service?._id}`;
  //       const response = await request(app).delete(path);
  //       expect(response.statusCode).toBe(200);
  //     }
  //   }
  // });

  /******************************************************************************************************************/
  /******************************************* Booking Tests ********************************************************/
  /******************************************************************************************************************/
  let createdBooking;
  let allBookings;
  // test('It should CREATE a booking at the POST method', async () => {
  //   const selectedService = hairServices['Knotless'][0];
  //   let totalDuration = Number(selectedService?.duration);
  //   selectedService?.addOns?.forEach((addon) => {
  //     totalDuration += Number(addon?.duration);
  //   });

  //   const data = {
  //     firstName: 'Chigozie',
  //     lastName: 'Chigozie',
  //     phone: '123456789',
  //     email: 'chigozie@mail.com',
  //     startTime: '17:00pm',
  //     scheduleId: '688fbbaab4f5b8608cf9c95e',
  //     service: {
  //       title: hairServices['Knotless'][0]?.title,
  //       price: hairServices['Knotless'][0]?.price,
  //       category: hairServices['Knotless'][0]?.category,
  //       duration: totalDuration,
  //       hairServiceId: hairServices['Knotless'][0]?._id
  //     }
  //   };

  //   const path = `${serverEnvVaiables.basePath}/booking`;

  //   const response = await request(app).post(path).send(data);
  //   expect(response.statusCode).toBe(201);
  //   createdBooking = response?._body?.content;
  // });

  test('It should GET all booking at the GET method', async () => {
    const selectedService = hairServices['Knotless'][0];
    let totalDuration = Number(selectedService?.duration);
    selectedService?.addOns?.forEach((addon) => {
      totalDuration += Number(addon?.duration);
    });

    const data = {
      status: 'Upcoming'
    };

    const path = `${serverEnvVaiables.basePath}/booking/get-bookings`;

    const response = await request(app).post(path).send({});
    expect(response.statusCode).toBe(200);
    allBookings = response?._body?.content;
  });

  test('It should GET a booking by id at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/booking/${allBookings[0]?._id}`;

    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    const fetchedBooking = response?._body?.content;

    console.log({ fetchedBooking });
  });

  test('It should UPDATE a booking by id at the POST method', async () => {
    if (!allBookings || allBookings.length === 0) {
      console.log('No bookings available to update');
      return;
    }

    const data = {
      bookingId: allBookings[0]?._id,
      status: 'Completed'
    };

    const path = `${serverEnvVaiables.basePath}/booking/update`;

    const response = await request(app).post(path).send(data);
    expect(response.statusCode).toBe(200);
  });

  test('It should GET a booking by a user info at the POST method', async () => {
    const data = {
      firstName: 'Chigozie',
      lastName: 'Chigozie',
      phone: '123456789',
      email: 'chigozie@mail.com'
    };

    const path = `${serverEnvVaiables.basePath}/booking/find-user-bookings`;

    const response = await request(app).post(path).send(data);
    expect(response.statusCode).toBe(200);
    const userBookings = response?._body?.content;

    console.log({ userBookings });
  });

  /******************************************************************************************************************/
  /******************************************* Income Report Tests **************************************************/
  /******************************************************************************************************************/
  test('It should GET income report at the POST method', async () => {
    const path = `${serverEnvVaiables.basePath}/booking/income-report`;

    const response = await request(app).post(path).send({});
    expect(response.statusCode).toBe(200);
    
    const incomeReport = response?._body?.content;
    expect(incomeReport).toHaveProperty('totalRevenue');
    expect(incomeReport).toHaveProperty('totalCompleted');
    expect(incomeReport).toHaveProperty('currentMonth');
    expect(incomeReport).toHaveProperty('currentYear');
    expect(incomeReport).toHaveProperty('statsPerYear');
    expect(incomeReport).toHaveProperty('statsPerMonth');
  });

  /******************************************************************************************************************/
  /******************************************* Blog Tests **********************************************************/
  /******************************************************************************************************************/
  let blogPosts = [];
  let createdBlogPost;

  test('It should CREATE a blog post at the POST method', async () => {
    const path = `${serverEnvVaiables.basePath}/blog`;

    const blogData = {
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'This is a test excerpt',
      content: '<p>This is test content</p>',
      isPublished: true
    };

    const response = await request(app).post(path).send(blogData);
    expect(response.statusCode).toBe(201);
    createdBlogPost = response?._body?.content;
    expect(createdBlogPost).toHaveProperty('_id');
    expect(createdBlogPost.title).toBe(blogData.title);
  });

  test('It should GET all blog posts at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/blog`;

    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    blogPosts = response?._body?.content;
    expect(Array.isArray(blogPosts)).toBe(true);
  });

  test('It should GET a blog post by id at the GET method', async () => {
    if (!createdBlogPost?._id) {
      console.log('No blog post available');
      return;
    }

    const path = `${serverEnvVaiables.basePath}/blog/${createdBlogPost._id}`;
    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    const blogPost = response?._body?.content;
    expect(blogPost).toHaveProperty('_id');
    expect(blogPost.title).toBe(createdBlogPost.title);
  });

  test('It should UPDATE a blog post at the PUT method', async () => {
    if (!createdBlogPost?._id) {
      console.log('No blog post available');
      return;
    }

    const path = `${serverEnvVaiables.basePath}/blog/${createdBlogPost._id}`;
    const updateData = {
      title: 'Updated Test Blog Post',
      excerpt: 'Updated excerpt'
    };

    const response = await request(app).put(path).send(updateData);
    expect(response.statusCode).toBe(200);
    const updatedPost = response?._body?.content;
    expect(updatedPost.title).toBe(updateData.title);
  });

  test('It should GET published blog posts only', async () => {
    const path = `${serverEnvVaiables.basePath}/blog?published=true`;

    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    const publishedPosts = response?._body?.content;
    expect(Array.isArray(publishedPosts)).toBe(true);
    publishedPosts?.forEach(post => {
      expect(post.isPublished).toBe(true);
    });
  });

  /******************************************************************************************************************/
  /******************************************* User Tests ********************************************************/
  /******************************************************************************************************************/

  /******************************************************************************************************************/
  /******************************************* Media Tests ********************************************************/
  /******************************************************************************************************************/
});
