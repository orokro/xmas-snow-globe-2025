/*
	BGMPlayer.js
	------------
	A robust audio state machine.
	Handles fading, track switching, volume, and muting.
	Fixed: setGatchaTrack now correctly resets audio state to BGM during level transitions.
	Fixed: crossFade now uses snapshots to prevent volume dips if called while already playing.
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
	 * Safe to call repeatedly - will just continue fading to BGM.
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

		// Stop any lingering Gacha
		this.gatcha.pause();
		this.gatcha.currentTime = 0;
		this.gatcha.onended = null;

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


	/**
	 * Swaps the BGM audio source safely.
     * Checks if the URL is actually new before reloading to prevent restart on re-load.
	 */
	setBGMTrack(url) {
		// 1. Safety Check: Don't reload if it's already the active track
		// (this.bgm.src is absolute, url is relative, so we check inclusion)
		if (this.bgm.src.includes(url)) return;

		const wasPlaying = !this.bgm.paused;

		this.bgm.pause();
		this.bgm.src = url;
		this.bgm.load();

		if(wasPlaying) {
			this.bgm.play().catch(e => console.warn('BGM update blocked', e));
		}
	}

	/**
	 * Swaps the Gatcha audio source safely (for Level Switching)
	 * AND ensures we return to BGM state immediately.
	 */
	setGatchaTrack(url) {
		// 1. Kill any active Gacha playback or callbacks
		this.gatcha.pause();
		this.gatcha.currentTime = 0;
		this.gatcha.onended = null;

		// 2. Load the new track
		this.gatcha.src = url;
		this.gatcha.load();

		// 3. Force return to BGM
		// If BGM is already playing, this will smoothly ensure it stays that way.
		// If Gacha WAS playing (the bug), this kills it and crossfades to BGM.
		this.playBGM();
	}

	/**
	 * Helper: Fades a single track out to 0, then pauses it.
	 */
	fadeOut(track, duration, onComplete) {
		if(this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
		this.isFading = true;
		const startTime = performance.now();

		// SNAPSHOT
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
	 * Now uses SNAPSHOTS (Lerp) so it handles existing volume levels gracefully.
	 */
	crossFade(fadeOutTrack, fadeInTrack, duration) {
		if(this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
		this.isFading = true;
		const startTime = performance.now();

		// SNAPSHOTS
		const startVolOut = fadeOutTrack.volume;
		const startVolIn = fadeInTrack.volume;

		const loop = (now) => {
			const elapsed = now - startTime;
			const progress = Math.max(0, Math.min(1, elapsed / duration));
			const targetMaster = this.isMuted ? 0 : this.masterVolume;

			// Lerp Out: Start -> 0
			fadeOutTrack.volume = Math.max(0, startVolOut * (1 - progress));

			// Lerp In: Start -> TargetMaster
			fadeInTrack.volume = startVolIn + (targetMaster - startVolIn) * progress;

			if (progress < 1) {
				this.fadeRaf = requestAnimationFrame(loop);
			} else {
				this.isFading = false;
				this.fadeRaf = null;
				fadeOutTrack.pause();
				fadeOutTrack.currentTime = 0;
				// Ensure final snap is precise
				fadeInTrack.volume = targetMaster;
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