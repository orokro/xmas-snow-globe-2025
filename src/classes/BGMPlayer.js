/*
	BGMPlayer.js
	------------
	A robust audio state machine.
	Handles fading, track switching, volume, and muting.
	Now also handles one-shot SFX to ensure they obey volume settings.
*/

class BGMPlayer {

	constructor() {
		// -- State --
		this.masterVolume = 0.5; // Default 50%
		this.isMuted = false;
		this.initialized = false;

		// -- Tracks --
		this.bgm = new Audio('assets/sfx/zbot_theme.mp3');
		this.bgm.loop = true;

		this.gatcha = new Audio('assets/sfx/zbot_gatcha.mp3');
		this.gatcha.loop = false;

		// -- Fading State --
		this.fadeRaf = null;
		this.isFading = false;

		// -- Setup --
		window.addEventListener('click', () => {
			if (!this.initialized) {
				this.initialized = true;
				this.playBGM();
			}
		}, { once: true });
	}

	// ... [Keep playBGM, playGatchaTheme, setGatchaTrack, crossFade as they were] ...
    // (Paste the previous working versions of these methods here)

	playBGM() {
		if(!this.initialized) return;
		if (this.bgm.paused) {
			this.bgm.volume = 0;
			this.bgm.play().catch(e => console.warn("Audio play blocked", e));
		}
		this.crossFade(this.gatcha, this.bgm, 1500);
	}

	playGatchaTheme() {
		if(!this.initialized) return;
		this.gatcha.currentTime = 0;
		this.gatcha.volume = 0;
		this.gatcha.play().catch(e => console.warn("Audio play blocked", e));
		this.crossFade(this.bgm, this.gatcha, 200);
		this.gatcha.onended = () => {
			this.playBGM();
		};
	}

	setGatchaTrack(url) {
		const wasPlaying = !this.gatcha.paused;
		this.gatcha.pause();
		this.gatcha.src = url;
		this.gatcha.load();
		if(wasPlaying) this.gatcha.play();
	}

	crossFade(fadeOutTrack, fadeInTrack, duration) {
		if(this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
		this.isFading = true;
		const startTime = performance.now();

		const loop = (now) => {
			const elapsed = now - startTime;
			const progress = Math.max(0, Math.min(1, elapsed / duration));
			const effectiveVolume = this.isMuted ? 0 : this.masterVolume;

			fadeOutTrack.volume = Math.max(0, (1 - progress) * effectiveVolume);
			fadeInTrack.volume = Math.min(effectiveVolume, progress * effectiveVolume);

			if (progress < 1) {
				this.fadeRaf = requestAnimationFrame(loop);
			} else {
				this.isFading = false;
				this.fadeRaf = null;
				fadeOutTrack.pause();
				fadeOutTrack.currentTime = 0;
				fadeInTrack.volume = effectiveVolume;
			}
		};
		this.fadeRaf = requestAnimationFrame(loop);
	}

	setVolume(val) {
		this.masterVolume = Math.max(0, Math.min(1, parseFloat(val)));
		if (!this.isFading) this.applyVolume();
	}

	toggleMute(shouldMute) {
		this.isMuted = shouldMute;
		if (!this.isFading) this.applyVolume();
	}

	applyVolume() {
		const targetVol = this.isMuted ? 0 : this.masterVolume;
		if(!this.bgm.paused) this.bgm.volume = targetVol;
		if(!this.gatcha.paused) this.gatcha.volume = targetVol;
	}

	/**
	 * NEW: Centralized SFX Player
	 * Accepts either a string URL or an existing Audio object.
	 */
	playSFX(sound) {
		if (this.isMuted) return; // Silent if muted

		let audio = sound;

		// If passed a string, create a temp audio object
		if (typeof sound === 'string') {
			audio = new Audio(sound);
		}

		// Reset and Play
		audio.currentTime = 0;
		audio.volume = this.masterVolume;
		audio.play().catch(e => console.warn("SFX blocked", e));
	}
}

export default BGMPlayer;
