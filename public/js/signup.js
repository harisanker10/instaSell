const signupBtn = document.querySelector(".sign-up-btn");
const otpSendBtn = document.querySelector("#phone-verify-btn");
const phoneInput = document.querySelector("#phone-input");
const otpInput = document.querySelector("#otp-input");
const otpVerifyBtn = document.querySelector("#otp-verify-btn")
const otpSpinner = document.querySelector(".otp-spinner");
const otpConfirmed = document.querySelector(".otp-confirmed");
const otpDeclined = document.querySelector(".otp-declined")
const googleSigninBtn = document.querySelector("#google-validate-btn");
const emailInput = document.querySelector("#email-input");
const signUpForm = document.querySelector("#signup-form")








const loginWithPhoneBtn = document.querySelector("#login-phone-validate-btn");
const phoneValidationDiv = document.querySelector("#phone-validation-input-div");

loginWithPhoneBtn.addEventListener('click', () => {
    loginWithPhoneBtn.classList.add('hide');
    phoneValidationDiv.classList.remove('hide');
})


import { initializeApp } from "firebase/app";
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





// // let code;
const provider = new GoogleAuthProvider();


const app = initializeApp(firebaseConfig);

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


    window.notify("OTP sent")


    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).

            otpVerifyBtn.addEventListener('click', () => {

                otpSpinner.classList.remove('hide');
                console.log(`confirmation result: ${confirmationResult}`)
                const code = otpInput.value.trim();



                confirmationResult.confirm(code).then((result) => {

                    console.log(result);
                    console.log(result.user.phoneNumber);
                    const data = {
                        phone: result.user.phoneNumber
                    }
                    otpSpinner.classList.add('hide');
                    otpConfirmed.classList.remove('hide');
                    window.loadingOn()

                    fetch('/signup', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        console.log(res)
                        if (res.ok) window.location.href = '/';
                    }

                    );



                }).catch((error) => {
                    console.log('howwwwwww', error)
                    otpDeclined.classList.remove('hide');
                    otpSpinner.classList.add('hide');
                    window.location.href('/signup')


                    // User couldn't sign in (bad verification code?)
                    // ...
                });



                //   window.confirmationResult = confirmationResult;
                // ...
            })
        }).catch((error) => {
            console.log(`error ${error}`);
            window.location.href('/signup')
            // Error; SMS not sent
            // ...
        });


})

signupBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.loadingOn();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;

            const formData = new FormData(signUpForm);
            formData.append('email', user.email);
            formData.append('profilePicture', user.photoURL);
            formData.append('guid', user.uid);

            fetch('/signup', {
                method: 'post',
                body: formData,
            })
                .then(res => {
                    console.log(res);
                    console.log(res.ok);
                    if (res.ok) window.location.href = '/';



                })
                .catch(err => console.log(err));
        })

});

googleSigninBtn.addEventListener('click', () => {
    window.loadingOn();
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.

            const user = result.user;

            const formData = new FormData();
            formData.append('firstName', user.displayName);
            formData.append('email', user.email);
            formData.append('profilePicture', user.photoURL);
            formData.append('guid', user.uid);

            fetch('/signup', {
                method: 'post',
                body: formData,
            })
                .then(res => {
                    console.log(res);
                    console.log(res.ok);
                    if (res.ok) window.location.href = '/';



                })
                .catch(err => console.log(err));



            console.log('userrrrrrrrr', user);
            console.log('userrrrrrrrr', user.uid);
            console.log('usennnnnnnn', user.email);
            console.log('userrrrrpiccccccc', user.photoURL);
            console.log('displayyyynameeeeeee', user.displayName);
            emailInput.value = user.email;
            emailInput.placeholder = user.email;



            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((err) => {

            console.log(err)
        });
})


console.log('elon ma')
