import firebase from 'firebase';
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {GoogleAPI} from './GoogleAPI.js';
import * as AUTH from '../../constants/auth.js'
import * as ROUTES from '../../constants/routes.js';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

const GoogleAPIClientID = process.env.REACT_APP_CLIENT_ID;
const GoogleAPIScope = process.env.REACT_APP_SCOPE

class Firebase {
    constructor() {
        // console.log(dotenv, process.env);
        this.fb = app.initializeApp(config);
        this.firebase = firebase;
        // Needed for firebase API
        
        this.googleProvider = new app.auth.GoogleAuthProvider();
        this.facebookProvider = new app.auth.FacebookAuthProvider();
        this.twitterProvider = new app.auth.TwitterAuthProvider();        
        this.emailAuthProvider = app.auth.EmailAuthProvider;
        this.serverValue = app.database.ServerValue;
        this.auth = app.auth();
        this.db = app.database();
        this.extendedGoogle = AUTH.GOOGLEAPIs;

        if (this.extendedGoogle) {
          this.google = new GoogleAPI(GoogleAPIClientID,GoogleAPIScope, undefined, (googleApi) => {
            console.log("Logged In Google API");            
            if (googleApi.isSignedIn) {
              this.signinFromGAPI(googleApi.currentUser);
            }            
          }, (googleApi) => {
            console.log("loaded")                        
          })
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
        this.google.signOut()
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
        console.log("Signin with another method");
      } else {
        this.auth.signInWithPopup(this.googleProvider);
      }
    }

    signinFromGAPI = (currentUser) => {
      const authResponse = currentUser.getAuthResponse(true)
      const credential = firebase.auth.GoogleAuthProvider.credential(
        authResponse.id_token,
        authResponse.access_token
      )
      this.fb.auth().signInWithCredential(credential)
        .then((output) => {
          let user = output.user
            
          if (user) {
              let fbUser = {
                  username: user.displayName,
                  email: user.email,
                  photo: user.photoURL,
                  roles: {},
                  created: (new Date()).toISOString()
              }
              console.log('firebase: user signed in!', fbUser, document.location.href)             

              this.user(user.uid).get().then((obj) => {
                  // if (obj === )
                  let val = obj.val();
                  if (val === undefined) {
                      this.user(user.uid).set(fbUser)
                  } else {
                      console.log("FB", val)
                  }                  
                  if (document.location.pathname === ROUTES.SIGN_IN) {
                    document.location.pathname = ROUTES.HOME;
                  }               
              });
          }
      });        
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