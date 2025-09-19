import sql from "../config/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error(error);
    const message =
      error && error.message
        ? error.message
        : String(error) || "Internal server error";
    try {
      res.status(500).json({ success: false, message });
    } catch (e) {
      // fallback if res.status is not available for any reason
      if (typeof res.json === "function") {
        res.json({ success: false, message });
      }
    }
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations =
      await sql`SELECT * FROM creations WHERE publish= true ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error(error);
    const message =
      error && error.message
        ? error.message
        : String(error) || "Internal server error";
    try {
      res.status(500).json({ success: false, message });
    } catch (e) {
      // fallback if res.status is not available for any reason
      if (typeof res.json === "function") {
        res.json({ success: false, message });
      }
    }
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql` SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes;
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Uliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation Liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;
    res.json({ success: true, message });
  } catch (error) {
    console.error(error);
    const message =
      error && error.message
        ? error.message
        : String(error) || "Internal server error";
    try {
      res.status(500).json({ success: false, message });
    } catch (e) {
      // fallback if res.status is not available for any reason
      if (typeof res.json === "function") {
        res.json({ success: false, message });
      }
    }
  }
};
