import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.models.js";
import dotenv from "dotenv";

export default function configurePassport() {
  if (!process.env.CLIENT_ID && !process.env.GOOGLE_CLIENT_ID) {
    dotenv.config();
  }
  const clientID = process.env.CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.CALLBACK_URL || "http://localhost:5001/api/auth/google/callback";

  if (!clientID || !clientSecret) {
    console.warn(
      "\n===================================================================\n" +
      "WARNING: CLIENT_ID or CLIENT_SECRET is missing.\n" +
      "Google OAuth login strategy will be disabled.\n" +
      "===================================================================\n"
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let existingUser = await User.findOne({ googleId: profile.id });
          
          if (!existingUser) {
            existingUser = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
            if (existingUser) {
              existingUser.googleId = profile.id;
              if (profile.photos && profile.photos[0]) {
                existingUser.avatar = profile.photos[0].value;
              }
              await existingUser.save();
            }
          } else {
            if (profile.photos && profile.photos[0]) {
              existingUser.avatar = profile.photos[0].value;
              await existingUser.save();
            }
          }

          if (existingUser) {
            return done(null, existingUser);
          }

          const user = new User({
            name: profile.displayName,
            email: profile.emails[0].value.toLowerCase(),
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
            googleId: profile.id,
            role: "admin"
          });

          await user.save();
          done(null, user);
        } catch (error) {
          console.error("Error in Google Strategy:", error);
          done(error, null);
        }
      }
    )
  );
}
