const Intro = document.getElementById("Intro")

const bgMusic = new Audio("./Sounds/DefaultVideoGame.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.025; // 0.0 - 1.0
bgMusic.style.transition = "volume 2s"

let CurVolume = 0.025

function startMusic() {
    bgMusic.play();
}

function stopMusic() {
    bgMusic.pause();
}

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
}

startMusic()

var fadeTimer;
function fadeOut() {
    clearTimeout(fadeTimer); // Stop any existing fade

    var decreaseVolume = function() {
        if (bgMusic.volume > 0) {
            bgMusic.volume -= 0.005; // Decrement volume
            // Use Math.max to prevent going below 0.0
            bgMusic.volume = Math.max(bgMusic.volume, 0); 
            fadeTimer = setTimeout(decreaseVolume, 20); // Repeat every 10ms
        } else {
            bgMusic.pause(); // Pause when silent
            bgMusic.currentTime = 0; // Reset playback position
        }
    };
    decreaseVolume();
}

function changeMusic(track, volume) {
    fadeOut()
    setTimeout(() => {
        bgMusic.src = track;
        CurVolume = volume
        bgMusic.volume = volume
        startMusic()
    }, 1000)
}


document.addEventListener("click", () => {
    startMusic();
}, { once: true });

const typingSound = document.getElementById('typing-sound');

function KeystrokeSound() {
    const soundInstance = typingSound.cloneNode();
    soundInstance.volume = 0.01
    soundInstance.play();
  
  // Optional: Remove the clone from memory after it finishes
    soundInstance.onended = () => soundInstance.remove();
}

const lines = [
    "February 14th.",
    "Loading memory...",
    "Out of all timelines...",
    "Out of all save files...",
    "I would always choose you.",
    "...",
    "Addy...",
];

let current = 0;

function startGame() {
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    typeText(lines[current]);
}

function nextLine() {
    current++;

    if (current < lines.length) {
        typeText(lines[current]);
    } else {
        showChoice();
    }
}

function typeText(text, elementToType) {
    let i = 0;
    const speed = 40;
    let element = document.getElementById("text");
    if (elementToType) {
        element = elementToType
    }
    element.innerHTML = "";

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);

            KeystrokeSound()

            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

function showChoice() {
    const box = document.querySelector(".dialogue-box");

    box.innerHTML = `
        <p id="Question"></p>
        <button id="yesBtn" onclick="yesEnding()">YES</button>
        <button id="noBtn" onclick="window.location.href='https://mattiasgustavsson.com/wasm/doom-crt/'">NO</button>
    `;

    const Question = document.getElementById("Question")
    typeText("Will you be my Valentine?", Question)

    // 1. Select the element you want to track
    const elementToHover = document.getElementById('noBtn');

    // 2. Add a 'mouseenter' event listener
    elementToHover.addEventListener('mouseenter', (event) => {
        const noBtn = document.getElementById("noBtn");

        const x = Math.floor(Math.random() * 300) - 150;
        const y = Math.floor(Math.random() * 200) - 100;

        noBtn.style.position = "relative";
        noBtn.style.left = x + "px";
        noBtn.style.top = y + "px";
    });

}

const Memories = document.getElementById("Memories")
const MemoriesText = document.getElementById("GuideText")
const TextCursor = document.getElementById("TextCursor")
function TypeMemories(Text) {
    console.log(Text)
    const speed = 30;
    let i = MemoriesText.innerHTML.length;

    function UnType() {
        if (i > 0) {
            MemoriesText.innerHTML = MemoriesText.innerHTML.slice(0, -1);
            i--;
            setTimeout(UnType, speed/2);
        } else {
            type(); // Start typing AFTER untyping finishes
        }
    }

    let j = 0;
    function type() {
        if (j < Text.length) {
            MemoriesText.innerHTML += Text.charAt(j);

            KeystrokeSound()

            j++;
            setTimeout(type, speed);
        }
    }

    UnType();
}

const Phase2Img = document.getElementById("Phase2Img")
const Phase3Text = document.getElementById("ILY")

function Phase3() {
    Memories.style.width = "100vw"
    Memories.style.height = "100vh"
    Memories.style.opacity = 1
    Memories.style.filter = "blur(0px)"

    setTimeout(() => {
        TypeMemories("So Thank You...")
        setTimeout(() => {
            TypeMemories("Addy...")
            setTimeout(() => {
                TypeMemories("Happy Valentines Day!")
                setTimeout(() => {
                    TypeMemories("I Love You! - Seph")
                    setTimeout(() => {
                        MemoriesText.style.opacity = 0
                        MemoriesText.style.filter = "blur(150px)"
                        TextCursor.style.opacity = 0
                        TextCursor.style.filter = "blur(150px)"
                        Phase3Text.style.opacity = 1
                        Phase3Text.style.filter = "blur(0px)"
                    }, 5100)
                }, 5100)
            }, 5100)
        }, 5100)
    }, 5100)
}

function Phase2() {
    Memories.style.width = "500vw"
    Memories.style.height = "500vh"
    Memories.style.opacity = 0
    Memories.style.filter = "blur(50px)"

    setTimeout(() => {
        TypeMemories("Lets start from the beggining...")
        changeMusic("./Sounds/MenuTheme.mp3", 0.1)
        Phase2Img.style.opacity = 1
        Phase2Img.style.filter = "Blur(0px)"

            setTimeout(() => {
                TypeMemories("Oops")
                setTimeout(() => {
                    TypeMemories("Too early")
                    setTimeout(() => {
                        Phase2Img.style.opacity = 0
                        Phase2Img.style.filter = "blur(500px)"
                        setTimeout(() => {
                            Phase2Img.src = "Images/Beggining.png"
                            setTimeout(() => {
                                Phase2Img.style.opacity = 1
                                Phase2Img.style.filter = "Blur(0px)"
                                setTimeout(() => {
                                    TypeMemories("There... ‎  ‎  ‎  ‎  Much Better...")
                                    setTimeout(() => {
                                        TypeMemories("We started playing!")
                                        setTimeout(() => {
                                            Phase2Img.style.opacity = 0
                                            Phase2Img.style.filter = "blur(500px)"
                                            TypeMemories("The domino effect can be crazy...")
                                            setTimeout(() => {
                                                Phase2Img.src = "Images/Roblox.jpg"
                                                TypeMemories("But it brought me to You!")
                                                setTimeout(() => {
                                                    Phase2Img.style.opacity = 1
                                                    Phase2Img.style.filter = "blur(0px)"
                                                    TypeMemories("We kept playing Roblox!")
                                                    setTimeout(() => {
                                                        Phase2Img.style.opacity = 0
                                                        Phase2Img.style.filter = "blur(500px)"
                                                        TypeMemories("Even I started crawling out of my comfort zone...")
                                                        setTimeout(() => {
                                                            Phase2Img.src = "Images/Discord.jpg"
                                                            Phase2Img.style.opacity = 1
                                                            Phase2Img.style.filter = "blur(0px)"
                                                            TypeMemories("The discord server started growing!")
                                                            setTimeout(() => {
                                                                TypeMemories("We VC'd for hours lol")
                                                                setTimeout(() => {
                                                                    Phase2Img.style.opacity = 0
                                                                    Phase2Img.style.filter = "blur(500px)"
                                                                    TypeMemories("This was the first time...")
                                                                    setTimeout(() => {
                                                                        TypeMemories("I felt loved...")
                                                                        setTimeout(() => {
                                                                            TypeMemories("I was planning on making this longer")
                                                                            setTimeout(() => {
                                                                                TypeMemories("But im running out of time...")
                                                                                Phase3()
                                                                            }, 5000)
                                                                        }, 10000)
                                                                    }, 4000)
                                                                }, 4000)
                                                            }, 4000)
                                                        }, 4000)
                                                    }, 4000)
                                                }, 4000)
                                            }, 4000)
                                        }, 4000)
                                    }, 5000)
                                }, 1500)
                            }, 200)
                        }, 2000)
                    }, 1000)
                }, 2000)
            }, 4000)
    }, 2300)
}

if (window.location.hash == "#phase2") {
    Intro.style.display = "none"
    Phase2()
}
if (window.location.hash == "#phase3") {
    Intro.style.display = "none"
    changeMusic("./Sounds/MenuTheme.mp3", 0.1)
    Phase3()
}
if (window.location.hash == "#end") {
    Intro.style.display = "none"
    Memories.style.width = "100vw"
    Memories.style.height = "100vh"
    Memories.style.opacity = 1
    Memories.style.filter = "blur(0px)"
    MemoriesText.style.opacity = 0
    MemoriesText.style.filter = "blur(150px)"
    TextCursor.style.opacity = 0
    TextCursor.style.filter = "blur(150px)"
    Phase3Text.style.opacity = 1
    Phase3Text.style.filter = "blur(0px)"
    changeMusic("./Sounds/MenuTheme.mp3", 0.1)
}

let Started = false

function yesEnding() {
    if (!Started) {
        Started = true
        Intro.style.opacity = 0

        changeMusic("./Sounds/YourRealityDDLC.mp3", 0.05)

        setTimeout(() => {
            console.log('IntroOver!');
            TypeMemories("Is this thing working?")
            setTimeout(() => {
                Intro.style.display = "none"
                TypeMemories("Hiiii Addy! :3")
                setTimeout(() => {
                    TypeMemories("ILY!")
                    setTimeout(() => {
                        TypeMemories("I wish i was with u rn :(")
                        setTimeout(() => {
                            TypeMemories("But seems like the universe has other plans...")
                            setTimeout(() => {
                                TypeMemories("Oh well...")
                                setTimeout(() => {
                                    TypeMemories("HAPPY VALENTINES DAY!!!")
                                    setTimeout(() => {
                                        TypeMemories("Im not really good at writing long letters...")
                                        setTimeout(() => {
                                            TypeMemories("But i know how to code!")
                                            setTimeout(() => {
                                                TypeMemories("So *this* is my letter to you!")
                                                setTimeout(() => {
                                                    Phase2()
                                                }, 5100)
                                            }, 5100)
                                        }, 6100)
                                    }, 5100)
                                }, 5100)
                            }, 6100)
                        }, 5100)
                    }, 3100)
                }, 5100)
            }, 3100)
        }, 4100); // 2000 milliseconds = 2 seconds
    }
}

