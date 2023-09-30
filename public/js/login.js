const loginWithPhoneBtn = document.querySelector("#login-phone-validate-btn");
const phoneValidationDiv = document.querySelector("#phone-validation-input-div");
const googleSigninBtn = document.querySelector("#google-validate-btn");
const form = document.getElementById("login-form");

loginWithPhoneBtn.addEventListener('click', () => {
    loginWithPhoneBtn.classList.add('hide');
    phoneValidationDiv.classList.remove('hide');
})


const axios = require('axios');
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const firebaseConfig = {

    apiKey: "AIzaSyBBYF2oBXM_RL5QWugSVzEWvYJ5XyAGaSs",
  
    authDomain: "practice-659b3.firebaseapp.com",
  
    projectId: "practice-659b3",
  
    storageBucket: "practice-659b3.appspot.com",
  
    messagingSenderId: "601964225504",
  
    appId: "1:601964225504:web:55ec9620a999a3c45d4185",
  
    measurementId: "G-9EC9K41XK9"
  
  };
  

const provider = new GoogleAuthProvider();


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'phone-verify-btn', {
    'size': 'invisible',
    'callback': (response) => {
        console.log(`recaptcha verified. Response : ${response}`)
    }
});
const appVerifier = window.recaptchaVerifier;

googleSigninBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.

            const user = result.user;
            console.log('userrrrrrrrr', user);
            console.log('usennnnnnnn', user.email);
            console.log('userrrrrpiccccccc', user.photoURL);
            console.log('displayyyynameeeeeee', user.displayName);

            const formData = new FormData();
            formData.append('token', token);
            formData.append('email', user.email);
            formData.append('working','gucci test')
            console.log(formData)
            
            axios.post('/user/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }).then((res)=>{

                if(res.status === 404){
                    alert('User not found, try again');
                    window.location.href = '/user/login';
                }


            })
            .catch((err)=>{
                console.log('ente mone')
                alert('User not found, try again');
                window.location.href = '/user/login';
            });

        })
})