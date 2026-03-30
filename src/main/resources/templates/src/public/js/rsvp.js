document.addEventListener('DOMContentLoaded', function() {

  var inviteCode = new URLSearchParams(window.location.search).get('guest') || 'unknown';

  if (inviteCode !== 'unknown') {
    fetch('/wedding-invite/api/guest?guest=' + encodeURIComponent(inviteCode))
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data) return;
        document.getElementById('rsvp-name').value = data.name || '';
        if (data.attending !== null) {
          var attending = document.querySelector('input[name="attending"][value="' + data.attending + '"]');
          if (attending) attending.checked = true;
          var plusOne = document.querySelector('input[name="plus-one"][value="' + data.plus_one + '"]');
          if (plusOne) plusOne.checked = true;
          document.getElementById('rsvp-message').textContent = 'Вы уже подтвердили своё присутствие 🤍';
          document.getElementById('rsvp-form').style.opacity = '0.5';
          document.getElementById('rsvp-form').style.pointerEvents = 'none';
        }
      });
  }

  function submitRSVP() {
    var name = document.getElementById('rsvp-name').value.trim();
    var attendingEl = document.querySelector('input[name="attending"]:checked');
    var plusOneEl = document.querySelector('input[name="plus-one"]:checked');

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
      body: JSON.stringify({ name: name, attending: parseInt(attending), plus_one: plusOne, invite_code: inviteCode })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.ok) {
        var msgEl = document.getElementById('rsvp-message');
        msgEl.style.color = 'var(--fig)';
        msgEl.textContent = attending === '1'
          ? 'Спасибо! Мы рады вашему присутствию 🤍'
          : 'Ну и хорошо, мы все равно вас чисто для приличия пригласили 🤍';
        document.getElementById('rsvp-form').style.opacity = '0.5';
        document.getElementById('rsvp-form').style.pointerEvents = '0.5';
        document.getElementById('rsvp-form').style.pointerEvents = 'none';
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