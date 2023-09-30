const axios = require('axios');


const googleValidateBtn = document.querySelector("#google-validate-btn");
const signupBtn = document.querySelector("#sign-up-btn");
const otpSendBtn = document.querySelector("#phone-verify-btn");
const phoneInput = document.querySelector("#phone-input");
const otpInput = document.querySelector("#otp-input");
const otpVerifyBtn = document.querySelector("#otp-verify-btn")
const otpSpinner = document.querySelector(".otp-spinner");
const otpConfirmed = document.querySelector(".otp-confirmed");
const otpDeclined = document.querySelector(".otp-declined")
const googleSigninBtn = document.querySelector("#google-validate-btn");
const form = document.getElementById("signup-form");
const emailInput = document.querySelector("#email-input");


let googleResult, verifiedPhoneNumber;


form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior


    if (!googleResult) {
        alert("Verify G-mail")
        return;
    }

    if (!verifiedPhoneNumber) {
        alert("Verify Phone Number");
        return;
    }

    const formData = new FormData(form);
    formData.append('profilePicture', googleResult.user.photoURL);
    formData.append('email', googleResult.user.email);
    formData.append('phone', parseInt(verifiedPhoneNumber.split("+91")[1]))
    console.log('from google', googleResult)




    axios.post('/user/signup', formData).then((res)=>{

        console.log(res);

        if(res.status ===201){
            alert('User registered succesfully');
            window.location.href = '/';
        }


      }).catch((error)=>{

        if(error.response.status === 409){

            alert('User alredy exists. Please create new account or login');
            window.location.href = '/user/signup';
        }

        else{

            alert('Something went wrong, try again.(make sure to enter all fields)');
            window.location.href = '/user/signup';
        }


      })


});








// Import the functions you need from the SDKs you need
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





let code;
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


otpSendBtn.addEventListener('click', () => {
    otpInput.removeAttribute("disabled");
    otpSendBtn.classList.add('hide');
    otpVerifyBtn.classList.remove('hide');
    otpVerifyBtn.classList.add('show');
    const phoneNumber = `+91${phoneInput.value.trim()}`;
    console.log(phoneNumber);





    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).

            otpVerifyBtn.addEventListener('click', () => {

                otpSpinner.classList.remove('hide');
                console.log(`confirmation result: ${confirmationResult}`)
                code = otpInput.value.trim();



                confirmationResult.confirm(code).then((result) => {

                    otpSpinner.classList.add('hide');

                    otpConfirmed.classList.remove('hide');


                    // User signed in successfully.
                    verifiedPhoneNumber = result.user.phoneNumber;
                    console.dir(result)
                    console.log(result.user)
                    phoneInput.disabled = true;
                    otpInput.classList.add('hide');
                    // ...
                }).catch((error) => {
                    console.log('howwwwwww', error)
                    otpDeclined.classList.remove('hide');
                    otpSpinner.classList.add('hide');


                    // User couldn't sign in (bad verification code?)
                    // ...
                });



                //   window.confirmationResult = confirmationResult;
                // ...
            })
        }).catch((error) => {
            console.log(`error ${error}`);
            // Error; SMS not sent
            // ...
        });


})

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
            emailInput.value = user.email;
            emailInput.placeholder = user.email;


            googleResult = result;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
})



