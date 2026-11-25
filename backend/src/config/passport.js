import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export function configurePassport() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error("Google account has no email"));

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: profile.displayName || "Google User",
              email,
              avatar: profile.photos?.[0]?.value || "",
              provider: "google",
              isEmailVerified: true,
              role: "client"
            });
          } else if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}
