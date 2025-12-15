/*
	BGMPlayer.js
	------------
	A robust audio state machine.
	Handles fading, track switching, volume, and muting with zero overlap tolerance.
	Self-drives animation frames to ensure music always plays.
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
		this.fadeRaf = null; // Request Animation Frame ID
		this.isFading = false;

		// -- Setup --
		// Wait for first interaction to unlock AudioContext
		window.addEventListener('click', () => {
			if (!this.initialized) {
				this.initialized = true;
				this.playBGM();
			}
		}, { once: true });
	}

	/**
	 * Main State: PLAY BGM
	 * Fades out Gatcha (if playing), Fades in BGM.
	 */
	playBGM() {
		if(!this.initialized) return;

		// Ensure BGM is ready to play
		if (this.bgm.paused) {
			this.bgm.volume = 0;
			this.bgm.play().catch(e => console.warn("Audio play blocked", e));
		}

		// Crossfade: Gatcha -> BGM
		this.crossFade(this.gatcha, this.bgm, 1000);
	}

	/**
	 * Main State: PLAY GATCHA
	 * Fades out BGM, Fades in Gatcha.
	 * Auto-returns to BGM when done.
	 */
	playGatchaTheme() {
		if(!this.initialized) return;

		// 1. Reset Gatcha to start
		this.gatcha.currentTime = 0;
		this.gatcha.volume = 0;
		this.gatcha.play().catch(e => console.warn("Audio play blocked", e));

		// 2. Crossfade: BGM -> Gatcha
		this.crossFade(this.bgm, this.gatcha, 1000);

		// 3. Auto-return logic
		this.gatcha.onended = () => {
			this.playBGM();
		};
	}

	/**
	 * Swaps the Gatcha audio source safely (for Level Switching)
	 */
	setGatchaTrack(url) {
		const wasPlaying = !this.gatcha.paused;

		this.gatcha.pause();
		this.gatcha.src = url;
		this.gatcha.load();

		if(wasPlaying) {
			this.gatcha.play();
		}
	}

	/**
	 * Robust Crossfader using requestAnimationFrame
	 */
	crossFade(fadeOutTrack, fadeInTrack, duration) {

		// 1. Kill any existing fade immediately
		if(this.fadeRaf) {
			cancelAnimationFrame(this.fadeRaf);
		}
		this.isFading = true;

		// 2. Setup timing
		const startTime = performance.now();

		// 3. The Loop
		const loop = (now) => {
			const elapsed = now - startTime;

			// FIX: Clamp progress between 0 and 1 strictly
			// This prevents negative values if 'now' jitters behind 'startTime'
			const progress = Math.max(0, Math.min(1, elapsed / duration));

			// Calculate Target Volumes based on Master Setting
			const effectiveVolume = this.isMuted ? 0 : this.masterVolume;

			// Fade Out goes from Current -> 0
			// Fade In goes from Current -> effectiveVolume
			fadeOutTrack.volume = Math.max(0, (1 - progress) * effectiveVolume);
			fadeInTrack.volume = Math.min(effectiveVolume, progress * effectiveVolume);

			if (progress < 1) {
				// Keep fading
				this.fadeRaf = requestAnimationFrame(loop);
			} else {
				// Done!
				this.isFading = false;
				this.fadeRaf = null;

				// Cleanup the outgoing track
				fadeOutTrack.pause();
				fadeOutTrack.currentTime = 0;

				// Snap final volume just to be safe
				fadeInTrack.volume = effectiveVolume;
			}
		};

		// Kickoff
		this.fadeRaf = requestAnimationFrame(loop);
	}

	/**
	 * Sets the Master Volume (0.0 to 1.0)
	 * Instantly updates currently playing tracks if not fading.
	 */
	setVolume(val) {
		this.masterVolume = Math.max(0, Math.min(1, parseFloat(val)));

		if (!this.isFading) {
			this.applyVolume();
		}
	}

	toggleMute(shouldMute) {
		this.isMuted = shouldMute;
		if (!this.isFading) {
			this.applyVolume();
		}
	}

	/**
	 * Internal helper to re-apply volume to active tracks
	 */
	applyVolume() {
		const targetVol = this.isMuted ? 0 : this.masterVolume;

		if(!this.bgm.paused) this.bgm.volume = targetVol;
		if(!this.gatcha.paused) this.gatcha.volume = targetVol;
	}
}

export default BGMPlayer;