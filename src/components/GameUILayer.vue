<template>
	<div class="gameUILayer">

		<div v-show="shouldShowUI">

			<div
				v-if="gameState.currentLevelKey?.value == '2025'"
				class="navArrow left"
				@click="handleSwitch('2024')"
			>
				<div class="triangle"></div>
				<span>2024</span>
			</div>

			<div
				v-if="gameState.currentLevelKey?.value == '2024'"
				class="navArrow right"
				@click="handleSwitch('2025')"
			>
				<div class="triangle"></div>
				<span>2025</span>
			</div>

			<CatsMenu
				:isOpen="gameState.catsMenuOpen.value"
				:gameState="gameState"
			/>
			<GatchaMenu
				:isOpen="gameState.gatchaMenuOpen.value"
				:gameState="gameState"
			/>

			<MenuIcon
				:icon="`cat_menu_icon`"
				:left="30"
				:notificationCount="gameState.catsMenuCount.value"
				@click="toggleCatsMenu"
			/>
			<MenuIcon
				:icon="`gatcha_menu_icon`"
				:left="130"
				:notificationCount="gameState.gatchaMenuCount.value"
				@click="toggleGatchaMenu"
			/>

			<ControlsPanel :modalManager="gameState.modalManager" />
			<GatchaButton :gameState="gameState"/>

		</div>

		<LevelTransition
			v-if="shouldShowTransition"
			:active="gameState.isTransitioning?.value || false"
			:direction="transitionTarget == '2024' ? 'left' : 'right'"
			:targetYear="transitionTarget"
		/>

		<GatchaPullOverlay v-if="gameState.doingPull.value" :gameState="gameState" />

	</div>

</template>
<script setup>
import { computed, ref } from 'vue';

// components
import MenuIcon from './MenuIcon.vue';
import CatsMenu from './CatsMenu.vue';
import GatchaMenu from './GatchaMenu.vue';
import GatchaButton from './GatchaButton.vue';
import GatchaPullOverlay from './GatchaPullOverlay.vue';
import ControlsPanel from './ControlsPanel.vue';
import LevelTransition from './LevelTransition.vue';

// app
import { Game } from '../classes/Game';

const props = defineProps({
	scene: Object,
	gameState: Object
});

// === STATE ===

// This holds the "Snapshot" of where we are going,
// so the UI doesn't flip when the level loads in the background.
const transitionTarget = ref('');

// === COMPUTED ===

const shouldShowUI = computed(() => {
	if (!props.gameState) return false;
	const UIIsNotHidden = !props.gameState.hideUI.value;
	const gameModeIsPlaying = props.gameState.mode.value === Game.MODE.PLAYING;
	return UIIsNotHidden && gameModeIsPlaying;
});

const shouldShowTransition = computed(() => {
	if (!props.gameState) return false;
	// Strictly show only when transitioning
	return props.gameState.isTransitioning?.value === true;
});

// === METHODS ===

/**
 * Handles the click event for level switching.
 * Snapshots the target year BEFORE telling the game to switch.
 */
function handleSwitch(year) {
	// 1. Lock in the visual target
	transitionTarget.value = year;

	// 2. Trigger the game logic (which will eventually change currentLevelKey)
	props.gameState.switchLevel(year);
}

function toggleCatsMenu() {
	props.gameState.showMenu(Game.MENU.CATS);
}

function toggleGatchaMenu() {
	props.gameState.showMenu(Game.MENU.GATCHA);
}
</script>

<style lang="scss" scoped>

	.gameUILayer {
		position: fixed;
		inset: 0px 0px 0px 0px;
		pointer-events: none;

		& > * {
			pointer-events: initial;
		}
	}

	.navArrow {
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		z-index: 100;


		&:hover { transform: translateY(-50%) scale(1.1); }

		&.left { left: 20px; }
		&.right { right: 20px; }

		.triangle {

			width: 0;
			height: 0;
			border-top: 20px solid transparent;
			border-bottom: 20px solid transparent;
		}
		&.left .triangle { border-right: 30px solid white; }
		&.right .triangle { border-left: 30px solid white; }

		span {
			display: block;
			color: white;
			font-weight: bold;
			text-align: center;
			margin-top: 5px;
			text-shadow: 0 0 5px black;
		}
	}
</style>