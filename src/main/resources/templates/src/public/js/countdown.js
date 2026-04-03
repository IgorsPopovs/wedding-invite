document.addEventListener('DOMContentLoaded', function() {

  var weddingDate = new Date('2026-06-20T16:00:00');
  var countdownSection = document.getElementById('countdown-section');

  countdownSection.style.display = 'block';

  function updateCountdown() {
    var now = new Date();
    var diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent    = '00';
      document.getElementById('cd-hours').textContent   = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      return;
    }

    var days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent    = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  window.showCountdownIfAttending = function(attending) {
    countdownSection.style.display = 'block';
  };

});