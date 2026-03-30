    function submitRSVP() {
      var name = document.getElementById('name').value.trim();
      var attending = document.querySelector('input[name="attending"]:checked').value;
      var plusOne = document.getElementById('plus-one').checked ? 1 : 0;

      if (!name) {
        document.getElementById('message').textContent = 'Please enter your name.';
        return;
      }

      fetch('/wedding-invite/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, attending: parseInt(attending), plus_one: plusOne })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.ok) {
            if (attending) {
                document.getElementById('message').textContent = 'Спасибо! Мы рады вашему присутствию 🤍';
            } else {
                document.getElementById('message').textContent = 'Ну и хорошо, мы все равно вас чисто для приличия пригласили 🤍';
            }
       document.getElementById('rsvp-form').style.opacity = '0.5';
        }
      })
      .catch(function() {
        document.getElementById('message').textContent = 'Что-то пошло не так :( Напишите нам, мы проверим :D.';
      });

    }