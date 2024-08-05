const Btn = document.querySelector('.header__Btn');
const menu = document.querySelector('.header__menu');
const right = document.querySelector('.header__right');

Btn.addEventListener('click', () => {
    menu.classList.toggle('active');
    right.classList.toggle('active');
})