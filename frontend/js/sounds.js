// ============================================================
//  Mr. Banana — Sound Engine
//  Plays MP3 files from: frontend/assets/sounds/
// ============================================================

const SoundEngine = (() => {
    let muted = false;
    const BASE = 'assets/sounds/';

    const sounds = {
        flip:   new Audio(BASE + 'Flip card sound.mp3'),
        click:  new Audio(BASE + 'Button click sound.mp3'),
        hover:  new Audio(BASE + 'hover sound.mp3'),
        tick:   new Audio(BASE + 'Time Ticking Sound.mp3'),
    };

    // Set volume levels
    sounds.flip.volume  = 1.0;
    sounds.click.volume = 0.8;
    sounds.hover.volume = 0.5;
    sounds.tick.volume  = 0.6;
    sounds.tick.loop    = true;   // loop continuously while timer runs

    function play(key) {
        if (muted) return;
        const audio = sounds[key];
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    return {
        flip:      () => play('flip'),
        click:     () => play('click'),
        hover:     () => play('hover'),
        tickStart: () => {
            if (muted) return;
            sounds.tick.currentTime = 0;
            sounds.tick.play().catch(() => {});
        },
        tickStop: () => {
            sounds.tick.pause();
            sounds.tick.currentTime = 0;
        },
        toggleMute: () => {
            muted = !muted;
            // Mute/unmute the looping tick in real-time
            sounds.tick.muted = muted;
            return muted;
        },
        isMuted: () => muted,
    };
})();
