// Sound Manager using Web Audio API
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.hapticsEnabled = true; // Most mobile browsers support this
        this.updateUI();
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;

        // Ensure context is running (fixes browsers blocking audio)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);

        // Visual Reaction
        this.animateMascot();
    }

    animateMascot() {
        const mascot = document.querySelector('.monster-svg');
        if (mascot) {
            mascot.classList.remove('pulse');
            void mascot.offsetWidth; // Force reflow
            mascot.classList.add('pulse');
        }
    }

    playClick() { this.playTone(400, 'sine', 0.1, 0.1); }
    playSuccess() {
        this.playTone(523.25, 'sine', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
    }
    playPop() { this.playTone(800, 'sine', 0.05, 0.05); }

    playWelcome() {
        // Advanced Melodic Instrumental Sequence (4-bar arpeggio)
        const timeline = [
            { freq: 440, time: 0, type: 'triangle' },
            { freq: 554.37, time: 150, type: 'triangle' },
            { freq: 659.25, time: 300, type: 'triangle' },
            { freq: 880, time: 450, type: 'sine' },
            { freq: 659.25, time: 750, type: 'triangle' },
            { freq: 554.37, time: 900, type: 'triangle' },
            { freq: 440, time: 1050, type: 'triangle' }
        ];
        timeline.forEach(note => {
            setTimeout(() => this.playTone(note.freq, note.type, 0.5, 0.08), note.time);
        });
    }

    playTry() {
        // Bouncy percussive sound
        this.playTone(300, 'square', 0.05, 0.05);
        setTimeout(() => this.playTone(450, 'square', 0.1, 0.05), 50);
    }

    playYay() {
        // Triumphant cheer chord
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 major
        notes.forEach(freq => this.playTone(freq, 'sine', 0.6, 0.05));
    }

    playMelodious() {
        // Soft harmonic pair
        this.playTone(523.25, 'sine', 0.2, 0.03); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.03), 50); // E5
    }

    toggle() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        this.updateUI();
    }

    vibrate(pattern) {
        if (this.hapticsEnabled && window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    }

    animateMascot(emotion = 'happy') {
        const mascots = document.querySelectorAll('.monster-svg');
        const containers = document.querySelectorAll('.mascot-container');

        mascots.forEach(mascot => {
            mascot.classList.remove('pulse');
            void mascot.offsetWidth;
            mascot.classList.add('pulse');
        });

        containers.forEach(container => {
            container.classList.remove('face-happy', 'face-silly', 'face-surprised', 'face-scared');
            container.classList.add(`face-${emotion}`);
        });
    }

    updateUI() {
        const btn = document.getElementById('sound-toggle');
        const icon = btn.querySelector('.sound-icon');
        if (this.enabled) {
            btn.classList.remove('muted');
            icon.textContent = '🔊';
        } else {
            btn.classList.add('muted');
            icon.textContent = '🔇';
        }
    }
}

const soundManager = new SoundManager();

const punishments = {
    // ... existing punishments ...
    kids: [
        "Do 10 frog jumps 🐸",
        "Spin in circles 5 times 🌀",
        "Waddle like a duck for 10 seconds 🦆",
        "Touch your nose with your tongue 👅",
        "Do your best robot dance 🤖",
        "Hop on one foot 15 times 🦩",
        "Make a funny face for a photo 🤪",
        "Sing 'Happy Birthday' in a squeaky voice 🎂",
        "Try to balance a spoon on your nose 🥄",
        "Clap your hands behind your back 10 times 👏"
    ],
    family: [
        "Dance with no music for 30 seconds 💃",
        "Tell a joke that makes everyone laugh 😂",
        "Sing a song loudly until someone stops you 🎤",
        "Act like a gorilla for 20 seconds 🦍",
        "Talk in an accent for the next 2 minutes 🗣️",
        "Do 10 pushups or 20 jumping jacks 🤸",
        "Give everyone in the room a high-five 🖐️",
        "Balance on one leg for 20 seconds 🧘",
        "Crawl like a baby across the room 👶",
        "Do your best impression of another person here 🎭"
    ]
};

let currentMode = 'kids';
let history = [];

// Screen Navigation
function showScreen(screenId) {
    soundManager.playClick();
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Mode Selection
function selectMode(mode) {
    currentMode = mode;

    // Thematic Shift
    if (mode === 'family') {
        document.body.classList.add('family-theme');
    } else {
        document.body.classList.remove('family-theme');
    }

    showScreen('main-screen');
    // Update small mascot based on mode
    const smallMascot = document.querySelector('.small-monster');
    smallMascot.textContent = mode === 'kids' ? '🧸' : '👨‍👩‍👧';

    soundManager.vibrate(20);
}

let timerInterval;

// Generate Punishment
function generatePunishment() {
    const list = punishments[currentMode];
    const randomIndex = Math.floor(Math.random() * list.length);
    const punishment = list[randomIndex];

    // Update UI
    document.getElementById('punishment-text').textContent = punishment;

    // Add to History
    history.unshift(punishment);
    if (history.length > 20) history.pop();
    updateHistoryUI();

    // Reset and Start Timer
    startTimer(15);

    // Show Screen
    showScreen('result-screen');

    // Trigger Confetti
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF87B2', '#FF5E99', '#6EB9F7', '#FFD93D', '#FF9F43']
    });
    // Mascot Reaction
    const emotions = ['silly', 'surprised', 'scared'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    soundManager.animateMascot(randomEmotion);

    // Haptics
    soundManager.vibrate([50, 30, 50]);
    soundManager.playSuccess();
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    let timeLeft = seconds;
    const timerText = document.getElementById('timer-text');
    timerText.textContent = `${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerText.textContent = "Time's Up! 📢";
            timerText.style.color = "#FF87B2";
        } else {
            timerText.style.color = "white";
        }
    }, 1000);
}

// Update History UI
function updateHistoryUI() {
    const listContainer = document.getElementById('history-list');
    listContainer.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item;
        listContainer.appendChild(div);
    });

    if (history.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888;">No punishments yet!</p>';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-btn').addEventListener('click', () => {
        soundManager.playWelcome(); // Play music on interaction
        showScreen('mode-screen');
    });

    document.getElementById('generate-btn').addEventListener('click', () => {
        generatePunishment();
    });

    document.getElementById('try-another-btn').addEventListener('click', () => {
        soundManager.playTry();
        generatePunishment();
    });

    document.getElementById('done-btn').addEventListener('click', () => {
        soundManager.playYay();
        showScreen('main-screen');
    });

    document.getElementById('sound-toggle').addEventListener('click', () => {
        soundManager.toggle();
    });

    // Creative Sparkle System
    function createSparkle(x, y, isTrail = false) {
        const container = document.getElementById('sparkle-container');
        if (!container) return;
        const count = isTrail ? 1 : 12;
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            if (!isTrail) sparkle.innerHTML = '✨';
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;

            const angle = Math.random() * Math.PI * 2;
            const velocity = isTrail ? (Math.random() * 20 + 10) : (Math.random() * 100 + 50);
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            sparkle.animate([
                { transform: 'translate(0, 0) scale(1) rotate(0)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: isTrail ? 600 : 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)',
                fill: 'forwards'
            });

            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
    }

    // Interactive Background Blobs and Creative Dust
    document.addEventListener('mousemove', (e) => {
        // Dust Trail
        if (Math.random() > 0.85) {
            createSparkle(e.clientX, e.clientY, true);
        }

        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const blobs = document.querySelectorAll('.blob');
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (x - 0.5) * speed;
            const yOffset = (y - 0.5) * speed;
            blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });

    // Global Interaction (Resume Audio, Haptics & Burst Sparkles)
    document.addEventListener('mousedown', (e) => {
        if (soundManager.ctx.state === 'suspended') {
            soundManager.ctx.resume();
        }
        soundManager.vibrate(10);
        createSparkle(e.clientX, e.clientY);
        soundManager.playMelodious();
    }, true);

    // Default History Message
    updateHistoryUI();
});
