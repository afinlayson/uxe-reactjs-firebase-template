import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { SignInWithGoogle } from './signInWithGoogle.js';
import * as AUTH from '../../constants/auth';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
    constructor() {
        // console.log(dotenv, process.env);
        app.initializeApp(config);
        // Needed for firebase API
        
        this.googleProvider = new app.auth.GoogleAuthProvider();
        this.facebookProvider = new app.auth.FacebookAuthProvider();
        this.twitterProvider = new app.auth.TwitterAuthProvider();        
        this.emailAuthProvider = app.auth.EmailAuthProvider;
        this.serverValue = app.database.ServerValue;
        this.auth = app.auth();
        this.db = app.database();

        this.extendedGoogle = AUTH.GOOGLEAPIs
        if (this.extendedGoogle) {
          let AUTH_SCOPES = [
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar.events.readonly'
          ]
          let gapiClient = {
            apiKey: config.apiKey,
            clientId: process.env.REACT_APP_CLIENT_ID,
            discoveryDocs:  ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: AUTH_SCOPES.join(' '),
            ux_mode: "redirect",
            redirect_uri: "http://localhost:8000"
          }
          gapiClient["client_id"] = process.env.REACT_APP_CLIENT_ID;
          console.log("__>", gapiClient)
          this.google = new SignInWithGoogle(gapiClient, this)
        } else {

        }
    }

    isSignedIn() {               
        return this.auth.currentUser !== null ;
    }

    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => {

      this.auth.signOut();
      if (this.google) {
        this.google.signout()
      }

    }

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            if (!dbUser) {
                fallback();
                return;
            }
            if (!dbUser.roles) {
              dbUser.roles = {};
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

    doSendEmailVerification = () =>
        this.auth.currentUser.sendEmailVerification({
            url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
        });

    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);


    signInWithGoogle = () => {      
      // This is the way to do everything through Firebase (Doesn't allow you access to Google APIs)
      if (this.extendedGoogle) {
        this.google.completion = (info, google) => {
          console.log("completed Login", info);
          google.listCalendars()
        }
        this.google.signin();

      } else {
        this.auth.signInWithPopup(this.googleProvider);
      }
      // 


    }
        

    signInWithFacebook = () =>
        this.auth.signInWithPopup(this.facebookProvider);

    signInWithTwitter = () =>
        this.auth.signInWithPopup(this.twitterProvider);

    
    // *** User API *** 
    user = uid => this.db.ref(`users/${uid}`);
    
    users = () => this.db.ref('users');

}

export default Firebase;