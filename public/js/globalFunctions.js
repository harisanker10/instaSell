try {
    const notify = (message, time, err) => {
        const notificationBody = document.querySelector('.notification');
        const notificationCloseBtn = document.querySelector('.notification-close');
        const content = document.querySelector('.notification-content');
    
        notificationBody.style.transition = "200ms";
    
        notificationBody.classList.remove('hide');
        if (err) {
            if (err.includes('err')) notificationBody.style.backgroundColor = 'red';
            else notificationBody.style.backgroundColor = err;
        }
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
    
    
    document.addEventListener('DOMContentLoaded', (event) => {
    
    
        const notifyCookie = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('notify='));
    
        if (notifyCookie) {
            const [, notifyValue] = notifyCookie.split('=');
            window.notify(decodeURIComponent(notifyValue), 5000)
            console.log('Notify:', decodeURIComponent(notifyValue));
            document.cookie = 'notify=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    })
    
    const loadingOverlay = document.querySelector('#loading-overlay')
    const loadingSlider = document.querySelector('#loading-slider')
    
    const loadingOn = () => {
        loadingOverlay.classList.remove('hide');
        loadingSlider.classList.remove('hide');
    
    }
    
    const loadingOff = () => {
        loadingOverlay.classList.add('hide');
        loadingSlider.classList.add('hide')
    }
    
    const loadingSliderOn = ()=>{
        loadingSlider.classList.remove('hide')
        
    }
    
    window.loadingOn = loadingOn;
    window.loadingOff = loadingOff;
    window.loadingSliderOn = loadingSliderOn;
    
    
    
    
    
    
    
    window.notify = notify;
    
}catch(err){
    console.log(err)
}