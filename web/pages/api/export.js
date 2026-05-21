import { getDb } from "../../lib/db";

function hasExportAccess(req) {
  const configuredToken = process.env.EXPORT_TOKEN;
  if (!configuredToken) return false;
  const providedToken = Array.isArray(req.query.token)
    ? req.query.token[0]
    : req.query.token || req.headers["x-export-token"];
  return providedToken === configuredToken;
}

function escapeCsvCell(value) {
  if (value == null) return "";
  const escapedFormula = String(value).replace(/^\s*[=+\-@\t\r\n]/, (match) => `'${match}`);
  if (escapedFormula.includes(",") || escapedFormula.includes('"') || escapedFormula.includes("\n")) {
    return `"${escapedFormula.replace(/"/g, '""')}"`;
  }
  return escapedFormula;
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.EXPORT_TOKEN) {
    return res.status(404).json({ error: "Not found" });
  }
  if (!hasExportAccess(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const db = getDb();
  const format = (req.query.format || "json").toLowerCase();
  const country = (req.query.country || "").trim();

  const conditions = ["COALESCE(is_promotional, 0) = 0"];
  const params = [];

  if (country) {
    conditions.push("countries LIKE ?");
    params.push(`%${country}%`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const emails = db
    .prepare(
      `SELECT id, doc_id, sender, subject, to_recipients, sent_at, countries, release_batch, epstein_is_sender
       FROM emails ${where}
       ORDER BY COALESCE(sent_at, '9999-99-99') ASC`
    )
    .all(...params);

  if (format === "csv") {
    const headers = ["id", "doc_id", "sender", "subject", "to_recipients", "sent_at", "countries", "release_batch", "epstein_is_sender"];
    const csvRows = [headers.join(",")];

    for (const row of emails) {
      const values = headers.map((h) => escapeCsvCell(row[h]));
      csvRows.push(values.join(","));
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=epstein-africa-emails.csv");
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(csvRows.join("\n"));
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=epstein-africa-emails.json");
  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({ emails, total: emails.length, exported_at: new Date().toISOString() });
}
