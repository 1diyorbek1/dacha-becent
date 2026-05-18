const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/User/Desktop/rrr/dacha-backend/dacha.db');

db.serialize(() => {
  db.run(`
    UPDATE settings 
    SET channelLink = 'https://t.me/+5AuXHINaqNBjZjM6'
    WHERE id = 'current'
  `, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);
  });
});

db.close();
