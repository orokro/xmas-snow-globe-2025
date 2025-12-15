/*
	Game.js
	-------
	This is the main file that provides a class for controlling our game.
	Now supports URL Query Params (e.g. ?year=2024).
*/

// vue
import { ref, shallowRef, computed } from 'vue';

// app imports
import ThreeScene from './ThreeScene';
import RaycasterManager from './RaycasterManager';
import ToastManager from './ToastManager';
import PresentUnboxing from './PresentUnboxing';
import CapsuleAnimator from './CapsuleAnimator';
import PullCameraAnimator from './PullCameraAnimator';
// import our data
import { levels } from './Data';

// main export
export class Game {

	// some static constants for game state & modes
	static MODE = {
		LOADING: 0,
		UNPACKING: 10,
		PLAYING: 20,
	};
	static MENU = {
		CATS: 0,
		GATCHA: 10,
	};


	/**
	 *
	 * @param {ThreeScene} scene - reference to the ThreeJS scene
	 * @param {ToastManager} toastManager - reference to the ToastManager
	 * @param {ModalManager} modalManager - reference to the ModalManager
	 * @param {BGMPlayer} bgmPlayer - reference to the BGMPlayer
	 */
	constructor(scene, toastManager, modalManager, bgmPlayer) {

		// save our scene & state managers
		this.scene = scene;
		this.toastManager = toastManager;
		this.modalManager = modalManager;
		this.bgmPlayer = bgmPlayer;

		// load some sfx for the game
		this.heySound = new Audio('assets/sfx/hey.mp3');
		this.yaySound = new Audio('assets/sfx/yay.mp3');
		this.gatchaWoosh = new Audio('assets/sfx/gatcha_woosh.mp3');
		this.woosh = new Audio('assets/sfx/unwrap.mp3');

		// true until scene is ready
		this.mode = ref(Game.MODE.LOADING);

		// arrays of which cats we've & which gatcha quotes we've seen
		this.foundCats = shallowRef([]);
		this.gatchaQuotesSeen = shallowRef([]);

		// true if one of our menus is open
		this.catsMenuOpen = ref(false);
		this.gatchaMenuOpen = ref(false);

		// true when all cats / gatcha quotes have been found
		this.allCatsFound = ref(false);
		this.allGatchaQuotesFound = ref(false);

		// counters
		this.catsMenuCount = ref(0);
		this.gatchaMenuCount = ref(0);

		// the number of pulls the user has unlocked
		this.gatchaPulls = ref(0);
		this.gatchaUnlocked = ref(false);

		// true when we're doing a gatcha pull
		this.doingPull = ref(false);
		this.hideUI = ref(false);

		// animation flags
		this.doingPullCameraAnimation = ref(false);
		this.doingCapsuleAnimation = ref(false);

		// the picked quote
		this.pickedQuote = shallowRef(null);


		// --- NEW: URL PARAMETER LOGIC ---

		// 1. Parse URL for ?year=XXXX
		const urlParams = new URLSearchParams(window.location.search);
		const requestedYear = urlParams.get('year');

		// 2. Default to '2025'
		let initialYear = '2025';

		// 3. If requested year exists in our data, use it
		if (requestedYear && levels[requestedYear]) {
			initialYear = requestedYear;
		}

		// Set the state
		this.currentLevelKey = ref(initialYear);
		this.currentLevelData = computed(() => levels[this.currentLevelKey.value]);
		this.isTransitioning = ref(false);

		// Load initial level
		this.loadLevel(this.currentLevelKey.value);
	}


	/**
	 * Loads a specific level's model and sets up the scene
	 */
	async loadLevel(yearKey) {

		// If we are currently in LOADING mode, this is the first load.
		const isFirstLoad = this.mode.value === Game.MODE.LOADING;

		this.currentLevelKey.value = yearKey;
		const levelData = levels[yearKey];

		// Update Audio
		if (this.bgmPlayer && levelData.pullMusic) {
			this.bgmPlayer.setGatchaTrack(`assets/sfx/${levelData.pullMusic}`);
		}

		// 2. NEW: Setup Background Music
		if (this.bgmPlayer && levelData.bgmMusic) {
			this.bgmPlayer.setBGMTrack(`assets/sfx/${levelData.bgmMusic}`);
		}

		// Init Data
		this.initGameData(levelData);

		// Load Model
		await this.scene.loadLevel(levelData.model);

		// Start Game
		this.beginGame(!isFirstLoad);
	}

	/**
	 * Called by UI to switch levels
	 */
	switchLevel(targetYear) {
		if (this.isTransitioning.value) return;
		if (targetYear === this.currentLevelKey.value) return;

		this.isTransitioning.value = true;

		// Optional: Update the URL without reloading page so sharing works
		const newUrl = new URL(window.location);
		newUrl.searchParams.set('year', targetYear);
		window.history.pushState({}, '', newUrl);

		setTimeout(async () => {
			await this.loadLevel(targetYear);
			setTimeout(() => {
				this.isTransitioning.value = false;
			}, 500);
		}, 1000);
	}


	initGameData(levelData) {
		// Reset counters
		this.foundCats.value = levelData.cats.map((cat, i) => ({
			...cat,
			id: `cat_${i}`,
			found: false,
		}));

		// Reset quotes
		let quotes = levelData.quotes.map((quote, i) => ({
			...quote,
			id: `quote_${i}`,
			found: false,
		}));
		quotes = quotes.sort(() => Math.random() - 0.5);
		this.gatchaQuotesSeen.value = quotes;

		// Reset flags
		this.allCatsFound.value = false;
		this.allGatchaQuotesFound.value = false;
		this.catsMenuCount.value = 0;
		this.gatchaMenuCount.value = 0;
		this.gatchaPulls.value = 0;
		this.gatchaUnlocked.value = false;
		this.doingPull.value = false;
	}

	/**
	 * This will play one of the sounds we build in the constructor
	 */
	playSound(sound) {
		if (this.bgmPlayer) {
			this.bgmPlayer.playSFX(sound);
		}
	}


	/**
	 * Sets up the game state after the scene is loaded.
	 */
	beginGame(skipUnboxing = false) {

		// 1. CLEANUP: Destroy old present raycaster
		if (this.presentUnboxing) {
			this.presentUnboxing.destroy();
			this.presentUnboxing = null;
		}

		// 2. CLEANUP: Destroy old cat raycaster
		this.buildKittehRaycaster();

		// 3. Re-initialize Animators
		// Ensure your new model has .f_targ target objects!
		this.pullCameraAnimator = new PullCameraAnimator(
			this.scene.pullCamera,
			this.scene.$('.f_targ'),
			levels[this.currentLevelKey.value].pullCount,
			0.75, 1.2
		);

		const capsuleObj = this.scene.$('#Capsule');
		if (capsuleObj) {
			this.capsuleAnimator = new CapsuleAnimator(
				capsuleObj.children,
				this.scene,
				() => { }
			);
		}

		// --- BRANCHING LOGIC ---

		if (skipUnboxing) {
			// == INSTANT PLAY ==
			console.log("Skipping Unboxing");
			this.mode.value = Game.MODE.PLAYING;

			const giftBox = this.scene.$('#GiftBox');
			if (giftBox) giftBox.visible = false;

			if (this.scene.particleSystem) {
				this.scene.particleSystem.stirUpParticles(0.5);
			}

		} else {
			// == FIRST LOAD ==
			console.log("First Load Unboxing");
			this.mode.value = Game.MODE.UNPACKING;

			const giftBox = this.scene.$('#GiftBox');
			if (giftBox) {
				giftBox.visible = true;
				// Pass BGMPlayer to Unboxing
				this.presentUnboxing = new PresentUnboxing(giftBox.children, this.scene, this.bgmPlayer, () => {
					this.mode.value = Game.MODE.PLAYING;
					this.scene.particleSystem.stirUpParticles(.2);
					giftBox.visible = false;
					this.playSound(this.heySound);
					this.modalManager.showModal('Find some hidden kitties!', 'Hey You!');
				});
			} else {
				console.warn("No #GiftBox found.");
				this.mode.value = Game.MODE.PLAYING;
			}

			this.playSound(this.heySound);
			this.modalManager.showModal('Click the present to unwrap it!', 'Hey You!');
		}

		// Unlock UI
		this.isTransitioning.value = false;
	}


	/**
	 * Build a ray caster that responds to hidden kittehs
	 */
	buildKittehRaycaster() {
		if (this.catRaycaster) {
			this.catRaycaster.destroy();
		}

		this.catRaycaster = new RaycasterManager(this.scene);
		const filter = [
			...this.scene.$('.cat'),
		];
		this.catRaycaster.setFilter(filter);

		this.catRaycaster.onHit((hit) => {
			if (this.mode.value !== Game.MODE.PLAYING) return;

			let catObjectName = hit.object.userData.name;
			while (!catObjectName) {
				hit.object = hit.object.parent;
				catObjectName = hit.object.userData.name;
				if (!hit.object.parent) break;
			}

			if (catObjectName) {
				catObjectName = catObjectName.split(' ')[0].replace('#', '').toLowerCase();
				const currentLevelCats = this.currentLevelData.value.cats;

				if (currentLevelCats.find(cat => cat.object.toLowerCase() === catObjectName)) {
					this.findCat(catObjectName);
				}
			}
		});
	}


	/**
	 * Shows or toggles one of our game menus
	 */
	showMenu(menu) {
		this.playSound(this.woosh);
		if (menu === Game.MENU.CATS && this.catsMenuOpen.value) {
			this.catsMenuOpen.value = false;
			return;
		}
		if (menu === Game.MENU.GATCHA && this.gatchaMenuOpen.value) {
			this.gatchaMenuOpen.value = false;
			return;
		}
		if (this.catsMenuOpen.value || this.gatchaMenuOpen.value) {
			this.catsMenuOpen.value = false;
			this.gatchaMenuOpen.value = false;
		}

		if (menu === Game.MENU.CATS) {
			this.catsMenuOpen.value = true;
			this.catsMenuCount.value = 0;
		}
		else if (menu === Game.MENU.GATCHA) {
			this.gatchaMenuOpen.value = true;
			this.gatchaMenuCount.value = 0;
		}
	}


	/**
	 * This function will be called when the user clicks on a cat in the scene.
	 */
	findCat(catObjectName) {
		catObjectName = catObjectName.split(' ')[0].replace('#', '').toLowerCase();
		const foundCats = this.foundCats.value;
		const foundCat = foundCats.find(cat => cat.object.toLowerCase() === catObjectName);

		if (foundCat.found) return;

		foundCat.found = true;
		this.foundCats.value = [...foundCats]; // trigger reactivity
		this.allCatsFound.value = foundCats.every(cat => cat.found);

		if (this.catsMenuOpen.value === false)
			this.catsMenuCount.value++;

		// Use helper for SFX
		this.playSound('assets/sfx/meow.mp3');

		// Logic for adding pulls
		const totalQuotes = levels[this.currentLevelKey.value].quotes.length;
		let pullsToAdd = Math.floor(totalQuotes / 12);
		this.gatchaPulls.value += pullsToAdd;

		this.gatchaUnlocked.value = true;

		if (this.allCatsFound.value) {
			this.playSound(this.yaySound);
			this.modalManager.showModal('You found all the kittehs!', 'Congratulations!');

			const quotes = this.gatchaQuotesSeen.value;
			const unseenQuotes = quotes.filter(quote => !quote.found);
			pullsToAdd = unseenQuotes.length - this.gatchaPulls.value;
			if (unseenQuotes.length > this.gatchaPulls.value)
				this.gatchaPulls.value = unseenQuotes.length;
		}

		this.toastManager.showToastMsg(`You found ${foundCat.name} Kitteh!`, `+${pullsToAdd} Gatcha Pulls!`);

		if (this.allGatchaQuotesFound.value) {
			this.gatchaPulls.value = 0;
		}
	}


	/**
	 * Starts gatcha pull animate sequence
	 */
	doPull() {
		if (this.gatchaPulls.value < 1) return;
		if (this.doingPull.value) return;

		this.playSound(this.gatchaWoosh);
		this.gatchaPulls.value--;
		this.doingPull.value = true;

		setTimeout(() => {
			this.bgmPlayer.playGatchaTheme();
		}, 750);

		setTimeout(() => {
			this.hideUI.value = true;
		}, 1000);

		setTimeout(() => {
			this.doingPullCameraAnimation.value = true;
			this.scene.setCamera(this.scene.pullCamera);
			this.pullCameraAnimator.start(() => {

				this.doingPullCameraAnimation.value = false;
				this.scene.setCamera(this.scene.capsuleCamera);

				this.doingCapsuleAnimation.value = true;
				this.capsuleAnimator.start(() => {
					this.doingCapsuleAnimation.value = false;
					this.pickRandomQuote();
				});
			});

		}, 1400);
	}


	/**
	 * Picks a random quote from the gatchaQuotesSeen array
	 */
	pickRandomQuote() {
		const quotes = this.gatchaQuotesSeen.value;
		let quote = quotes.find(quote => quote.force_first && !quote.found);

		if (!quote) {
			const unseenQuotes = quotes.filter(quote => !quote.found);
			quote = unseenQuotes[Math.floor(Math.random() * unseenQuotes.length)];
		}

		if (quote) {
			quote.found = true;
			this.gatchaQuotesSeen.value = [...quotes]; // trigger reactivity
			this.pickedQuote.value = quote;

			if (this.gatchaMenuOpen.value === false)
				this.gatchaMenuCount.value++;

			this.allGatchaQuotesFound.value = quotes.every(quote => quote.found);

			if (this.allGatchaQuotesFound.value) {
				this.playSound(this.yaySound);
				this.modalManager.showModal('You found all the quotes!', 'Congratulations!');
				this.gatchaPulls.value = 0;
			}
		}
	}


	/**
	 * Completes the gatcha pull sequence & closes the UI / resets variables
	 */
	completePull() {
		this.capsuleAnimator.resetAnimations();
		this.doingPull.value = false;
		this.hideUI.value = false;
		this.scene.setCamera(this.scene.camera);
		this.pickedQuote.value = null;
	}
}