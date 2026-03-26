import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { RevenueService } from "./services/geminiService";

dotenv.config();

const PORT = 3000;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.APP_URL}/auth/linkedin/callback`;

const revService = new RevenueService();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // LinkedIn Auth URL
  app.get("/api/auth/linkedin/url", (req, res) => {
    if (!LINKEDIN_CLIENT_ID) {
      return res.status(400).json({ 
        error: "MISSING_CREDENTIALS", 
        message: "LinkedIn Client ID is not configured in environment variables." 
      });
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      scope: "openid profile email w_member_social",
      state: "ra_agent_auth_" + Math.random().toString(36).substring(7)
    });
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // LinkedIn Callback
  app.get("/auth/linkedin/callback", async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
      console.error("LinkedIn Auth Error:", error, error_description);
      return res.status(400).send(`LinkedIn Error: ${error_description || error}`);
    }

    if (!code) {
      return res.status(400).send("No authorization code provided.");
    }

    try {
      // Exchange code for access token - LinkedIn requires these in the body
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        client_id: LINKEDIN_CLIENT_ID || "",
        client_secret: LINKEDIN_CLIENT_SECRET || "",
        redirect_uri: LINKEDIN_REDIRECT_URI
      });

      const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", body.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const accessToken = tokenResponse.data.access_token;

      // Store token in cookie (secure for iframe)
      res.cookie("li_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 3600000 // 1 hour
      });

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'linkedin' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>LinkedIn connected successfully. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("LinkedIn OAuth Error:", error.response?.data || error.message);
      res.status(500).send("LinkedIn Authentication failed.");
    }
  });

  // Check connection status
  app.get("/api/auth/linkedin/status", (req, res) => {
    const token = req.cookies.li_token;
    res.json({ connected: !!token });
  });

  // Disconnect
  app.post("/api/auth/linkedin/disconnect", (req, res) => {
    res.clearCookie("li_token", {
      secure: true,
      sameSite: "none"
    });
    res.json({ success: true });
  });

  // --- Socket.io Logic ---
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("start_agent_mission", async (data) => {
      const { mission } = data;
      socket.emit("agent_log", { type: "info", message: `MISSION_START: ${mission}` });

      const steps = [
        "AUTHENTICATING: LinkedIn API Handshake...",
        "SCRAPING: Identifying High-Ticket Agencies in Target Geographies...",
        "FILTERING: Applying Revenue Benchmarks (>$5M ARR)...",
        "ENRICHING: Extracting Pain Point Data from Recent Job Ads...",
        "SYNTHESIZING: Generating Personalized Outreach Payloads...",
        "MISSION_COMPLETE: Leads Processed and Ready for Outreach."
      ];

      for (const step of steps) {
        // Use Gemini to generate a "real" log message based on the step
        const realLog = await revService.executeTask(step, { mission });
        socket.emit("agent_log", { 
          type: step.includes("COMPLETE") ? "success" : "agent", 
          message: realLog
        });
        await new Promise(r => setTimeout(r, 1000)); // Small delay for readability
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return app;
}

export default startServer();
