import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { env } from "../config/env";
import { createNewUser, getUserByEmail } from "../queries/user.queries";

const router = express.Router();

const CLIENT_URL = "http://localhost:5173";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.auth.clientId!,
      clientSecret: env.auth.clientSecret!,
      callbackURL: "http://localhost:4000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        // Check if user exists
        let user = await getUserByEmail(email);
        
        // Create user if doesn't exist
        if (!user) {
          user = await createNewUser({
            email: email,
            name: profile.displayName,
            googleId: profile.id,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

router.use(cookieParser());
router.use(passport.initialize());

router.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    try {
      const token = jwt.sign(
        { 
          userId: req.user.id,     
          email: req.user.email,
          name: req.user.name 
        },
        env.auth.jwtSecret!,
        { expiresIn: "1h" }
      );

      // Send HTML that posts message to parent window
    res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .message {
                text-align: center;
                color: #333;
              }
              .error {
                display: none;
              }
            </style>
          </head>
          <body>
            <div class="message" id="success">
              <h2>✓ Authentication successful!</h2>
              <p>Closing window...</p>
            </div>
            <div class="message error" id="error">
              <h2>Error</h2>
              <p>Please close this window and try again.</p>
            </div>
            <script>
              // Send token to parent window
              if (window.opener) {
                window.opener.postMessage(
                  { token: '${token}' }, 
                  '${CLIENT_URL}'
                );
                window.close();
              } else {
                document.getElementById('success').style.display = 'none';
                document.getElementById('error').style.display = 'block';
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error creating JWT:", error);
      
      // Send error message to parent window
      res.send(`
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  { error: 'Authentication failed' }, 
                  '${CLIENT_URL}'
                );
                window.close();
              }
            </script>
            <p>Authentication failed. Please close this window.</p>
          </body>
        </html>
      `);
    }
  }
);

export default router;