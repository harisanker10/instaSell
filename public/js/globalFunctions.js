const notify = (message, time) => {
    const container = document.querySelector('.flash-notification');
    const notificationBody = document.querySelector('.notification');
    const notificationCloseBtn = document.querySelector('.notification-close');
    const content = document.querySelector('.notification-content');

    notificationBody.style.transition = "200ms";

    notificationBody.classList.remove('hide');

    notificationCloseBtn.addEventListener('click', () => {
        // Remove transition effect before hiding
        notificationBody.style.transition = "none";
        notificationBody.classList.add('hide');
        notificationBody.style.opacity = "0%";
        notificationBody.style.transform = "";
    });



    content.innerHTML = message;

    void notificationBody.offsetWidth;

    notificationBody.style.opacity = "100%";
    notificationBody.style.transform = "translateY(5rem)";

    if (!time) {

        setTimeout(() => {

            notificationCloseBtn.click()
        }, 7000);


    }
    if (time && time != 'persist') {

        setTimeout(() => {

            notificationCloseBtn.click()
        }, time);


    }

};


document.addEventListener('DOMContentLoaded',(event)=>{

    
    const notifyCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('notify='));
    
    if (notifyCookie) {
        const [, notifyValue] = notifyCookie.split('=');
        window.notify(decodeURIComponent(notifyValue),5000)
        console.log('Notify:', decodeURIComponent(notifyValue));
        document.cookie = 'notify=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
})








window.notify = notify;
