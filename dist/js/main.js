'use strict';

// Получаем данные из LocalStorage
const getCartData = function () {
  return JSON.parse(localStorage.getItem('cart'));
}

// Записываем данные в LocalStorage
const setCartData = function (o) {
  localStorage.setItem('cart', JSON.stringify(o));
  return false;
}

const changeButton = function (button) {
  button.innerText = 'В корзине';
  button.classList.remove('loading', 'btn-1', 'js-buy');
  button.classList.remove('btn-1');
  button.classList.remove('js-buy');
  button.classList.add('btn-2');
};


// проверяем картины в корзине
const checkProduct = function () {
  const buttons = document.querySelectorAll('.js-buy');
  const cartData = getCartData() || {};
  for (let i = 0; i < buttons.length; i++) {
    const id = buttons[i].dataset.id;
    if (cartData.hasOwnProperty(id)) {
      changeButton(buttons[i]);
    }
  }
};
checkProduct();


// реализация добавления в корзину
const addToCart = function (id) {

  // получаем данные корзины или создаём новый объект, если данных еще нет
  var cartData = getCartData() || {};

  // если товара там нет, добавляем.
  if (!cartData.hasOwnProperty(id)) {
    cartData[id] = id;
  }

  setCartData(cartData)// Обновляем данные в LocalStorage

  return false;
}


// обрабатываем покупку картины
document.addEventListener('click', function (evt) {
  if (evt.target.classList.contains('js-buy')) {
    const button = evt.target;
    const id = button.dataset.id;

    button.disabled = true;
    button.classList.add('loading');
    button.innerText = '';

    // загружем с сервера. 

    // реализация через fetch
    
    // let productData = window.fetch('https://jsonplaceholder.typicode.com/posts/1');
    // productData.then( function(response){
    //   addToCart(id); // добавляем в корзину
    //   changeButton(button); // меняем состояние кнопо к
    // });


    axios.get('https://jsonplaceholder.typicode.com/posts/1')
      .then(function (response) {
        addToCart(id); // добавляем в корзину
        changeButton(button); // меняем состояние кнопок
      })
      .catch(function (error) {
        alert('Ошибка');
      })

    //END загружем с сервера.
  };

});

