const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI =
  "mongodb+srv://root:root@myproject.pmimgo1.mongodb.net/SocialApp?retryWrites=true&w=majority&appName=Myproject";
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client.db("SocialApp");
  return cachedDb;
}

module.exports = async (req, res) => {
  const { id } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "DELETE") {
    try {
      const { userToken } = req.body;
      if (!userToken) {
        return res
          .status(400)
          .json({ success: false, error: "User token required" });
      }

      const db = await connectDB();
      const link = await db
        .collection("links")
        .findOne({ _id: new ObjectId(id) });

      if (!link) {
        return res
          .status(404)
          .json({ success: false, error: "Link not found" });
      }

      if (link.userToken !== userToken) {
        return res
          .status(403)
          .json({ success: false, error: "Cannot delete others links" });
      }

      await db.collection("links").deleteOne({ _id: new ObjectId(id) });
      return res.json({ success: true, message: "Link deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ success: false, error: "Delete failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
