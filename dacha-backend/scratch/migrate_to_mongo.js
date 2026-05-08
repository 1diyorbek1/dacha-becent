require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "test"; // Or whatever DB name you want to use

async function migrate() {
    const sqliteDb = new sqlite3.Database('dacha.db');
    const mongoClient = new MongoClient(MONGO_URI);

    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
        const mongoDb = mongoClient.db(DB_NAME);

        const getRows = (query) => new Promise((resolve, reject) => {
            sqliteDb.all(query, [], (err, rows) => err ? reject(err) : resolve(rows));
        });

        // 1. Migrate Users
        console.log('Migrating users...');
        const users = await getRows("SELECT * FROM user");
        if (users.length > 0) {
            const usersCollection = mongoDb.collection('user');
            // Remove local IDs or convert them to MongoDB format if needed
            const mongoUsers = users.map(u => {
                const { id, ...rest } = u;
                return { ...rest }; // Let Mongo generate _id
            });
            await usersCollection.insertMany(mongoUsers);
            console.log(`Migrated ${users.length} users.`);
        }

        // 2. Migrate Dachas
        console.log('Migrating dachas...');
        const dachas = await getRows("SELECT * FROM dachalar");
        if (dachas.length > 0) {
            const dachasCollection = mongoDb.collection('dachalar');
            const mongoDachas = dachas.map(d => {
                const { id, ...rest } = d;
                // Parse JSON strings if they were stored as text in SQLite
                if (rest.photos) try { rest.photos = JSON.parse(rest.photos); } catch(e){}
                if (rest.calendar) try { rest.calendar = JSON.parse(rest.calendar); } catch(e){}
                if (rest.amenities) try { rest.amenities = JSON.parse(rest.amenities); } catch(e){}
                if (rest.storyLikes) try { rest.storyLikes = JSON.parse(rest.storyLikes); } catch(e){}
                if (rest.reviews) try { rest.reviews = JSON.parse(rest.reviews); } catch(e){}
                return { ...rest };
            });
            await dachasCollection.insertMany(mongoDachas);
            console.log(`Migrated ${dachas.length} dachas.`);
        }

        // 3. Migrate Bookings
        console.log('Migrating bookings...');
        const bookings = await getRows("SELECT * FROM bookings");
        if (bookings.length > 0) {
            const bookingsCollection = mongoDb.collection('bookings');
            const mongoBookings = bookings.map(b => {
                const { id, ...rest } = b;
                if (rest.bookedDays) try { rest.bookedDays = JSON.parse(rest.bookedDays); } catch(e){}
                return { ...rest };
            });
            await bookingsCollection.insertMany(mongoBookings);
            console.log(`Migrated ${bookings.length} bookings.`);
        }

        // 4. Migrate Settings
        console.log('Migrating settings...');
        const settings = await getRows("SELECT * FROM settings");
        if (settings.length > 0) {
            const settingsCollection = mongoDb.collection('settings');
            const mongoSettings = settings.map(s => {
                const { id, ...rest } = s;
                return { ...rest };
            });
            await settingsCollection.insertMany(mongoSettings);
            console.log(`Migrated ${settings.length} settings.`);
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        sqliteDb.close();
        await mongoClient.close();
    }
}

migrate();
