<template>
	<div
		class="levelTransition"
		:class="{
			'active': active,
			'goLeft': direction === 'left',
			'goRight': direction === 'right'
		}"
	>
		<div class="transitionShape">
			<div class="content">
				<div class="year">{{ targetYear }}</div>
				<div class="loading">Loading...</div>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	active: Boolean,
	direction: String,
	targetYear: String
});
</script>

<style lang="scss" scoped>
/* Paste the styles from my previous response here */
/* (Same CSS as before) */
.levelTransition {
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 9999;
	overflow: hidden;

	.transitionShape {
		position: absolute;
		top: 50%;
		width: 100px;
		height: 100px;
		background: #fff;
		transition: all 1s ease-in-out;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateY(-50%) scale(1);

		.content {
			color: #000;
			font-weight: bold;
			font-size: 20px;
			text-align: center;
			opacity: 0;
		}
		.year { display: block; }
		.loading { display: none; }
	}

	&.goLeft .transitionShape {
		left: 0;
		clip-path: polygon(100% 0, 0 50%, 100% 100%);
	}

	&.goRight .transitionShape {
		right: 0;
		clip-path: polygon(0 0, 100% 50%, 0 100%);
	}

	&.active {
		pointer-events: all;
		.transitionShape {
			width: 250vmax;
			height: 250vmax;
			clip-path: circle(100% at 50% 50%);
            transform: translateY(-50%) scale(1);
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, -50%);
		}
		.content { opacity: 1; font-size: 5vw; }
		.year { display: none; }
		.loading { display: block; animation: blink 1s infinite; }
	}
}
@keyframes blink { 50% { opacity: 0.5; } }
</style>