import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { env } from "../config/env";
import { createNewUser, getUserByEmail } from "../queries/user.queries";

const router = express.Router();
const CLIENT_URL = env.constants.clientUrl!;

const generateTokens = (userId: string, email: string, name: string) => {
  const accessToken = jwt.sign(
    { userId, email, name },
    env.auth.jwtSecret!,
    { expiresIn: "15m" } 
  );

  const refreshToken = jwt.sign(
    { userId, email, tokenType: "refresh" },
    env.auth.refreshTokenSecret!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};


passport.use(
  new GoogleStrategy(
    {
      clientID: env.auth.clientId!,
      clientSecret: env.auth.clientSecret!,
      callbackURL: env.auth.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        let user = await getUserByEmail(email);
        
        if (!user) {
          user = await createNewUser({
            email: email,
            name: profile.displayName,
            googleId: profile.id,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
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

      const userPayload = {
        email: req.user.email,
        name: req.user.name,
      };

       const { accessToken, refreshToken } = generateTokens(
        req.user.id,
        req.user.email,
        req.user.name
      );

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
                { 
                    token: '${accessToken}',
                    refreshToken: '${refreshToken}',
                    user: '${JSON.stringify(userPayload)}',
                }, 
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

router.post("/validate", (req, res) => {
  try {
    const { token } = req.body;
    
    if (token) {
      const decoded = jwt.verify(token, env.auth.jwtSecret!) as any;
      res.status(200).json({
        valid: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name
        }
      });
    } else {
      res.status(401).json({ error: "Token required" });
    }
  } catch (error) {
    const isExpired = error instanceof jwt.TokenExpiredError;
    
    if (isExpired) {
      res.status(401).json({ valid: false, error: "Token expired" });
    } else {
      res.status(401).json({ valid: false, error: "Invalid token" });
    }
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;    
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, env.auth.refreshTokenSecret!) as jwt.JwtPayload;
      const isRefreshToken = decoded.tokenType === "refresh";
      
      if (isRefreshToken) {
        const user = await getUserByEmail(decoded.email);
        if (user) {
          const tokens = generateTokens(user.id, user.email, user.name);
          res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
              userId: user.id,
              email: user.email,
              name: user.name
            }
          });
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } else {
        res.status(401).json({ message: "Invalid token type" });
      }
    } else {
      res.status(401).json({ message: "Refresh token required" });
    }
  } catch (error) {
    const isExpired = error instanceof jwt.TokenExpiredError;
    
    if (isExpired) {
      res.status(401).json({ message: "Refresh token expired" });
    } else {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  }
});


export default router;