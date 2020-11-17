let width = window.innerWidth;
let height = window.innerHeight;

const darkButton = document.getElementById('dark');
const lightButton = document.getElementById('light');
const solarButton = document.getElementById('solar');
const body = document.body;

const elButton = document.querySelector(".emoji-button");
const elWrapper = document.querySelector(".emoji-wrapper");

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
  
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Apply the cached theme on reload

const theme = localStorage.getItem('theme');
const isSolar = localStorage.getItem('isSolar');

if (theme) {
  body.classList.add(theme);
  isSolar && body.classList.add('solar');
}

const laughmojis = ["😍", "😀", "😂", "😅", "😆", "😝", "🤩"];
const emojis = [];
const radius = 15;

const Cd = 0.47; // Dimensionless
const rho = 1.22; // kg / m^3
const A = Math.PI * radius * radius / 10000; // m^2
const ag = 9.81; // m / s^2
const frameRate = 1 / 60;



// Button Event Handlers

darkButton.onclick = () => {
  body.classList.replace('light', 'dark');
  localStorage.setItem('theme', 'dark');
};

lightButton.onclick = () => {
  body.classList.replace('dark', 'light');

  localStorage.setItem('theme', 'light');
};

solarButton.onclick = () => {

  if (body.classList.contains('solar')) {
    
    body.classList.remove('solar');
    solarButton.style.cssText = `
      --bg-solar: var(--yellow);
    `

    solarButton.innerText = 'solarize';

    localStorage.removeItem('isSolar');

  } else {

    solarButton.style.cssText = `
      --bg-solar: var(--gray2);
    `

    body.classList.add('solar');
    solarButton.innerText = 'normalize';

    localStorage.setItem('isSolar', true);
  }
};

function createEmojis() /* create a emoji */ {
    const vx = getRandomArbitrary(-10, 10); // x velocity
    const vy = getRandomArbitrary(-10, 1);  // y velocity
  
    const el = document.createElement("div");
    el.className = "emoji";
  
    const inner = document.createElement("span");
    inner.className = "inner";
    inner.innerText = laughmojis[getRandomInt(0, laughmojis.length - 1)];
    el.appendChild(inner);
  
    elWrapper.appendChild(el);
  
    const rect = el.getBoundingClientRect();
  
    const lifetime = getRandomArbitrary(2000, 3000);
  
    el.style.setProperty("--lifetime", lifetime);
  
    const emoji = {
      el,
      absolutePosition: { x: rect.left, y: rect.top },
      position: { x: rect.left, y: rect.top },
      velocity: { x: vx, y: vy },
      mass: 0.1, //kg
      radius: el.offsetWidth, // 1px = 1cm
      restitution: -.7,
  
      lifetime,
      direction: vx > 0 ? 1 : -1,
  
      animating: true,
  
      remove() {
        this.animating = false;
        this.el.parentNode.removeChild(this.el);
      },
  
      animate() {
        const emoji = this;
        let Fx =
          -0.5 *
          Cd *
          A *
          rho *
          emoji.velocity.x *
          emoji.velocity.x *
          emoji.velocity.x /
          Math.abs(emoji.velocity.x);
        let Fy =
          -0.5 *
          Cd *
          A *
          rho *
          emoji.velocity.y *
          emoji.velocity.y *
          emoji.velocity.y /
          Math.abs(emoji.velocity.y);
  
        Fx = isNaN(Fx) ? 0 : Fx;
        Fy = isNaN(Fy) ? 0 : Fy;
  
        // Calculate acceleration ( F = ma )
        var ax = Fx / emoji.mass;
        var ay = ag + Fy / emoji.mass;
        // Integrate to get velocity
        emoji.velocity.x += ax * frameRate;
        emoji.velocity.y += ay * frameRate;
  
        // Integrate to get position
        emoji.position.x += emoji.velocity.x * frameRate * 100;
        emoji.position.y += emoji.velocity.y * frameRate * 100;
  
        emoji.checkBounds();
        emoji.update();
      },
  
      checkBounds() {
  
        if (emoji.position.y > height - emoji.radius) {
          emoji.velocity.y *= emoji.restitution;
          emoji.position.y = height - emoji.radius;
        }
        if (emoji.position.x > width - emoji.radius) {
          emoji.velocity.x *= emoji.restitution;
          emoji.position.x = width - emoji.radius;
          emoji.direction = -1;
        }
        if (emoji.position.x < emoji.radius) {
          emoji.velocity.x *= emoji.restitution;
          emoji.position.x = emoji.radius;
          emoji.direction = 1;
        }
  
      },
  
      update() {
        const relX = this.position.x - this.absolutePosition.x;
        const relY = this.position.y - this.absolutePosition.y;
  
        this.el.style.setProperty("--x", relX);
        this.el.style.setProperty("--y", relY);
        this.el.style.setProperty("--direction", this.direction);
      }
    };
  
    setTimeout(() => {
      emoji.remove();
    }, lifetime);
  
    return emoji;
  }
  
  
  function animationLoop() {
    var i = emojis.length;
    while (i--) {
      emojis[i].animate();
  
      if (!emojis[i].animating) {
        emojis.splice(i, 1);
      }
    }
  
    requestAnimationFrame(animationLoop);
  }
  
  animationLoop();
  
  function addemojis() {
    //cancelAnimationFrame(frame);
    if (emojis.length > 40) {
      return;
    }
    for (let i = 0; i < 100; i++) {
      emojis.push(createEmojis());
    }
  }
  
  elButton.addEventListener("click", addemojis);
  elButton.click();
  
  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
  });
  
  
  
  //fetching jokes and displaying new jokes
  
  
  const jokeText = document.querySelector('.joke');
  const newJokeBtn = document.querySelector('.joke-btn');
  const tweetBtn = document.querySelector('.tweet-btn');
  
  newJokeBtn.addEventListener('click', getJoke);
  getJoke();
  
  function getJoke() {
    fetch('https://icanhazdadjoke.com/', {
      headers: {
        'Accept': 'application/json'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
  
      const joke = data.joke;
      jokeText.innerText = joke;
  
      const tweetLink = `https://twitter.com/share?text=${joke}`;
  
      tweetBtn.setAttribute('href', tweetLink);
    }).catch(function (error) {
      jokeText.innerText = 'Oops! Some error happened :(';
      tweetBtn.removeAttribute('href');
      console.log(error);
    });
  }
