/*
	Game.js
	-------

	This is the main file that provides a class for controlling our game.

	This will handle all the state, including the hidden cats & gatcha pulls.
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
import { cats, gatchaQuotes, levels } from './Data';

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
	 * @param {ThreeScene} scene - reference to the ThreeJS scene that was
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

		// if we get a cat or pull, well show a number on the menu icons
		// based on how many we found since the last time they opened the menu
		this.catsMenuCount = ref(0);
		this.gatchaMenuCount = ref(0);

		// the number of pulls the user has unlocked
		this.gatchaPulls = ref(0);

		// true after we have at least one pull
		this.gatchaUnlocked = ref(false);

		// true when we're doing a gatcha pull & separate variable to hide UI during pull
		this.doingPull = ref(false);
		this.hideUI = ref(false);

		// true during pull camera animation
		this.doingPullCameraAnimation = ref(false);

		// true during capsule animation
		this.doingCapsuleAnimation = ref(false);

		// the picked quote
		this.pickedQuote = shallowRef(null);

		// // initialize our game
		// this.initGame();

		// // wait for our scene to be ready before we start the game
		// scene.ifOrWhenSceneIsReady(() => {
		// 	this.beginGame();
		// });

		// New State for Levels
		this.currentLevelKey = ref('2025'); // Default to this year
		this.currentLevelData = computed(() => levels[this.currentLevelKey.value]); // Helper

		this.isTransitioning = ref(false); // To trigger the UI overlay

		// Load initial level
		this.loadLevel(this.currentLevelKey.value);
	}


	/**
	 * Loads a specific level's model and sets up the scene
	 */
	async loadLevel(yearKey) {

		// 1. Determine if this is the very first load or a switch
		// If we haven't unlocked gatcha yet (and haven't found cats), it's likely the first load.
		// Or strictly: if we are currently in LOADING mode.
		const isFirstLoad = this.mode.value === Game.MODE.LOADING;

		this.currentLevelKey.value = yearKey;
		const levelData = levels[yearKey];

		// 2. Update BGM Player pull track
		if (this.bgmPlayer && levelData.pullMusic) {
			this.bgmPlayer.gatchaTheme = new Audio(`assets/sfx/${levelData.pullMusic}`);
		}

		// 3. Init Game Data (Found cats logic)
		this.initGameData(levelData);

		// 4. Tell Scene to Load Model (Await this!)
		await this.scene.loadLevel(levelData.model);

		// 5. Start Game Loop
		// Pass 'true' to skip unboxing if this is NOT the first load
		this.beginGame(!isFirstLoad);
	}


	/**
	 * Called by UI to switch levels
	 */
	switchLevel(targetYear) {
		if (this.isTransitioning.value) return;
		if (targetYear === this.currentLevelKey.value) return;

		this.isTransitioning.value = true;

		// Wait for the "Expand" animation to cover the screen (approx 1s)
		// In Game.js switchLevel:
		setTimeout(async () => {

			// Load the new stuff
			await this.loadLevel(targetYear);

			// Small buffer to ensure rendering is ready
			setTimeout(() => {
				// CRITICAL: This allows mouse clicks to reach the scene again
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
	 * This function will initialize the game and also reset the game if we want to play again.
	 */
	initGame() {

		// copy our raw data & add the "found" property
		this.foundCats.value = cats.map((cat, i) => {
			return {
				...cat,
				id: `cat_${i}`,
				found: false,
			};
		});

		// reset the gatcha quotes
		let quotes = gatchaQuotes.map((quote, i) => {
			return {
				...quote,
				id: `quote_${i}`,
				found: false,
			};
		});

		// scramble the quotes
		quotes = quotes.sort(() => Math.random() - 0.5);
		this.gatchaQuotesSeen.value = quotes;

		// reset these variables to defaults
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
	 *
	 * @param {Audio} sound - one of the Audio objects we built in the constructor
	 */
	playSound(sound) {

		// reset the sound and play it
		sound.currentTime = 0;
		sound.play();
	}


	/**
	 * Sets up the game state after the scene is loaded.
	 * @param {Boolean} skipUnboxing - If true, jumps straight to playing.
	 */
	beginGame(skipUnboxing = false) {

		// --- COMMON SETUP (Must happen every level load) ---

		// 1. Re-initialize the Cat Raycaster
		// (We must do this because the cat meshes are new objects now)
		this.buildKittehRaycaster();

		// 2. Re-initialize Animators
		// (The camera and capsule objects might be new, or just good safety)
		this.pullCameraAnimator = new PullCameraAnimator(
			this.scene.pullCamera,
			this.scene.$('.f_targ'),
			2, 0.75, 1.2
		);

		this.capsuleAnimator = new CapsuleAnimator(
			this.scene.$('#Capsule').children,
			this.scene,
			() => { }
		);

		// --- BRANCHING LOGIC ---

		if (skipUnboxing) {
			// == PATH A: LEVEL SWITCH (Instant Play) ==

			console.log("Skipping Unboxing - Instant Play");

			this.mode.value = Game.MODE.PLAYING;

			// Hide the gift box immediately
			const giftBox = this.scene.$('#GiftBox');
			if (giftBox) giftBox.visible = false;

			// Stir particles to make it look alive
			if (this.scene.particleSystem) {
				this.scene.particleSystem.stirUpParticles(0.5);
			}

		} else {
			// == PATH B: FIRST LAUNCH (Unboxing Sequence) ==

			console.log("First Load - Unboxing Sequence");

			this.mode.value = Game.MODE.UNPACKING;

			// Ensure present is visible
			const giftBox = this.scene.$('#GiftBox');
			if (giftBox) {
				giftBox.visible = true;

				// Create the Unboxing Logic
				// We pass a callback for what happens when unboxing finishes
				this.presentUnboxing = new PresentUnboxing(giftBox.children, this.scene, () => {

					// --- UNBOXING COMPLETE CALLBACK ---
					this.mode.value = Game.MODE.PLAYING;
					this.scene.particleSystem.stirUpParticles(.2);
					giftBox.visible = false;

					this.playSound(this.heySound);
					this.modalManager.showModal('Find some hidden kitties!', 'Hey You!');
				});
			} else {
				console.error("Critical Error: #GiftBox not found in GLB!");
			}

			// Show the first modal to prompt the user
			this.playSound(this.heySound);
			this.modalManager.showModal('Click the present to unwrap it!', 'Hey You!');
		}
	}


	/**
	 * Build a ray caster that responds to hidden kittehs
	 */
	buildKittehRaycaster() {

		// Destroy old one if it exists to stop duplicate clicks
		if(this.catRaycaster) {
			this.catRaycaster.destroy();
		}

		this.catRaycaster = new RaycasterManager(this.scene);

		// this will be a new RaycasterManager that will look for our cats
		this.catRaycaster = new RaycasterManager(this.scene);

		// filter the raycaster to only look for cats
		const filter = [
			...this.scene.$('.cat'),
		];
		this.catRaycaster.setFilter(filter);

		// wait for hits on cats
		this.catRaycaster.onHit((hit) => {

			// if we're not in playing mode, GTFO
			if (this.mode.value !== Game.MODE.PLAYING)
				return;

			// our hit object might have userData.name with a #catName,
			// or it might be a child of a cat object
			// so recursively find the cat object's name
			let catObjectName = hit.object.userData.name;
			while (!catObjectName) {
				hit.object = hit.object.parent;
				catObjectName = hit.object.userData.name;

				// escape if we have no parent
				if (!hit.object.parent)
					break;
			}// wend

			// if we found a cat, call the findCat function
			if (catObjectName) {

				// the name might be a raw string, but it might also look like "#catName .class1 .class2"
				catObjectName = catObjectName.split(' ')[0].replace('#', '').toLowerCase();

				// make sure this is in our list of cats from the imported data
				if (cats.find(cat => cat.object.toLowerCase() === catObjectName))
					this.findCat(catObjectName);
			}
		});

	}


	/**
	 * Shows or toggles one of our game menus
	 *
	 * @param {Number} menu - one of the Game.MENU constants
	 */
	showMenu(menu) {

		// play the woosh sound for menus
		this.playSound(this.woosh);

		// if cats menu is open and we're trying to open it again, close it
		if (menu === Game.MENU.CATS && this.catsMenuOpen.value) {
			this.catsMenuOpen.value = false;
			return;
		}

		// if gatcha menu is open and we're trying to open it again, close it
		if (menu === Game.MENU.GATCHA && this.gatchaMenuOpen.value) {
			this.gatchaMenuOpen.value = false;
			return;
		}

		// if either menu is open, close both
		if (this.catsMenuOpen.value || this.gatchaMenuOpen.value) {
			this.catsMenuOpen.value = false;
			this.gatchaMenuOpen.value = false;
		}

		// open the requested menu
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
	 *
	 * @param {String} catObjectName - the name of the cat object in the scene
	 */
	findCat(catObjectName) {

		// the name might be a raw string, but it might also look like "#catName .class1 .class2"
		// so we need to process it if a hash is present
		catObjectName = catObjectName.split(' ')[0].replace('#', '').toLowerCase();

		// get the list of cats we already have
		const foundCats = this.foundCats.value;

		// find the cat in our list & set it to true
		const foundCat = foundCats.find(cat => cat.object.toLowerCase() === catObjectName);

		// if it was already found, ignore it
		if (foundCat.found)
			return;

		// mark the cat as found
		foundCat.found = true;

		// clear the list & reset it
		this.foundCats.value = [];
		this.foundCats.value = foundCats;

		// check if all cats are found
		this.allCatsFound.value = foundCats.every(cat => cat.found);

		// if the cats menu is closed, increment its bubble counter
		if (this.catsMenuOpen.value === false)
			this.catsMenuCount.value++;

		// in the public folder /assets/sfx/ there's a meow.mp3 file
		// play that sound now
		const audio = new Audio('assets/sfx/meow.mp3');
		audio.play();

		/*
			There's only 12 cats in the cats array.

			However, the array of quotes to pull can change as we add/remove them to the data.js file.

			Therefore, we should do two things:
			- when you find a cat, give the player totalQuotes/12 gatcha pulls, rounded down (i.e. floor(totalQuotes/12))
			- when the player finds the last cat, the might not have enough pulls to get all the quotes
			- so, when the player finds the last cat, we'll give them enough pulls to get all the quotes
		*/
		const totalQuotes = gatchaQuotes.length;
		let pullsToAdd = Math.floor(totalQuotes / 12);
		this.gatchaPulls.value += pullsToAdd;

		// gatcha always unlocked if at least one cat found
		this.gatchaUnlocked.value = true;

		// if we found all the cats, show the modal
		if (this.allCatsFound.value) {
			this.playSound(this.yaySound);
			this.modalManager.showModal('You found all the kittehs!', 'Congratulations!');

			// figure out how many quotes we still have unseen
			const quotes = this.gatchaQuotesSeen.value;
			const unseenQuotes = quotes.filter(quote => !quote.found);

			// calc the difference so the toast is correct
			pullsToAdd = unseenQuotes.length - this.gatchaPulls.value;

			// if we have more unseen quotes than pulls, give the player enough pulls to get them all
			if (unseenQuotes.length > this.gatchaPulls.value)
				this.gatchaPulls.value = unseenQuotes.length;
		}

		// show a toast message
		this.toastManager.showToastMsg(`You found ${foundCat.name} Kitteh!`, `+${pullsToAdd} Gatcha Pulls!`);

		// if we found all the quotes, clear pulls
		if (this.allGatchaQuotesFound.value) {
			this.gatchaPulls.value = 0;
		}
	}


	/**
	 * Starts gatcha pull animate sequence
	 */
	doPull() {

		// gtfo if no pulls
		if (this.gatchaPulls.value < 1)
			return;

		// if we're already doing a pull, ignore
		if (this.doingPull.value)
			return;

		// play the gatcha woosh sound
		this.playSound(this.gatchaWoosh);

		// decrement the pulls
		this.gatchaPulls.value--;

		// show the gatcha menu
		this.doingPull.value = true;

		// play the gatcha theme in a short time
		setTimeout(() => {
			this.bgmPlayer.playGatchaTheme();
		}, 750);

		// hide the UI after 1 second
		setTimeout(() => {
			this.hideUI.value = true;
		}, 1000);

		// wait for our CSS curtain animation to finish before we continue
		setTimeout(() => {

			// start the pull camera animation
			this.doingPullCameraAnimation.value = true;
			this.scene.setCamera(this.scene.pullCamera);
			this.pullCameraAnimator.start(() => {

				this.doingPullCameraAnimation.value = false;
				this.scene.setCamera(this.scene.capsuleCamera);

				// start the capsule animation
				this.doingCapsuleAnimation.value = true;
				this.capsuleAnimator.start(() => {

					this.doingCapsuleAnimation.value = false;

					// check if forceFirst
					// pick a random quote we haven't seen yet
					this.pickRandomQuote();
				});
			});

		}, 1400);

	}


	/**
	 * Picks a random quote from the gatchaQuotesSeen array
	 */
	pickRandomQuote() {

		// so we want to pick the quote that has force_first set true if we haven't seen it yet
		// otherwise, pick a random one we haven't seen yet
		const quotes = this.gatchaQuotesSeen.value;

		// get the first quote that has force_first set true
		let quote = quotes.find(quote => quote.force_first && !quote.found);

		// if we didn't find one, pick a random one, make sure its a random not just the next available one
		if (!quote) {
			const unseenQuotes = quotes.filter(quote => !quote.found);
			quote = unseenQuotes[Math.floor(Math.random() * unseenQuotes.length)];
		}


		if (quote) {
			quote.found = true;
			this.gatchaQuotesSeen.value = [];
			this.gatchaQuotesSeen.value = quotes;

			this.pickedQuote.value = quote;

			// if the gatcha menu is closed, increment its bubble counter
			if (this.gatchaMenuOpen.value === false)
				this.gatchaMenuCount.value++;

			// check if we found all the quotes
			this.allGatchaQuotesFound.value = quotes.every(quote => quote.found);

			// if so, zero out the pulls
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
