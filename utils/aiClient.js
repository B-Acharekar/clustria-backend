import axios from "axios";

const FLASK_URL = process.env.FLASK_AI_URL || "http://localhost:6000/ai/classify";

export const classifyText = async (text) => {
  try {
    const res = await axios.post(FLASK_URL, { text });
    return res.data;
  } catch (err) {
    console.error("AI classify error:", err.message);
    return { label: "Unknown", method: "error" };
  }
};
