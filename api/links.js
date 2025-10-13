module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    // Return empty array for now
    return res.json({
      success: true,
      data: [],
      count: 0,
    });
  }

  if (req.method === "POST") {
    // Mock response for now
    return res.json({
      success: true,
      data: {
        _id: "mock-" + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
      },
      message: "Link saved (mock mode)",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
