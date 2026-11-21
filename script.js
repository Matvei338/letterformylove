// 1. Проверяем, телефон это или компьютер
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

// 2. Находим элементы на странице по их ID
const screens = document.querySelectorAll('.screen');
const btnNext = document.getElementById('btn-next');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnBack = document.getElementById('btn-back');
const btnRestart = document.getElementById('btn-restart');

// 3. Функция переключения экранов
function showScreen(id) {
  screens.forEach(s => s.classList.remove('active')); // Скрываем все
  document.getElementById(id).classList.add('active'); // Показываем нужный
}

// 4. Навигация (какая кнопка куда ведет)
btnNext.addEventListener('click', () => showScreen('screen-2'));
btnYes.addEventListener('click', () => showScreen('screen-4'));
btnBack.addEventListener('click', () => showScreen('screen-2'));
btnRestart.addEventListener('click', resetAndRestart);

// 5. Логика кнопки "Нет"
let noCount = 0;
let escapeStarted = false;

btnNo.addEventListener('click', () => {
  noCount++;
  if (noCount === 1) {
    showScreen('screen-3'); // Первый раз - на экран с плачущим смайлом
  } else if (noCount === 2) {
    startEscape(); // Второй раз - включаем побег
  }
});

// 6. Функция сброса (когда нажали "Начать заново" в конце письма)
function resetAndRestart() {
  showScreen('screen-1'); // Возвращаем на 1 экран
  noCount = 0;            // Обнуляем счетчик "Нет"
  escapeStarted = false;
  mobileScale = 1;

  // Очищаем все стили, которые накидал JS
  btnNo.classList.remove('escaping');
  btnNo.style.left = '';
  btnNo.style.top = '';
  btnNo.style.width = '';
  btnNo.style.height = '';
  btnNo.style.transform = '';
  btnNo.style.margin = '';
  
  btnYes.classList.remove('grown'); // Убираем увеличение с "Да"
}

// 7. Запуск побега
function startEscape() {
  if (escapeStarted) return;
  escapeStarted = true;

  btnYes.classList.add('grown'); // Да увеличивается в 1.5 раза

  // Замораживаем "Нет" на текущем месте
  const rect = btnNo.getBoundingClientRect();
  btnNo.classList.add('escaping');
  btnNo.style.left = rect.left + 'px';
  btnNo.style.top = rect.top + 'px';
  btnNo.style.width = rect.width + 'px';
  btnNo.style.height = rect.height + 'px';
  btnNo.style.margin = '0';

  // Включаем нужное поведение (ПК или Мобилка)
  if (isMobile) {
    enableMobileEscape();
  } else {
    enableDesktopEscape();
    teleportButton(); // Сразу прыгает
  }
}

// 8. ПК: убегает от курсора
function enableDesktopEscape() {
  document.addEventListener('mousemove', (e) => {
    const rect = btnNo.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Формула Пифагора: расстояние от курсора до кнопки
    const distance = Math.hypot(e.clientX - cx, e.clientY - cy);

    if (distance < 90) teleportButton(); // Если ближе 90 пикселей - прыгает
  });
}

// 9. Телефон: прыгает и уменьшается
let mobileScale = 1;
let lastEscapeTime = 0;

function escapeStep() {
  const now = Date.now();
  if (now - lastEscapeTime < 100) return; // Защита от двойного клика
  lastEscapeTime = now;

  mobileScale = Math.max(0.4, mobileScale - 0.15); // Уменьшаем, но не меньше 40%
  btnNo.style.transform = `scale(${mobileScale})`;
  teleportButton();
}

function enableMobileEscape() {
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    escapeStep();
  }, { passive: false });
  
  // Чтобы можно было тестировать в браузере
  btnNo.addEventListener('mousedown', (e) => {
    e.preventDefault();
    escapeStep();
  });
}

// 10. Телепорт кнопки в случайное место
function teleportButton() {
  const padding = 20;
  const rect = btnNo.getBoundingClientRect();
  const yesRect = btnYes.getBoundingClientRect();

  const maxX = Math.max(0, window.innerWidth - rect.width - padding * 2);
  const maxY = Math.max(0, window.innerHeight - rect.height - padding * 2);

  let newX, newY, attempts = 0;
  do {
    newX = Math.random() * maxX + padding;
    newY = Math.random() * maxY + padding;
    attempts++;
    // Проверяем, чтобы не приземлилась прямо на кнопку "Да"
  } while (attempts < 10 && overlaps(newX, newY, rect.width, rect.height, yesRect));

  btnNo.style.left = newX + 'px';
  btnNo.style.top = newY + 'px';
}

// Проверка на пересечение прямоугольников
function overlaps(x, y, w, h, r) {
  return !(x + w < r.left || x > r.right || y + h < r.top || y > r.bottom);
}