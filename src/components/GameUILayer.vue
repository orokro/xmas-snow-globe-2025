<template>

	<div class="gameUILayer">

		<div v-show="shouldShowUI">

			<div
				v-if="gameState.currentLevelKey?.value === '2025'"
				class="navArrow left"
				@click="gameState.switchLevel('2024')"
			>
				<div class="triangle"></div>
				<span>2024</span>
			</div>

			<div
				v-if="gameState.currentLevelKey?.value === '2024'"
				class="navArrow right"
				@click="gameState.switchLevel('2025')"
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
			:direction="gameState.currentLevelKey?.value === '2025' ? 'left' : 'right'"
			:targetYear="gameState.currentLevelKey?.value === '2025' ? '2024' : '2025'"
		/>

		<GatchaPullOverlay v-if="gameState.doingPull.value" :gameState="gameState" />

	</div>

</template>
<script setup>

// vue
import { computed } from 'vue';

// components
import MenuIcon from './MenuIcon.vue';
import CatsMenu from './CatsMenu.vue';
import GatchaMenu from './GatchaMenu.vue';
import GatchaButton from './GatchaButton.vue';
import GatchaPullOverlay from './GatchaPullOverlay.vue';
import ControlsPanel from './ControlsPanel.vue';
import LevelTransition from './LevelTransition.vue'; // Ensure this file exists!

// app
import { Game } from '../classes/Game';

// define some props
const props = defineProps({
	scene: Object,
	gameState: Object
});

// computed method to see if UI Icons should be on screen
const shouldShowUI = computed(() => {
	if (!props.gameState) return false;
	const UIIsNotHidden = !props.gameState.hideUI.value;
	const gameModeIsPlaying = props.gameState.mode.value === Game.MODE.PLAYING;
	return UIIsNotHidden && gameModeIsPlaying;
});

// Computed to control the LevelTransition visibility
// Computed to control the LevelTransition visibility
const shouldShowTransition = computed(() => {
	if (!props.gameState) return false;

	// Safety check
	if (!props.gameState.isTransitioning) return false;

	// STRICT FIX: Only show this layer if we are ACTIVELY transitioning.
	// We do NOT show it during 'PLAYING' because the navArrow buttons handle the UI then.
	return props.gameState.isTransitioning.value;
});
function toggleCatsMenu() {
	props.gameState.showMenu(Game.MENU.CATS);
}

function toggleGatchaMenu() {
	props.gameState.showMenu(Game.MENU.GATCHA);
}

</script>
<style lang="scss" scoped>

	// fill screen space
	.gameUILayer {
		position: fixed;
		inset: 0px 0px 0px 0px;
		pointer-events: none; // Let clicks pass through to 3D scene

		// but allow them for children (buttons/menus)
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

		// Quick CSS triangles
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