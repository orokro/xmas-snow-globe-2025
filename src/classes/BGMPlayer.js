/*
	BGMPlayer.js
	------------
	A robust audio state machine.
	Handles fading, track switching, volume, and muting.
	Fixed: Prevents "Zombie" tracks from triggering state changes during interruptions.
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

	/**
	 * Main State: PLAY BGM
	 * Smoothly crossfades back to BGM.
	 */
	playBGM() {
		if(!this.initialized) return;

		if (this.bgm.paused) {
			this.bgm.volume = 0;
			this.bgm.play().catch(e => console.warn("Audio play blocked", e));
		}

		// Smooth return: Crossfade over 1.5 seconds
		this.crossFade(this.gatcha, this.bgm, 1500);
	}

	/**
	 * Main State: PLAY GATCHA
	 * 1. Fades out BGM completely.
	 * 2. Then starts Gatcha at full volume (Hard Cut).
	 */
	playGatchaTheme() {
		if(!this.initialized) return;

		// --- CRITICAL FIX ---
		// If we interrupt a transition where Gatcha was playing (or fading out),
		// we must STOP it immediately. If we don't, it might finish playing
		// in the background, trigger 'onended', and call playBGM(),
		// cancelling this new pull sequence.
		this.gatcha.pause();
		this.gatcha.currentTime = 0;
		this.gatcha.onended = null; // Clear old triggers
		// --------------------

		// 1. Fade out BGM (1000ms)
		this.fadeOut(this.bgm, 1000, () => {

			// 2. Start Gatcha IMMEDIATELY at full volume
			this.gatcha.currentTime = 0;
			this.gatcha.volume = this.isMuted ? 0 : this.masterVolume;
			this.gatcha.play().catch(e => console.warn("Audio play blocked", e));

			// 3. Queue the return trip
			this.gatcha.onended = () => {
				this.playBGM();
			};
		});
	}

	setGatchaTrack(url) {
		const wasPlaying = !this.gatcha.paused;
		this.gatcha.pause();
		this.gatcha.src = url;
		this.gatcha.load();
		if(wasPlaying) this.gatcha.play();
	}

	/**
	 * Helper: Fades a single track out to 0, then pauses it.
	 * SNAPSHOTS startVolume to allow smooth mid-fade reversals.
	 */
	fadeOut(track, duration, onComplete) {
		if(this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
		this.isFading = true;
		const startTime = performance.now();

		// SNAPSHOT: Capture current volume.
		// If BGM is fading in (e.g. at 0.4), we fade 0.4 -> 0 over the full duration.
		const startVolume = track.volume;

		const loop = (now) => {
			const elapsed = now - startTime;
			const progress = Math.max(0, Math.min(1, elapsed / duration));

			// Linear Fade from Snapshot -> 0
			track.volume = Math.max(0, startVolume * (1 - progress));

			if (progress < 1) {
				this.fadeRaf = requestAnimationFrame(loop);
			} else {
				this.isFading = false;
				this.fadeRaf = null;
				track.pause();
				track.currentTime = 0;
				if(onComplete) onComplete();
			}
		};
		this.fadeRaf = requestAnimationFrame(loop);
	}

	/**
	 * Helper: Fades one track out while fading another in.
	 */
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

	playSFX(sound) {
		if (this.isMuted) return;

		let audio = sound;
		if (typeof sound === 'string') {
			audio = new Audio(sound);
		}

		audio.currentTime = 0;
		audio.volume = this.masterVolume;
		audio.play().catch(e => console.warn("SFX blocked", e));
	}
}

export default BGMPlayer;