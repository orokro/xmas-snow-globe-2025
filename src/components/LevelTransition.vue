<template>
	<div
		class="levelTransition"
		:class="{
			'active': active,
			'goLeft': direction === 'left',
			'goRight': direction === 'right'
		}"
	>
		<div class="transitionShape" :style="themeStyle">

			<div class="content">

				<div class="snowflake">❄</div>

				<div class="loadingText">
					Traveling to {{ targetYear }}...
				</div>

			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	active: Boolean,
	direction: String, // 'left' or 'right'
	targetYear: String
});

// Calculate the background style based on the target year
const themeStyle = computed(() => {
	if (props.targetYear === '2025') {
		// Warm Orange/Red Gradient for 2025
		return {
			background: 'radial-gradient(circle, rgb(184, 236, 63) 0%,rgb(8, 56, 22) 100%)',
			boxShadow: '0 0 50px #ff8e42' // Internal glow effect
		};
	} else {
		// Deep Purple/Blue Gradient for 2024
		return {
			background: 'radial-gradient(circle, #a16eff 0%, #2f105e 100%)',
			boxShadow: '0 0 50px #a16eff'
		};
	}
});
</script>

<style lang="scss" scoped>
.levelTransition {
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 9999;
	overflow: hidden;

	// The expanding portal shape
	.transitionShape {
		position: absolute;
		top: 50%;

		// Start small (button size)
		width: 100px;
		height: 100px;

		// Smooth animation for the expansion
		transition: all 1.0s cubic-bezier(0.68, -0.55, 0.27, 1.55); // Bouncy easing

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		transform: translateY(-50%) scale(1);

		// Hide content initially
		.content {
			opacity: 0;
			transition: opacity 0.3s ease;
			text-align: center;
			color: white;
		}
	}

	// === LEFT ARROW STATE (Go to 2024) ===
	&.goLeft .transitionShape {
		left: 20px;
		// Triangle pointing Left
		clip-path: polygon(100% 0, 0 50%, 100% 100%);
	}

	// === RIGHT ARROW STATE (Go to 2025) ===
	&.goRight .transitionShape {
		right: 20px;
		// Triangle pointing Right
		clip-path: polygon(0 0, 100% 50%, 0 100%);
	}

	// === ACTIVE EXPANDED STATE ===
	&.active {
		pointer-events: all;

		.transitionShape {
			// Expand to cover the whole screen massively
			width: 250vmax;
			height: 250vmax;

			// Morph into a circle (The Portal)
			clip-path: circle(100% at 50% 50%);

            // Force Center screen
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, -50%);
		}

		// Reveal content once expanded
		.content {
			opacity: 1;
			// Delay showing text slightly so it pops in after expansion
			transition-delay: 0.4s;
		}

		.snowflake {
			font-size: 80px;
			margin-bottom: 20px;
			animation: spin 3s linear infinite;
			text-shadow: 0 0 10px rgba(255,255,255,0.5);
		}

		.loadingText {
			font-family: 'Dancing Script', cursive; // Use your fancy font
			font-size: 40px;
			font-weight: bold;
			text-shadow: 0 2px 4px rgba(0,0,0,0.3);
		}
	}
}

// Simple spin animation for the snowflake
@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>