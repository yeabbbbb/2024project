const Btn = document.querySelector('.header__Btn');
const menu = document.querySelector('.header__menu');

const toggleButton = document.querySelector('#toggleButton');
const section = document.querySelector('.search-form');

Btn.addEventListener('click', () => {
    menu.classList.toggle('active');
})