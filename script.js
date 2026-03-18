// small niceties
    document.getElementById('year').textContent = new Date().getFullYear();

    const birthDate = new Date("2010-01-13");
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();

    // Adjust if the birthday hasn't occurred yet this year
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) years--;

    document.getElementById("age").textContent = years;
    document.getElementById("GameDevAge").textContent = years-8;

    // smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href.length>1) {
          e.preventDefault();
          document.querySelector(href).scrollIntoView({behavior:'smooth', block:'start'});
        }
      })
    });

  function getBackgroundImages() {
    const elements = Array.from(document.querySelectorAll('*'));
    const urls = [];

    elements.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        const matches = bg.match(/url\(["']?([^"')]+)["']?\)/g);
        if (matches) {
          matches.forEach(url => {
            const cleanUrl = url.replace(/url\(["']?/, '').replace(/["']?\)/, '');
            urls.push(cleanUrl);
          });
        }
      }
    });

    return urls;
  }

  // Wait for all images (including CSS backgrounds)
  async function waitForAllImages() {
    const imgElements = Array.from(document.images).map(img => img.src);
    const bgImages = getBackgroundImages();
    const allUrls = [...imgElements, ...bgImages];

    await Promise.all(allUrls.map(src => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
      });
    }));
  }

  // Main preloader
  document.addEventListener("DOMContentLoaded", async () => {
    await waitForAllImages();
    const loader = document.getElementById("loader");
    loader.classList.add("fade-out");
    
    setTimeout(() => loader.remove(), 800);
    setTimeout(() => {
      console.log("Adding loaded class...");
      const mizuki = document.getElementById("mizuki");
      mizuki.classList.add("loaded");
    }, 200);
  });

  document.querySelectorAll('.music-card').forEach(card => {
    const audio = card.querySelector('.music-player');
    const playBtn = card.querySelector('.play-btn');
    const progress = card.querySelector('.progress');
    const progressContainer = card.querySelector('.progress-container');

    // Start paused
    audio.pause();
    audio.volume = 0.1; // <-- set default volume to 40%
    playBtn.textContent = '▶';

    playBtn.addEventListener('click', () => {
      // Pause all other players
      document.querySelectorAll('.music-player').forEach(otherAudio => {
        if(otherAudio !== audio) otherAudio.pause();
      });
      document.querySelectorAll('.play-btn').forEach(btn => {
        if(btn !== playBtn) btn.textContent = '▶';
      });

      if(audio.paused){
        audio.play();
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    audio.addEventListener('timeupdate', () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + '%';
    });

    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      audio.currentTime = (clickX / width) * audio.duration;
    });
  });

  // Define your list of strings
  const messages = [
    "Meow!",
    "Roblox is love Roblox is life!",
    "AnRat was here.",
    "JACK ITS A REVENENANT",
    "I know what you goon to",
    "FUCK Broken Studios",
    "### # #### #### ####",
    "Potato corner 🤤",
    "Give me Potato Corner or give me Death",
    "Akiyama Mizuki Desu!",
    "秋山瑞稀です！",
    "アクワーです！",
    "Aqua Desu!",
    "Gomen...",
    "ごめん。。。",
    "世界でいちばんおひめさま",
    "Hi Addy :3",
    "Lesbians",
    "*notices buldge*",
    "Error 404: Mental breakdown in affect.",
    "My name is Alexander Hamilton",
    "HE WROTE THE OTHER 51", 
    "Do a barrel roll",
    "Beep Boop",
    "Splash Text!",
    "Open the sparkling apple juice karen!",
    "Press F to pay respects",
    "Powered by chaos",
    "I speak fluent spaghetti",
    "HANK DONT ABBRIEVIATE CYBERPUNK HANK",
    "1, 2, 3, 4, 5, 8, 9",
    "I goon to femboys but noone will know.",
    "The world turned upside down...",
    "On the morning of septemb-",
    "Im a Catgirl btw",
    "More insecurities than a cyclops",
    "Metal Health -inf",
    "Is it veiny?",
    "72 Hours a day on Roblox",
    "Vins feet 🤤",
    "@everyone",
    ""
  ];

  // Function to pick a random message
  function setRandomMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    document.getElementById("SplashText").textContent = messages[randomIndex];
  }

  // Call it once when the page loads
  setRandomMessage();

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    console.log(btn.innerHTML)
    btn.addEventListener('click', () => {
      btn.style.display = 'none'; // hide button

      const container = btn.closest('.desc'); // get the parent paragraph
      const readMoreText = container.querySelector('.read-more-text');
      const readMoreBreak = container.querySelector('.read-more-break');

      readMoreText.style.display = 'inline'; // show typing area
      container.classList.add("expanded")
      const fullText = readMoreBreak.innerHTML;

      let i = 0;
      function type() {
        if (i < fullText.length) {
          if (fullText[i] === "<") { 
            const endTag = fullText.indexOf(">", i);
            readMoreText.innerHTML = fullText.slice(0, i) + "|";
            i = endTag + 1;
          } else {
            readMoreText.innerHTML = fullText.slice(0, i) + "|";
            i++;
          }
          setTimeout(type, 7);
        } else {
          readMoreText.innerHTML = fullText.slice(0, i);
        }
      }
      type();
    });
  });

  const errorEl = document.getElementById("vaultError");
    const terminaltitle = document.getElementById("terminaltitle");
    const terminalclass = document.getElementById("terminalclass");
    const terminalpriority = document.getElementById("terminalpriority");
    const terminaltag = document.getElementById("terminaltag");
    const terminaldesc = document.getElementById("terminaldesc");
    const terminalicon = document.getElementById("terminalicon");

    async function openVault() {
      const phrase = document.getElementById("vaultInput").value.trim();

      errorEl.textContent = "";
      terminaldesc.style.display = "none";
      errorEl.style.display = "none";
      console.log("asd")
      // Only allow safe filenames (letters + numbers)
      if (!/^[a-zA-Z0-9_-]+$/.test(phrase)) {
          errorEl.textContent = "Invalid phrase.";
          errorEl.style.display = "block";
          return;
      }

      try {
          const response = await fetch(`secrets/${phrase}.txt`);

          if (!response.ok) {
              throw new Error("Not found");
          }

          const text = await response.text();
          parseSecret(text);

      } catch (err) {
        console.log(err)
          errorEl.textContent = "No secret found.";
          errorEl.style.display = "block";
      }
  }

  function parseSecret(content) {
      const lines = content.split("\n");

      const title = lines[0]?.replace("Title:", "").trim() || "Unknown";
      const subclass = lines[1]?.replace("Class:", "").trim() || "Unknown";
      const priority = lines[2]?.replace("Priority:", "").trim() || "Unknown";
      const tag = lines[3]?.replace("Tag:", "").trim() || "Unknown";
      const icon = lines[4]?.replace("Icon:", "").trim() || "Unknown";
      const paragraph = lines.slice(6).join("\n").trim();

      terminaltitle.innerHTML = title;
      terminalclass.innerHTML = subclass
      terminalpriority.innerHTML = priority
      terminaltag.innerHTML = tag
      terminaldesc.innerHTML = paragraph
      terminalicon.src = icon

      terminaldesc.style.display = "block";
  }

const SelfNames = [
  "Seph",
  "Aqua",
  "Mizuki",
  "アクアー",
  "瑞稀",
];

const textelements = document.querySelectorAll('#NameText'); // Selects all elements with the class

let index = 0;

function showNextWord() {
    textelements.forEach(el => {
        console.log("a")
        el.classList.remove("nametext-show");
        el.classList.add("nametext-hide");
            setTimeout(() => {
                el.textContent = SelfNames[index];

                el.classList.remove("nametext-hide");
                el.classList.add("nametext-showtop");

                setTimeout(() => {
                    el.classList.remove("nametext-showtop");
                    el.classList.add("nametext-show");
                }, 200);
         }, 200);
    });
    index = (index + 1) % SelfNames.length;
}

setInterval(showNextWord, 2000);