import { Router } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import { InsertUser } from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google OAuth router
const router = Router();

// Configure Google OAuth strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract email from profile
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        return done(new Error('No email found in Google profile'));
      }
      
      // Check if user exists by email
      let user = await storage.getUserByEmail(email);
      
      // If user doesn't exist, create a new one
      if (!user) {
        const username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 
                         email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
        
        const newUser: InsertUser = {
          username,
          email,
          password: null, // OAuth users don't have passwords
          plan: 'basic',
          photoURL: profile.photos?.[0]?.value || null,
          isOAuthUser: true
        };
        
        user = await storage.createUser(newUser);
        console.log('Created new user from Google OAuth:', user.id);
      } else {
        console.log('Found existing user from Google OAuth:', user.id);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Routes for Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth?error=google-auth-failed'
  }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('/dashboard');
  }
);

export default router;