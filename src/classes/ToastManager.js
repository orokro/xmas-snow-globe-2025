/*
	ToastManager.js
*/
import { ref } from 'vue';

class ToastManager {

	// Update Constructor to accept bgmPlayer
	constructor(toastLength, bgmPlayer) {
		this.toastLength = toastLength * 1000;
		this.bgmPlayer = bgmPlayer; // Save it

		this.currentMessage = ref({ message: '', title: '' });
		this.showToast = ref(false);
		this.messageQueue = [];
		this.timerId = null;
	}

	showToastMsg(message, title = '') {
		const toast = { message, title };
		if (this.showToast.value === false) {
			this.setCurrentMessage(toast);
		} else {
			this.messageQueue.push(toast);
		}
	}

	setCurrentMessage(toast) {
		this.currentMessage.value = toast;
		this.showToast.value = true;

		// USE BGM PLAYER FOR SFX
		setTimeout(() => {
			if (this.bgmPlayer) {
				this.bgmPlayer.playSFX('assets/sfx/ding.mp3');
			}
		}, 100);

		if (this.timerId) clearTimeout(this.timerId);
		this.timerId = setTimeout(() => {
			this.clearCurrentMessage();
		}, this.toastLength);
	}

	clearCurrentMessage() {
		this.showToast.value = false;
		if (this.messageQueue.length > 0) {
			setTimeout(() => {
				this.setCurrentMessage(this.messageQueue.shift());
			}, 500);
		}
	}
}
export default ToastManager;