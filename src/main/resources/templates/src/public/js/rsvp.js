var LAST_UPDATED = '2026-04-08 20:00:00';

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

      if (data.last_visit && LAST_UPDATED > data.last_visit) {
        var updatedEls = [];
        document.querySelectorAll('[data-updated]').forEach(function(el) {
          var elUpdated = el.getAttribute('data-updated') || LAST_UPDATED;
          if (elUpdated > (data.last_visit || '')) {
            var badge = document.createElement('span');
            badge.className = 'updated-badge';
            var d = new Date(elUpdated.replace(' ', 'T'));
            var months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
            var dateStr = d.getDate() + ' ' + months[d.getMonth()] + ', ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
            badge.textContent = '✦ обновлено ' + dateStr;
            el.appendChild(badge);
            updatedEls.push(el);
          }
        });

        if (updatedEls.length > 0) {
          var banner = document.createElement('div');
          banner.className = 'update-banner';
          banner.innerHTML = '<span class="update-banner-icon">✦</span> есть обновления <span class="update-banner-arrow">↓</span>';
          document.body.appendChild(banner);

          var visited = new Set();
          banner.addEventListener('click', function() {
            // find next updated element below current viewport center
            var viewportCenter = window.scrollY + window.innerHeight / 2;
            var next = null;
            var nextIdx = -1;
            for (var i = 0; i < updatedEls.length; i++) {
              var top = updatedEls[i].getBoundingClientRect().top + window.scrollY;
              if (top > viewportCenter + 10) {
                next = updatedEls[i];
                nextIdx = i;
                break;
              }
            }
            // if no next below — find first unvisited, else hide
            if (!next) {
              var firstUnvisited = null;
              for (var j = 0; j < updatedEls.length; j++) {
                if (!visited.has(j)) { firstUnvisited = j; break; }
              }
              if (firstUnvisited !== null) {
                next = updatedEls[firstUnvisited];
                nextIdx = firstUnvisited;
              } else {
                // all visited — hide banner
                banner.style.transition = 'opacity 0.4s ease';
                banner.style.opacity = '0';
                setTimeout(function() { banner.remove(); }, 400);
                return;
              }
            }
            visited.add(nextIdx);
            next.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // highlight after scroll — find .highlight-target inside data-highlight sibling, or fallback
            var highlightSibling = next.nextElementSibling && next.nextElementSibling.hasAttribute('data-highlight')
              ? next.nextElementSibling : null;
            var elToHighlight = highlightSibling
              ? (highlightSibling.querySelector('.highlight-target') || highlightSibling)
              : next;
            setTimeout(function() {
              elToHighlight.classList.remove('section-highlight');
              void elToHighlight.offsetWidth; // reflow to restart animation
              elToHighlight.classList.add('section-highlight');
            }, 600);
            // hide if all visited
            if (visited.size === updatedEls.length) {
              setTimeout(function() {
                banner.style.transition = 'opacity 0.4s ease';
                banner.style.opacity = '0';
                setTimeout(function() { banner.remove(); }, 400);
              }, 800);
              return;
            }
            // update arrow if multiple sections
            var arrow = banner.querySelector('.update-banner-arrow');
            if (updatedEls.length > 1) {
              arrow.textContent = '↓';
            }
          });
        }
      }

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

      // Record visit AFTER reading last_visit to avoid race condition
      fetch('/wedding-invite/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode, user_agent: navigator.userAgent })
      });
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