import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import FormData from "form-data";
import { GoogleGenAI } from "@google/genai";

// Gemini Client

// const AI = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // const response = await AI.chat.completions.create({
    //   model: "gemini-2.5-flash",
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: length,
    // });

    // const content = response.choices[0].message.content;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      maxTokens: length,
      temperature: 0.7,
    });

    const content = response.text;

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
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

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // const response = await AI.chat.completions.create({
    //   model: "gemini-2.0-flash",
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 100,
    // });
    // const content = response.choices[0].message.content;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      max_tokens: 100,
      temperature: 0.7,
    });
    // console.log(response.text);
    const content = response.text;

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error);
    const message =
      error && error.message
        ? error.message
        : String(error) || "Internal server error";
    try {
      res.status(500).json({ success: false, message });
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
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql` INSERT INTO creations (user_id, prompt,content,type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
      publish ?? false
    })`;

    res.json({ success: true, content: secure_url });
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

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          backgroud_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });
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

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);
    console.log(`removing object: ${object}`);
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.error(error);
    const message =
      error && error.message
        ? error.message
        : String(error) || "Internal server error";
    try {
      res.status(500).json({ success: false, message });
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
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allows size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);

    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and ares for improvement. Resume Content: \n\n${pdfData.text}`;

    // const response = await AI.chat.completions.create({
    //   model: "gemini-2.0-flash",
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 1000,
    // });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });
    console.log(response.text);
    const content = response.text;

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.json({ success: true, content });
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
