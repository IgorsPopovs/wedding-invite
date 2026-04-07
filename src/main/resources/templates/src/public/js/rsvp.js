document.addEventListener('DOMContentLoaded', function() {

  function showMessage(text, color, success) {
    var el = document.getElementById('rsvp-message');
    el.classList.remove('show', 'success');
    el.textContent = text;
    el.style.color = color || 'var(--fig)';
    void el.offsetWidth; // force reflow so animation re-triggers
    el.classList.add('show');
    if (success) el.classList.add('success');
  }

  var inviteCode = new URLSearchParams(window.location.search).get('guest');

  if (!inviteCode) {
    inviteCode = localStorage.getItem('anon_invite_code');
    if (!inviteCode) {
      inviteCode = "guest_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('anon_invite_code', inviteCode);
    }
  } else {
    localStorage.setItem('anon_invite_code', inviteCode);
  }

  fetch('/wedding-invite/api/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invite_code: inviteCode, user_agent: navigator.userAgent })
  });

  var plusOneSection = document.getElementById('plus-one-section');
  var plusOneNameSection = document.getElementById('plus-one-name-section');
  var submitBtn = document.getElementById('rsvp-submit');

  plusOneSection.style.display = 'none';
  plusOneNameSection.style.display = 'none';
  submitBtn.classList.add('unmodified');

  function markModified() {
    submitBtn.classList.remove('unmodified');
  }

  document.querySelectorAll('input[name="attending"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      markModified();
      plusOneSection.style.display = this.value === '1' ? 'flex' : 'none';
      if (this.value !== '1') {
        plusOneNameSection.style.display = 'none';
      } else {
        var plusOneChecked = document.querySelector('input[name="plus-one"]:checked');
        plusOneNameSection.style.display = (plusOneChecked && plusOneChecked.value === '1') ? 'flex' : 'none';
      }
      if (window.showCountdownIfAttending) {
        window.showCountdownIfAttending(parseInt(this.value));
      }
    });
  });

  document.querySelectorAll('input[name="plus-one"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      markModified();
      plusOneNameSection.style.display = this.value === '1' ? 'flex' : 'none';
    });
  });

  document.getElementById('rsvp-name').addEventListener('input', markModified);
  document.getElementById('plus-one-name').addEventListener('input', markModified);

  fetch('/wedding-invite/api/guest?guest=' + encodeURIComponent(inviteCode))
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data) return;

      if (data.name) {
        var nameParts = data.name.trim().split(/\s+/).filter(function(p) { return p.replace(/[^а-яёa-z]/gi, '').length > 1; });
        var baseName = nameParts.length ? nameParts[0] : data.name.trim();
        var lastChar = baseName.replace(/[^а-яёa-z]/gi, '').slice(-1).toLowerCase();
        var isFeminine = lastChar === 'а' || lastChar === 'я' || lastChar === 'a' || lastChar === 'e';
        var salutation = isFeminine ? 'Дорогая' : 'Дорогой';
        var greeting = data.plus_one_name
          ? 'Дорогие ' + data.name + ' и ' + data.plus_one_name + '!'
          : salutation + ' ' + data.name + '!';
        document.getElementById('greeting').textContent = greeting;
      }

      document.getElementById('rsvp-name').value = data.name || '';

      // always pre-fill +1 data even if attending is unknown yet
      var plusOne = document.querySelector('input[name="plus-one"][value="' + data.plus_one + '"]');
      if (plusOne) plusOne.checked = true;
      if (data.plus_one_name) document.getElementById('plus-one-name').value = data.plus_one_name;

      if (data.attending !== null) {
        var attending = document.querySelector('input[name="attending"][value="' + data.attending + '"]');
        if (attending) attending.checked = true;
        if (data.attending === 1) {
          plusOneSection.style.display = 'flex';
          if (data.plus_one === 1) {
            plusOneNameSection.style.display = 'flex';
          }
        }
        if (window.showCountdownIfAttending) {
          window.showCountdownIfAttending(data.attending);
        }
        showMessage('Вы уже подтвердили своё присутствие — можете изменить ответ ❤️', 'var(--olive)', true);
      }
    });

  function launchHearts() {
    var count = 12;
    for (var i = 0; i < count; i++) {
      (function(i) {
        setTimeout(function() {
          var heart = document.createElement('div');
          heart.className = 'floating-heart';
          heart.innerHTML = '♥';
          heart.style.left = (20 + Math.random() * 60) + '%';
          heart.style.animationDuration = (1.2 + Math.random() * 1.2) + 's';
          heart.style.fontSize = (14 + Math.random() * 18) + 'px';
          heart.style.opacity = (0.6 + Math.random() * 0.4);
          document.querySelector('.card').appendChild(heart);
          setTimeout(function() { heart.remove(); }, 2500);
        }, i * 80);
      })(i);
    }
  }

  function submitRSVP() {
    var name = document.getElementById('rsvp-name').value.trim();
    var attendingEl = document.querySelector('input[name="attending"]:checked');
    var plusOneEl = document.querySelector('input[name="plus-one"]:checked');
    var plusOneName = document.getElementById('plus-one-name').value.trim();

    if (!name) {
      showMessage('Пожалуйста, введите ваше имя.', '#a8385a');
      return;
    }

    if (!attendingEl) {
      showMessage('Пожалуйста, выберите вариант присутствия.', '#a8385a');
      return;
    }

    var attending = attendingEl.value;
    var plusOne = plusOneEl ? parseInt(plusOneEl.value) : 0;

    var btn = document.getElementById('rsvp-submit');
    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    fetch('/wedding-invite/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, attending: parseInt(attending), plus_one: plusOne, plus_one_name: plusOneName, invite_code: inviteCode })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.ok) {
        showMessage(attending === '1'
          ? 'Спасибо! Мы рады вашему присутствию ❤️'
          : 'Ну и хорошо, мы все равно вас чисто для приличия пригласили ❤️',
          'var(--olive)', true);
        btn.disabled = false;
        btn.textContent = 'Подтвердить';
        btn.classList.add('unmodified');
        if (attending === '1') launchHearts();
      }
    })
    .catch(function() {
      btn.disabled = false;
      btn.textContent = 'Подтвердить';
      showMessage('Что-то пошло не так :( Напишите нам, мы проверим :D.', '#a8385a');
    });
  }

  document.getElementById('rsvp-submit').addEventListener('click', submitRSVP);

});