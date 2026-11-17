require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json());

// API Guide at Base URL (GET /)
app.get("/", (req, res) => {
  res.send(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Campus Maintenance API Guide</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 2rem; color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        th { background: #f4f4f9; }
      </style>
    </head>
    <body>
      <h1>Campus Maintenance API</h1>
      <p><strong>Student Number:</strong>202511697</p>
      <p><strong>Description:</strong> Backend API service for tracking campus maintenance requests.</p>
      <p><em>Note: Idle hosted services may take a moment to spin up on the first request.</em></p>
      
      <h2>Quick Links</h2>
      <ul>
        <li><a href="/health">Check Health (/health)[cite: 17]</a></li>
        <li><a href="/api/records">View All Records (/api/records)[cite: 17]</a></li>
      </ul>

      <h2>Required Routes</h2>
      <table>
        <tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
        <tr><td>GET</td><td>/</td><td>API Guide</td></tr>
        <tr><td>GET</td><td>/health</td><td>Server and DB check[cite: 12]</td></tr>
        <tr><td>GET</td><td>/api/records</td><td>Read all records[cite: 12]</td></tr>
        <tr><td>GET</td><td>/api/records/:id</td><td>Read one record[cite: 12]</td></tr>
        <tr><td>POST</td><td>/api/records</td><td>Create a record[cite: 12]</td></tr>
        <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record[cite: 12]</td></tr>
        <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record[cite: 12]</td></tr>
      </table>

      <h2>Input Specifications & Example Body</h2>
      <p><strong>Fields:</strong> title (3-80 chars), category (2-40 chars), description (5-300 chars), status ('Pending', 'In progress', 'Completed')[cite: 13].</p>
      <pre>
{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}
      </pre>
    </body>
    </html>
  `);
});

// Health Check Route[cite: 12]
const pool = require("./db");
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(503).json({ status: "Error", database: "Disconnected" });
  }
});

// Mount Record Routes[cite: 16]
app.use("/api/records", require("./routes/records"));

// 404 Handler for Unknown Routes[cite: 16]
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found." });
});

// Global Error Handling Middleware[cite: 16]
app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Malformed JSON." });
  }
  res.status(500).json({ message: "Unexpected server failure." });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});