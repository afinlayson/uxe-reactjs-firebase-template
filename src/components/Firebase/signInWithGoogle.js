// import {gapi} from 'react-gapi';
// const provider = new firebase.auth.GoogleAuthProvider();

// const googleProvider = new firebase.auth.GoogleAuthProvider()
// export const signInWithGoogle = () => {
//   auth.signInWithPopup(googleProvider).then((res) => {
//     console.log(res.user)
//   }).catch((error) => {
//     console.log(error.message)
//   })
// }

// const GOOGLE_CLIENT_API = process.env.REACT_APP_CLIENT_ID;
// const GOOGLE_AUTH_SCOPES = [
//     'email',
//     'profile',
//     'https://www.googleapis.com/auth/calendar.event.readonly'
//   ]

export class SignInWithGoogle {    

    constructor(gapiClient, firebase, completion = () => {}) {// Examples
        this.firebase = firebase
        this.client = gapiClient;
        this.completion = completion

        this.loadgapi((gapi) => {
            this.setup(gapi)              
        })
    }

    loadgapi(onLoad) {
        let gapi = window.gapi
        if (!gapi)  {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/client.js";
            script.onload = ()=> {
                this.gapi = window.gapi;
                onLoad(window.gapi)
            };
            document.body.appendChild(script);
        } else {
            this.gapi = gapi
            onLoad(gapi)
        }
        
    }

    setup(gapi) {        
        Promise.all([
            new Promise((resolve, reject) => {
                gapi.load('client:auth2', () => {
                    console.log("---->");
                    resolve()
                })
            })//,
            // new Promise((resolve, reject) => { 
            //     gapi.load("auth2", () => {
            //         resolve()
            //     })
            //     // this.auth2 = this.gapi.auth2.getAuthInstance()       
            //     // return this.auth2
            // })
        ])
        .then(() => { console.log('gapi: client:auth2 loaded', gapi.client) })
        .then(() => {  
            console.log("client -", this.client);
            return gapi.client.init(this.client);     
        })            

        .then(() => { console.log('gapi: client initialized') })        
        .then(() => { return gapi.client.load('calendar', 'v3')})
        .then(() => { console.log('gapi: calendar v3 loaded', gapi.client.calendar)})
        .then(() => { 
            const auth2 = gapi.auth2.getAuthInstance()
            auth2.isSignedIn.listen(this.handleIsSignedIn)

            
            window.gapi.auth2.getAuthInstance().currentUser.listen((user) => {
                console.log(user);
                debugger
            });


            this.handleIsSignedIn(auth2.isSignedIn.get())               
            // const auth2 = this.gapi.auth2.getAuthInstance();
            // auth2.isSignedIn.listen(this.handleIsSignedIn);
            // this.handleIsSignedIn(auth2.isSignedIn.get());
            // this.auth2 = auth2;
        }, err => {
            console.log("ERROR", err);
        })                            
    }

    signin() {        
        if (this.tried ) {
debugger
            return;
        } else {
            this.tried = true;
        }

        
        const auth2 = this.auth2//this.gapi.auth2.getAuthInstance()
        if (auth2.isSignedIn.get()) {
          alert('already signed in')
          return
        }

        auth2.signIn()
        .catch(error => { alert(`sign in error: ${error}`) })
    }

    signout() {
        console.log('signing out...')
        const auth2 = this.gapi.auth2.getAuthInstance()
        if (!auth2.isSignedIn.get()) {
        //   alert('Not signed in!')
            console.log("Already logged out");
        //   return
        }

        auth2.signOut()
          .then(() => { console.log('gapi: sign out complete') })
          .then(() => { return this.firebase.auth.signOut() })
          .then(() => { console.log('firebase: sign out complete') },
          err => {
              console.log("Error logging out ", err)
          })      
    }

    handleIsSignedIn(isSignedIn) {
        if (!isSignedIn) {
            // debugger
            // let auth2 = this.gapi.auth2.getAuthInstance()
            // isSignedIn = auth2.isSignedIn.get()
            isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get()
        }
        if (isSignedIn) {    

            if (!this.auth2) {this.auth2 = this.gapi.auth2.getAuthInstance()}
            if (!this.currentUser) { this.currentUser = this.auth2.currentUser.get()}
            if (!this.profile) { this.profile = this.currentUser.getBasicProfile()}        

            console.log('gapi: user signed in!', {
                name: this.profile.getName(),
                imageURL: this.profile.getImageUrl(),
                email: this.profile.getEmail(),
            })

                // this.currentUser = this.auth2.currentUser.get()
                // this.profile = this.currentUser.getBasicProfile()     
            const authResponse = this.currentUser.getAuthResponse(true)
            
            const credential = this.firebase.googleProvider.credential( // auth.GoogleAuthProvider
            authResponse.id_token,
            authResponse.access_token
            )
            this.firebase.auth.signInWithCredential(credential)
            .then((output) => {
                let user = output                
                if (user) {
                    let info = {
                        displayName: user.user.displayName,
                        email: user.user.email,
                        photoURL: user.user.photoURL,
                    }

                    this.firebase.user(user.user.uid).set({
                        username: user.user.displayName,
                        email: user.user.email,
                        roles: {},
                      });
                    console.log('firebase: user signed in!', info)  
                    this.completion(info, this)

                    // test
                    this.listCalendars()
                }
            })

        } else {
            console.log('gapi: user is not signed in')
        }
    }


    listCalendars(calendarInfo = {
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
      }, completion = (response) => {}) {
        this.gapi.client.calendar.events.list(calendarInfo)
            .then((response) => {
                console.log('Google Calendar request successful!', response)
                completion(response)
            // debugger
            // if (response.result.items && response.result.items.length) {
            //   const accountNames = response.result.items.map(account => account.name)
            //   alert('Google Analytics account names: ' + accountNames.join(' '))
            // }
            }, error => {
                completion(undefined, error);
                console.log("ERORR", error);            
            })
    }
}


