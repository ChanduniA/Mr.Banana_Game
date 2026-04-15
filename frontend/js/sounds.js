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
        tick:   new Audio(BASE + 'New Ticking Sound.mp3'),
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
        audio.play().catch(e => console.warn('[Sound] play failed for', key, e));
    }

    return {
        flip:      () => play('flip'),
        click:     () => play('click'),
        hover:     () => play('hover'),
        tickStart: () => {
            if (muted) return;
            console.log('[Sound] tickStart — playing New Ticking Sound.mp3');
            sounds.tick.currentTime = 0;
            sounds.tick.play().catch(e => console.warn('[Sound] tick failed:', e));
        },
        tickStop: () => {
            sounds.tick.pause();
            sounds.tick.currentTime = 0;
        },
        toggleMute: () => {
            muted = !muted;
            sounds.tick.muted = muted;
            return muted;
        },
        isMuted: () => muted,
    };
})();
