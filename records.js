const router = require("express").Router();
const pool = require("../db");

// Validation Helper Function
function validateRecord(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const status = body.status;

  if (title.length < 3 || title.length > 80) {
    return "Title must have 3 to 80 characters.";
  }
  if (category.length < 2 || category.length > 40) {
    return "Category must have 2 to 40 characters.";
  }
  if (description.length < 5 || description.length > 300) {
    return "Description must have 5 to 300 characters.";
  }
  if (!["Pending", "In progress", "Completed"].includes(status)) {
    return "Status must be 'Pending', 'In progress', or 'Completed'.";
  }
  return null;
}

// GET all records[cite: 16]
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET one record[cite: 16]
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= id - 1 && id <= 0) { // Check positive whole number
      // simpler check: id <= 0 || !Number.isInteger(id)
    }
    if (id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create record[cite: 16]
router.post("/", async (req, res, next) => {
  try {
    const errorMsg = validateRecord(req.body);
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const { title, category, description, status } = req.body;
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [title.trim(), category.trim(), description.trim(), status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update record[cite: 16]
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const errorMsg = validateRecord(req.body);
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const { title, category, description, status } = req.body;
    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 WHERE id = $5 RETURNING *",
      [title.trim(), category.trim(), description.trim(), status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE record[cite: 16]
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;