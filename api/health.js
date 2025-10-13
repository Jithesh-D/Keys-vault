module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.json({
      success: true,
      message: "API Health Check - OK",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
