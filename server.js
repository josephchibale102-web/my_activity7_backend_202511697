const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const recordsRoutes = require("./routes/records");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auto-initialize database table and seed records on startup
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        title VARCHAR(80) NOT NULL,
        category VARCHAR(40) NOT NULL,
        description VARCHAR(300) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'In progress', 'Completed'))
      );
    `);
    
    const check = await pool.query("SELECT COUNT(*) FROM records");
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO records (title, category, description, status) VALUES
        ('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
        ('Leaking tap in washroom', 'Plumbing', 'Water is continuously dripping from sink 3.', 'In progress'),
        ('Broken lecture chair', 'Furniture', 'Backrest is detached in LT2.', 'Completed'),
        ('Projector power cable missing', 'Electrical', 'Cannot connect laptop in Lab 4.', 'Pending'),
        ('Clogged floor drain', 'Plumbing', 'Water pooling near hallway exit.', 'Pending'),
        ('Loose door handle', 'Furniture', 'Office 14 door won''t latch properly.', 'Completed'),
        ('Flickering hallway bulb', 'Electrical', 'First-floor corridor light pulses.', 'In progress'),
        ('Wobbly whiteboard frame', 'Furniture', 'Frame separates from wall when writing.', 'Pending');
      `);
      console.log("Database seeded with initial records.");
    }
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

initDB();

app.use("/api/records", recordsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});