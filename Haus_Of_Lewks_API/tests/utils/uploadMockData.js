import connectToDb from '../../src/config/database.js';
import CategoryModel from '../../src/models/HairCategory.js';
import HairServicesModel from '../../src/models/HairServices.js';
import AddOnsModel from '../../src/models/ServiceAddOns.js';
import ScheduleModel from '../../src/models/Schedule.js';
import BookingModel from '../../src/models/Bookings.js';
import UserModel from '../../src/models/Users.js';
import BlogModel from '../../src/models/Blog.js';
import categoryData from '../data/categoryData.js';
import hairServicesData from '../data/hairServicesData.js';
import septemberSchedules from '../data/scheduleData.js';
import userData from '../data/userData.js';
import blogData from '../data/blogData.js';
import generateMockBookings from '../data/bookingData.js';
import { serverEnvVaiables } from '../../src/config/enviornment.js';

/**
 * Upload mock data to the database
 * This function will:
 * 1. Clear existing test data (optional)
 * 2. Create categories
 * 3. Create hair services with addons
 * 4. Create schedules
 * 5. Create users
 * 6. Create bookings
 * 7. Create blog posts
 */
export async function uploadMockData(clearExisting = true) {
  let dbClient;

  try {
    console.log('Connecting to database...');
    dbClient = await connectToDb();

    if (clearExisting) {
      console.log('Clearing existing data...');
      await CategoryModel.deleteMany({});
      await HairServicesModel.deleteMany({});
      await AddOnsModel.deleteMany({});
      await ScheduleModel.deleteMany({});
      await BookingModel.deleteMany({});
      await UserModel.deleteMany({ role: 'Customer' }); // Don't delete admins
      await BlogModel.deleteMany({});
    }

    // 1. Create categories
    console.log('Creating categories...');
    const categories = [];
    for (const catData of categoryData) {
      try {
        const category = await CategoryModel.create(catData);
        categories.push(category);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key, find existing
          const existing = await CategoryModel.findOne({ title: catData.title });
          if (existing) categories.push(existing);
        } else {
          throw error;
        }
      }
    }
    console.log(`Created ${categories.length} categories`);

    // 2. Create hair services with addons
    console.log('Creating hair services...');
    const hairServices = [];
    for (const serviceData of hairServicesData) {
      try {
        const { addOns, ...serviceInfo } = serviceData;
        const service = await HairServicesModel.create(serviceInfo);
        hairServices.push(service);

        // Create addons if they exist
        if (addOns && addOns.length > 0) {
          for (const addonData of addOns) {
            try {
              await AddOnsModel.create({
                ...addonData,
                service: service.title
              });
            } catch (error) {
              console.log(`Addon ${addonData.title} may already exist`);
            }
          }
        }
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate, find existing
          const existing = await HairServicesModel.findOne({
            title: serviceData.title,
            category: serviceData.category
          });
          if (existing) {
            hairServices.push(existing);
            // Fetch addons
            const serviceAddons = await AddOnsModel.find({
              service: existing.title
            });
            existing.addOns = serviceAddons;
          }
        } else {
          throw error;
        }
      }
    }

    // Fetch addons for all services
    for (const service of hairServices) {
      const serviceAddons = await AddOnsModel.find({ service: service.title });
      service.addOns = serviceAddons;
    }
    console.log(`Created ${hairServices.length} hair services`);

    // 3. Create schedules
    console.log('Creating schedules...');
    const schedules = [];
    for (const scheduleData of septemberSchedules) {
      try {
        const schedule = await ScheduleModel.create(scheduleData);
        schedules.push(schedule);
      } catch (error) {
        // If duplicate or error, skip
        console.log(`Schedule for ${scheduleData.day} may already exist`);
      }
    }
    console.log(`Created ${schedules.length} schedules`);

    // 4. Create users
    console.log('Creating users...');
    const users = [];
    for (const userInfo of userData) {
      try {
        const user = await UserModel.create(userInfo);
        users.push(user);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate, find existing
          const existing = await UserModel.findOne({ email: userInfo.email });
          if (existing) users.push(existing);
        } else {
          throw error;
        }
      }
    }
    console.log(`Created ${users.length} users`);

    // 5. Generate and create bookings
    console.log('Creating bookings...');
    const mockBookings = generateMockBookings(hairServices, schedules, users);
    const bookings = [];
    let skippedCount = 0;
    for (const bookingData of mockBookings) {
      try {
        const booking = await BookingModel.create(bookingData);
        bookings.push(booking);
      } catch (error) {
        // Skip duplicate bookings or other errors (shouldn't happen now, but keep as safety)
        if (error.code === 11000) {
          skippedCount++;
        } else {
          console.log(`Booking creation error: ${error.message}`);
        }
      }
    }
    console.log(`Created ${bookings.length} bookings${skippedCount > 0 ? ` (skipped ${skippedCount} duplicates)` : ''}`);

    // 6. Create blog posts
    console.log('Creating blog posts...');
    const blogs = [];
    for (const blogInfo of blogData) {
      try {
        const blog = await BlogModel.create(blogInfo);
        blogs.push(blog);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate slug, find existing
          const existing = await BlogModel.findOne({ slug: blogInfo.slug });
          if (existing) blogs.push(existing);
        } else {
          throw error;
        }
      }
    }
    console.log(`Created ${blogs.length} blog posts`);

    console.log('Mock data upload complete!');
    return {
      categories,
      hairServices,
      schedules,
      users,
      bookings,
      blogs
    };
  } catch (error) {
    console.error('Error uploading mock data:', error);
    throw error;
  } finally {
    if (dbClient) {
      await dbClient.close();
    }
  }
}

// Allow running this script directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isMainModule = process.argv[1] && (process.argv[1].endsWith('uploadMockData.js') || process.argv[1].endsWith(__filename));

if (isMainModule || import.meta.url === `file://${process.argv[1]}`) {
  uploadMockData(true)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

