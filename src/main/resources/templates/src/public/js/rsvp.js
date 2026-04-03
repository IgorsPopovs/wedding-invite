document.addEventListener('DOMContentLoaded', function() {

  var inviteCode = new URLSearchParams(window.location.search).get('guest');

  if (!inviteCode) {
    inviteCode = localStorage.getItem('anon_invite_code');
    if (!inviteCode) {
      inviteCode = "guest_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('anon_invite_code', inviteCode);
    }
  } else {
    localStorage.setItem('anon_invite_code', inviteCode);
    history.replaceState(null, '', window.location.pathname);
  }

  fetch('/wedding-invite/api/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invite_code: inviteCode, user_agent: navigator.userAgent })
  });

  var plusOneSection = document.getElementById('plus-one-section');
  var plusOneNameSection = document.getElementById('plus-one-name-section');

  plusOneSection.style.display = 'none';
  plusOneNameSection.style.display = 'none';

  document.querySelectorAll('input[name="attending"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      plusOneSection.style.display = this.value === '1' ? 'block' : 'none';
      if (this.value !== '1') plusOneNameSection.style.display = 'none';
      if (window.showCountdownIfAttending) {
        window.showCountdownIfAttending(parseInt(this.value));
      }
    });
  });

  document.querySelectorAll('input[name="plus-one"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      plusOneNameSection.style.display = this.value === '1' ? 'flex' : 'none';
    });
  });

  fetch('/wedding-invite/api/guest?guest=' + encodeURIComponent(inviteCode))
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data) return;
      document.getElementById('rsvp-name').value = data.name || '';
      if (data.attending !== null) {
        var attending = document.querySelector('input[name="attending"][value="' + data.attending + '"]');
        if (attending) attending.checked = true;
        if (data.attending === 1) {
          plusOneSection.style.display = 'block';
          var plusOne = document.querySelector('input[name="plus-one"][value="' + data.plus_one + '"]');
          if (plusOne) plusOne.checked = true;
          if (data.plus_one === 1) {
            plusOneNameSection.style.display = 'flex';
            document.getElementById('plus-one-name').value = data.plus_one_name || '';
          }
        }
        if (window.showCountdownIfAttending) {
          window.showCountdownIfAttending(data.attending);
        }
        document.getElementById('rsvp-message').textContent = 'Вы уже подтвердили своё присутствие — можете изменить ответ 🤍';
        document.getElementById('rsvp-message').style.color = 'var(--fig)';
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
      document.getElementById('rsvp-message').textContent = 'Пожалуйста, введите ваше имя.';
      document.getElementById('rsvp-message').style.color = '#a8385a';
      return;
    }

    if (!attendingEl) {
      document.getElementById('rsvp-message').textContent = 'Пожалуйста, выберите вариант присутствия.';
      document.getElementById('rsvp-message').style.color = '#a8385a';
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
        var msgEl = document.getElementById('rsvp-message');
        msgEl.style.color = 'var(--fig)';
        msgEl.textContent = attending === '1'
          ? 'Спасибо! Мы рады вашему присутствию 🤍'
          : 'Ну и хорошо, мы все равно вас чисто для приличия пригласили 🤍';
        btn.disabled = false;
        btn.textContent = 'Подтвердить';
        if (attending === '1') launchHearts();
      }
    })
    .catch(function() {
      btn.disabled = false;
      btn.textContent = 'Подтвердить';
      document.getElementById('rsvp-message').textContent = 'Что-то пошло не так :( Напишите нам, мы проверим :D.';
    });
  }

  document.getElementById('rsvp-submit').addEventListener('click', submitRSVP);

});