<template>
	<div class="controlsBox">

		<img src="../assets/img/control_icons.png" class="controlsImage"/>

		<div class="row row_1"><span>Left Mouse</span> to Rotate</div>
		<div class="row row_2"><span>Scroll</span> to Zoom In/Out</div>
		<div class="row row_3"><span>Right Mouse</span> to Pan</div>

		<div class="audioRow">
			<div class="sliderContainer">
				<label>Vol:</label>
				<input
					type="range"
					min="0" max="1" step="0.01"
					v-model="volume"
					@input="updateVolume"
				>
			</div>
			<div class="muteContainer">
				<label>
					<input
						type="checkbox"
						v-model="muted"
						@change="updateMute"
					> Mute
				</label>
			</div>
		</div>

		<div class="row row_4 creditsRow">
			<span @click="showCredits">Credits</span>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
// UPDATE: Import levels instead of the old flat array
import { levels } from '@/classes/Data';

const props = defineProps({
	modalManager: Object,
	bgmPlayer: Object
});

// Audio State
const volume = ref(0.75);
const muted = ref(false);

// Actions
function updateVolume() {
	if(props.bgmPlayer) {
		props.bgmPlayer.setVolume(volume.value);
	}
}

function updateMute() {
	if(props.bgmPlayer) {
		props.bgmPlayer.toggleMute(muted.value);
	}
}

const showCredits = () => {
	const css = '<style>.inlineStyle { text-align: left; padding: 10px 30px; } .inlineStyle a { color: white; }</style>';

	let modalHTML = `
		<div class="inlineStyle"><small><small>
			A game by Greg Miller (Orokro/RlySrsBiz)<br><br>
			<a href="http://gmiller.net" target="_blank">gmiller.net</a><br>
			<a href="https://x.com/RlySrsBiz" target="_blank">@RlySrsBiz</a>
		</small></small></div>
	` + css;
	props.modalManager.showModal(modalHTML, 'Programming & 3D Modeling');

	modalHTML = `
		<div class="inlineStyle"><small><small>
			Music by ZbotZero<br><br>
			<a href="https://discord.com/invite/yZyNufZcAh" target="_blank">Discord Server</a><br>
			<a href="https://soundcloud.com/zbotzero" target="_blank">SoundCloud</a><br>
			<a href="https://www.youtube.com/@ZbotZero" target="_blank">YouTube</a><br>
		</small></small></div>
	` + css;
	props.modalManager.showModal(modalHTML, 'Music');

	modalHTML = `
		<div class="inlineStyle"><small><small>
			2D/3D Assets modeled by Greg Miller<br>
			Additional models from Free3D & Sketchfab.<br>
		</small></small></div>
	` + css;
	props.modalManager.showModal(modalHTML, 'Additional Art');

	// --- NEW DYNAMIC LOGIC ---
	// 1. Get all levels
	// 2. Map them to their quotes arrays
	// 3. Flatten into one big array of quotes
	const allQuotes = Object.values(levels).flatMap(level => level.quotes);

	// 4. Extract unique authors
	const froms = allQuotes
		.map(quote => quote.from)
		.filter((v, i, a) => a.indexOf(v) === i); // Unique filter

	const fromsStr = froms.join(', ');
	// -------------------------

	modalHTML = `
		<div class="inlineStyle"><small><small>
			Thanks to everyone who contributed quotes:<br>
			<small><small>${fromsStr}</small></small>
		</small></small></div>
	` + css;
	props.modalManager.showModal(modalHTML, 'Contributions');
};
</script>

<style lang="scss" scoped>
.controlsBox {
	position: fixed;
	bottom: 30px;
	right: 30px;
	width: 215px;
	height: 230px;

	background: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(5px);
	color: white;
	padding: 10px;
	border-radius: 15px;

	.controlsImage {
		position: absolute;
		left: 10px;
		top: 10px;
		width: 40px;
		height: 160px;
	}

	.row {
		position: absolute;
		left: 60px;
		font-weight: bolder;
		font-size: 14px;
		span { color: #2ECDB5;}
		&.row_1 { top: 25px; }
		&.row_2 { top: 80px; }
		&.row_3 { top: 135px; }

		&.row_4 {
			top: auto;
			bottom: 10px;
			left: 0;
			right: 0;
			text-align: center;
			opacity: 0.7;
			cursor: pointer;
			&:hover { opacity: 1; }
			span { color: white; text-decoration: underline; }
		}
	}

	.audioRow {
		position: absolute;
		top: 175px;
		left: 10px;
		right: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;

		.sliderContainer {
			margin-left: 10px;
			display: flex;
			align-items: center;
			gap: 5px;
			input[type=range] {
				width: 80px;
				cursor: pointer;
				accent-color: #2ECDB5;
			}
		}

		.muteContainer {
			cursor: pointer;
			input {
				cursor: pointer;
				accent-color: #2ECDB5;
				outline: #2ECDB5 2px solid;

			}
			margin-right: 30px;
		}
	}
}
</style>