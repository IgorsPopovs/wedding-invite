document.addEventListener('DOMContentLoaded', function() {

  var inviteCode = new URLSearchParams(window.location.search).get('guest') || 'unknown';
  var plusOneSection = document.getElementById('plus-one-section');
  var plusOneNameSection = document.getElementById('plus-one-name-section');

  // Hide plus-one sections initially
  plusOneSection.style.display = 'none';
  plusOneNameSection.style.display = 'none';

  // Show/hide plus-one section based on attending
  document.querySelectorAll('input[name="attending"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      plusOneSection.style.display = this.value === '1' ? 'block' : 'none';
      if (this.value !== '1') plusOneNameSection.style.display = 'none';
    });
  });

  // Show/hide plus-one name field based on plus-one selection
  document.querySelectorAll('input[name="plus-one"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      plusOneNameSection.style.display = this.value === '1' ? 'flex' : 'none';
    });
  });

  if (inviteCode !== 'unknown') {
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
              plusOneNameSection.style.display = 'block';
              document.getElementById('plus-one-name').value = data.plus_one_name || '';
            }
          }
          document.getElementById('rsvp-message').textContent = 'Вы уже подтвердили своё присутствие 🤍';
          document.getElementById('rsvp-form').style.opacity = '0.5';
          document.getElementById('rsvp-form').style.pointerEvents = 'none';
        }
      });
  }

  // Anonymous submit lock via localStorage
  if (inviteCode === 'unknown' && localStorage.getItem('rsvp_submitted')) {
    document.getElementById('rsvp-message').textContent = 'Вы уже подтвердили своё присутствие 🤍';
    document.getElementById('rsvp-message').style.color = 'var(--fig)';
    document.getElementById('rsvp-form').style.opacity = '0.5';
    document.getElementById('rsvp-form').style.pointerEvents = 'none';
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
        if (inviteCode === 'unknown') localStorage.setItem('rsvp_submitted', '1');
        var msgEl = document.getElementById('rsvp-message');
        msgEl.style.color = 'var(--fig)';
        msgEl.textContent = attending === '1'
          ? 'Спасибо! Мы рады вашему присутствию 🤍'
          : 'Ну и хорошо, мы все равно вас чисто для приличия пригласили 🤍';
        document.getElementById('rsvp-form').style.opacity = '0.5';
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