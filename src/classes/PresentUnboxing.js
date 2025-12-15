/*
	PresentUnboxing.js
*/
import * as THREE from 'three';
import RaycasterManager from './RaycasterManager';

class PresentUnboxing {

	// Update Constructor
	constructor(presentObjects, scene, bgmPlayer, onComplete) {
		this.threeScene = scene;
		this.presentObjs = presentObjects;
		this.bgmPlayer = bgmPlayer; // Save it
		this.onComplete = onComplete;

		this.currentStep = 0;
		this.isAnimating = false;

		// We still create these for reuse, but we play them via BGMPlayer
		this.unwrappingSound = new Audio('assets/sfx/unwrap.mp3');
		this.gatchaWoosh = new Audio('assets/sfx/gatcha_woosh.mp3');

		this.steps = [
			{ key: 'Bow_Off', duration: 0.6 },
			{ key: ['Ribbon_A_1', 'Ribbon_A_2'], duration: [0.3, 0.5], sequential: true },
			{ key: ['Ribbon_B_1', 'Ribbon_B_2'], duration: [0.3, 0.5], sequential: true },
			{ key: 'Lid_Off', duration: 0.7 },
			{ key: 'Box_Off', duration: 0.7 }
		];
		this.buildPresentRaycaster();
	}

	// ... [Keep buildPresentRaycaster as is] ...
	buildPresentRaycaster() {
		this.raycaster = new RaycasterManager(this.threeScene);
		const filter = [this.threeScene.$('#GiftBox')];
		this.raycaster.setFilter(filter);

		this.raycaster.onHit((hit) => {
			let objectName = hit.object.userData.name;
			while (!objectName) {
				hit.object = hit.object.parent;
				objectName = hit.object.userData.name;
				if (!hit.object.parent) break;
			}
			if (objectName) {
				objectName = objectName.split(' ')[0].replace('#', '').toLowerCase();
				if (objectName === 'giftbox') this.nextStep();
			}
		});
	}

	nextStep() {
		if (this.isAnimating || this.currentStep >= this.steps.length) return;
		this.isAnimating = true;

		if (this.currentStep === this.steps.length - 1) {
			this.zoomIn(1, () => { });
		}

		// USE BGM PLAYER FOR SFX
		if (this.bgmPlayer) {
			this.bgmPlayer.playSFX(this.unwrappingSound);
		}

		const step = this.steps[this.currentStep];
		// ... [Rest of logic is the same, pasting for completeness] ...
		const animateSequentially = (index) => {
			const key = step.key[index];
			const duration = step.duration[index] * 1000;
			let startTime = Date.now();
			const animate = () => {
				const elapsedTime = Date.now() - startTime;
				const progress = Math.min(elapsedTime / duration, 1);
				this.presentObjs.forEach((obj) => {
					const morphTargetIndex = obj.morphTargetDictionary[key];
					if (morphTargetIndex !== undefined) {
						obj.morphTargetInfluences[morphTargetIndex] = progress;
					}
				});
				if (progress < 1) {
					requestAnimationFrame(animate);
				} else if (index + 1 < step.key.length) {
					animateSequentially(index + 1);
				} else {
					this.isAnimating = false;
					this.currentStep++;
					if (this.currentStep === this.steps.length) {
						if (this.onComplete) this.onComplete();
					}
				}
			};
			animate();
		};

		if (step.sequential) {
			animateSequentially(0);
		} else {
			const keys = Array.isArray(step.key) ? step.key : [step.key];
			const duration = Array.isArray(step.duration) ? step.duration[0] * 1000 : step.duration * 1000;
			let startTime = Date.now();
			const animate = () => {
				const elapsedTime = Date.now() - startTime;
				const progress = Math.min(elapsedTime / duration, 1);
				keys.forEach((key, idx) => {
					this.presentObjs.forEach((obj) => {
						const morphTargetIndex = obj.morphTargetDictionary[key];
						if (morphTargetIndex !== undefined) {
							obj.morphTargetInfluences[morphTargetIndex] = progress;
						}
					});
				});
				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					this.isAnimating = false;
					this.currentStep++;
					if (this.currentStep === this.steps.length) {
						if (this.onComplete) this.onComplete();
					}
				}
			};
			animate();
		}
	}

	// [Add destroy method]
	destroy() {
		if (this.raycaster) {
			this.raycaster.destroy();
			this.raycaster = null;
		}
	}

	reset() {
		this.currentStep = 0;
		this.isAnimating = false;
		// this.presentObj... (Check your original code, this line looked suspicious in source but leaving as is)
	}

	zoomIn(duration, onComplete) {
		// USE BGM PLAYER
		if (this.bgmPlayer) {
			this.bgmPlayer.playSFX(this.gatchaWoosh);
		}

		// ... [Rest of zoom logic] ...
		const startZoom = this.threeScene.camera.zoom;
		const endZoom = startZoom * 2;
		const startTime = Date.now();

		const animateZoom = () => {
			const currentTime = Date.now();
			const elapsed = currentTime - startTime;
			if (elapsed < duration * 1000) {
				const t = THREE.MathUtils.smoothstep((elapsed / (duration * 1000)), 0, 1);
				let zoom = startZoom + (endZoom - startZoom) * (t);
				this.threeScene.camera.zoom = zoom;
				this.threeScene.camera.updateProjectionMatrix();
				this.threeScene.controls.update();
				requestAnimationFrame(animateZoom);
			} else {
				this.threeScene.camera.zoom = endZoom;
				this.threeScene.camera.updateProjectionMatrix();
				this.threeScene.controls.update();
				if (onComplete) onComplete();
			}
		};
		requestAnimationFrame(animateZoom);
	}
}
export default PresentUnboxing;