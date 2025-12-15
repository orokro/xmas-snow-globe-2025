<template>
	<div class="gameUILayer">

		<div v-show="shouldShowUI">

			<div
				v-if="gameState.currentLevelKey?.value == '2025'"
				class="navArrow left"
				@click="handleSwitch('2024')"
			>
				<svg viewBox="0 0 100 100" class="arrowIcon">
					<path d="M 25 20 L 85 50 L 25 80 Z"
						  fill="none" stroke="white" stroke-width="10" stroke-linejoin="round" />

					<path d="M 25 20 L 85 50 L 25 80 Z"
						  fill="white" stroke="black" stroke-width="6" stroke-linejoin="round" />
				</svg>

				<span>2024</span>
			</div>

			<div
				v-if="gameState.currentLevelKey?.value == '2024'"
				class="navArrow right"
				@click="handleSwitch('2025')"
			>
				<svg viewBox="0 0 100 100" class="arrowIcon">
					<path d="M 25 20 L 85 50 L 25 80 Z"
						  fill="none" stroke="white" stroke-width="10" stroke-linejoin="round" />

					<path d="M 25 20 L 85 50 L 25 80 Z"
						  fill="white" stroke="black" stroke-width="6" stroke-linejoin="round" />
				</svg>

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
	return props.gameState.isTransitioning?.value === true;
});

// === METHODS ===

function handleSwitch(year) {
	transitionTarget.value = year;
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

		// Flexbox to stack Icon + Text
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

		&:hover {
			transform: translateY(-50%) scale(1.1);
		}

		&.left { left: 20px; }
		&.right { right: 20px; }

		// SVG Styling
		.arrowIcon {
			width: 100px;
			height: 100px;

			// Drop shadow for depth
			/* filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5)); */
		}

		// Specific rotation for Left arrow
		// We mirror the whole SVG to point left
		&.left .arrowIcon {
			transform: scaleX(-1);
		}

		span {
			display: block;
			color: white;
			font-weight: 900;
			font-size: 24px;
			text-align: center;
			margin-top: -10px; // Pull text closer to arrow
			text-shadow:
				-2px -2px 0 #000,
				2px -2px 0 #000,
				-2px 2px 0 #000,
				2px 2px 0 #000; // Thick text outline
		}
	}
</style>