/*
	Data.js
	-------

	Importing JSON files directly into our code can be a bit of a pain. This file
	will just be some JavaScript exports with the data for our game.
*/

/*
	Data.js
	-------
	Config for our different years/levels.
*/

// Shared list of cats (since you said they are the same 12)
// NOTE: Ensure your new 2025 GLB uses these exact Object Names for the cats!
const cats2024 = [
	{ name: 'Cookie', icon: '2024/01_cookie.png', object: 'Cookie' },
	{ name: 'Front', icon: '2024/12_front.png', object: 'FrontKitteh' },
	{ name: 'Chimney', icon: '2024/02_chimney.png', object: 'ChimneyKitteh' },
	{ name: 'Trash', icon: '2024/03_trash.png', object: 'TrashKitteh' },
	{ name: 'Fence', icon: '2024/04_fence.png', object: 'FenceKitteh' },
	{ name: 'Window', icon: '2024/05_window.png', object: 'WindowKitteh' },
	{ name: 'Ladder', icon: '2024/06_ladder.png', object: 'LadderKitteh' },
	{ name: 'Truck', icon: '2024/07_truck.png', object: 'TruckKitteh' },
	{ name: 'Front Door', icon: '2024/08_front_door.png', object: 'FrontDoorKitteh' },
	{ name: 'Upper Tree Kitteh', icon: '2024/09_tree_upper.png', object: 'TopTreeKitteh' },
	{ name: 'Under Tree Kitteh', icon: '2024/10_tree_lower.png', object: 'UnderTreeKitteh' },
	{ name: 'Mailbox', icon: '2024/11_mailbox.png', object: 'MailKitteh' },
];

const cats2025 = [
	{ name: 'Cookie', icon: '2025/01_cookie.png', object: 'Cookie' },
	{ name: 'Bushes', icon: '2025/02_bushes.png', object: 'FrontKitteh' },
	{ name: 'Vents', icon: '2025/03_vents.png', object: 'ChimneyKitteh' },
	{ name: 'Trash', icon: '2025/04_trash.png', object: 'TrashKitteh' },
	{ name: 'Employee', icon: '2025/05_employee.png', object: 'FenceKitteh' },
	{ name: 'Front', icon: '2025/06_front.png', object: 'WindowKitteh' },
	{ name: 'Dumpster', icon: '2025/07_dumpster.png', object: 'LadderKitteh' },
	{ name: 'Car', icon: '2025/08_car.png', object: 'TruckKitteh' },
	{ name: 'Tractor Beam', icon: '2025/09_tractor.png', object: 'FrontDoorKitteh' },
	{ name: 'Lounge', icon: '2025/10_lounge.png', object: 'TopTreeKitteh' },
	{ name: 'Menu', icon: '2025/11_menu.png', object: 'UnderTreeKitteh' },
	{ name: 'Trash 2', icon: '2025/12_trash2.png', object: 'MailKitteh' }
];

export const levels = {
	'2024': {
		year: '2024',
		model: 'snow_globe_scene_2024.glb', // The original model
		pullMusic: 'zbot_gatcha.mp3', // Original pull music
		bgmMusic: 'zbot_theme.mp3', // Original BGM music
		background: {
			gradient: 'linear-gradient(180deg, #4E2A77 0%, #1A1A3A 100%)', // Purple
			image: 'reli_xmas_bg_pattern.png', // Original pattern
			color: '#4E2A77'
		},
		pullCount: 2,
		cats: cats2024,
		quotes: [
			{
				from: 'Orokro',
				text: 'The scuff in this xMas gatcha is real',
			},
			{
				from: 'Orokro',
				text: 'Last rizzmas I gave you my Gyatt. This rizzmas ILL FN DO IT AGAIN',
			},
			{
				from: 'Cookie',
				text: 'Meowy Christmas!',
			},
			{
				from: 'Cookie',
				text: 'Feed me mother!',
			},
			{
				from: 'Orokro',
				text: 'I herd u liek snow globes. Merry Crimmas!',
				force_first: true,
			},
			{
				from: 'Don',
				text: 'Imperial Units',
			},
			{
				from: 'Don',
				text: 'What the fuck is a kilometer',
			},
			{
				from: 'Don',
				text: '"I\'m just a little catboy" ~Reli in cosplay at AWA" - Lucina'
			},
			{
				from: 'Araziel',
				text: '"It\'s jiggling because it\'s a fake chest" Said by Reli',
			},
			{
				from: 'Araziel',
				text: '"I am 1.03125 Relis tall on a Tuesday” -Drewus Maximus',
			},
			{
				from: 'Araziel',
				text: '"Imagine being an alien residing in the land of horny measurements and not being allowed to be sekushii"',
			},
			{
				from: 'Araziel',
				text: 'Women love me, Fish fear me, Childe wants me',
			},
			{
				from: 'Araziel',
				text: 'Wow Aurelia encourages unsafe driving smh my head',
			},
			{
				from: 'Araziel',
				text: 'Assiopeia should be the NSFW tag',
			},
			{
				from: 'Rennova',
				text: 'I first followed you on Christmas day a year ago, and do not regret it. Thanks for this past year, Aurelia. Hope to get to know you more in the future.',
			},
			{
				from: 'Rennova',
				text: 'Have a cosmic Christmas!',
			},
			{
				from: 'Fiend',
				text: 'Stopped binging alcohol to watch the Space Lady',
			},
			{
				from: 'Fiend',
				text: 'The V-Moe girls distracted me long enough for the Dunkin Donuts employee I was holding at gun point to run away',
			},
			{
				from: 'Lotus the Ghost',
				text: 'Merry Christmas Reli! I hope you\'re able to reach your goals and have fun in the new year!',
			},
			{
				from: 'Lotus the Ghost',
				text: 'help i\'m stuck in a website',
			},
			{
				from: 'Zach M',
				text: 'Happy Holidays Aurelia, I just wanted to use this opportunity to say thank you for being your: awesome, funny, lighthearted, sometimes lewd, always crazy, kind, incredible costume-making, amazing, self. I’m so glad to have discovered you, and look forward to giving you my continued support. Happy holidays!!! P.S. Don’t tell Allen, but you’re actually my number one favorite twerking alien.',
			},
			{
				from: 'Zach M',
				text: 'Aurelia, My last two brain cells were so busy competing for third place that they both came in fourth, trying to write this message; Anyways………..HERES TO CELEBRATING SOME HAPPY HOLIDAYS AND TO MANY MORE!!!!! 🍺',
			},
			{
				from: 'Drewus Maximus',
				text: 'MERRY CHRISTMAS TO OUR BESTEST IDOL ALIEN! Hope you have a nice holiday and all your dreams come true next year 💜',
			},
			{
				from: 'Drewus Maximus',
				text: 'Skibidi Reli in Fortnite',
			},
			{
				from: 'Drewus Maximus',
				text: 'cookie when she heard what Santa eats',
			},
			{
				from: 'Wooderson',
				text: '“I love chicken katsu, on a bed of rice, that shit slaps my nuts." -Aurelia Cassiopeia, 2024',
			},
			{
				from: 'Wooderson',
				text: 'Merry Christmas to the greatest space alien, idol, maid(failure)',
			},
			{
				from: 'Abysmal',
				text: 'Reliiiiii!! While I haven\'t been here long, it\'s been extremely entertaining watching you and your community grow. Anytime I catch you or a VOD I know I\'m in for a good laugh and a great time. Thanks for sharing that golden personality with us! ✌️😁 I\'ll always be wishing you the best!',
			},
			{
				from: 'TomtheIronMan',
				text: '“Oh man, I’m gonna be #FreakinIt” - every time playing RE2',
			},
			{
				from: 'TomtheIronMan',
				text: '"All my cards are ASS"',
			},
			{
				from: 'ZbotZero',
				text: 'I like porple',
			},
			{
				from: 'ZbotZero',
				text: '“She’s gonna cry happy again”',
			},
			{
				from: 'ZbotZero',
				text: 'We pulling out the big tears every time',
			},
			{
				from: 'Lethia',
				text: 'Dear Aurelia, THANK YOU FOR BEING SUCH A FANTASTIC GENMATE!!! You are so freaking talented, and I am floored by both the caliber of your content and how many talents you have. Singing? ✅  Sewing? ✅ Being V-Moe\'s lil freak? ✅ ✅ ✅  I could not imagine Moe-Kyun without you my dear alien. HERE\'S TO MORE SHENANIGANS YIPPEE!!!! 🥳 🥳',
			},
			{
				from: 'Lethia',
				text: 'What\'s an alien\'s favorite holiday treat? Hot cocoa with martian-mellows!!! 👽 ☕',
			}
		]
	},

	'2025': {
		year: '2025',
		model: 'snow_globe_scene_2025.glb',
		pullMusic: 'zbot_gatcha_2025.mp3',
		bgmMusic: 'zbot_theme_2025.mp3',
		background: {
			gradient: 'linear-gradient(180deg,rgb(184, 236, 63) 0%,rgb(8, 56, 22) 100%)', // Orange/Brown
			image: 'reli_xmas_bg_pattern.png',
			color: '#D35400'
		},
		pullCount: 10,
		cats: cats2025, // Same cats, but they need to exist in the new GLB!
		quotes: [
			// ... ADD YOUR NEW 2025 QUOTES HERE ...
			{ from: 'Orokro', text: 'Did you PAY for all that Taco Bell though?', force_first: true, },
			{ from: 'Reli', text: 'Yo quiero Taco Bell' },
			{ from: 'Community', text: 'New year new scuff' },
			{
				from: 'Orokro',
				text: 'The scuff in this xMas gatcha is real',
			},
			{
				from: 'Orokro',
				text: 'Last rizzmas I gave you my Gyatt. This rizzmas ILL FN DO IT AGAIN',
			},
			{
				from: 'Cookie',
				text: 'Meowy Christmas!',
			},
			{
				from: 'Cookie',
				text: 'Feed me mother!',
			},
			{
				from: 'Orokro',
				text: 'I herd u liek snow globes. Merry Crimmas!',
			},
			{
				from: 'Don',
				text: 'Imperial Units',
			},
			{
				from: 'Don',
				text: 'What the fuck is a kilometer',
			},
			{
				from: 'Don',
				text: '"I\'m just a little catboy" ~Reli in cosplay at AWA" - Lucina'
			},
			{
				from: 'Araziel',
				text: '"It\'s jiggling because it\'s a fake chest" Said by Reli',
			},
			{
				from: 'Araziel',
				text: '"I am 1.03125 Relis tall on a Tuesday” -Drewus Maximus',
			},
			{
				from: 'Araziel',
				text: '"Imagine being an alien residing in the land of horny measurements and not being allowed to be sekushii"',
			},
			{
				from: 'Araziel',
				text: 'Women love me, Fish fear me, Childe wants me',
			},
			{
				from: 'Araziel',
				text: 'Wow Aurelia encourages unsafe driving smh my head',
			},
			{
				from: 'Araziel',
				text: 'Assiopeia should be the NSFW tag',
			},
			{
				from: 'Rennova',
				text: 'I first followed you on Christmas day a year ago, and do not regret it. Thanks for this past year, Aurelia. Hope to get to know you more in the future.',
			},
			{
				from: 'Rennova',
				text: 'Have a cosmic Christmas!',
			},
			{
				from: 'Fiend',
				text: 'Stopped binging alcohol to watch the Space Lady',
			},
			{
				from: 'Fiend',
				text: 'The V-Moe girls distracted me long enough for the Dunkin Donuts employee I was holding at gun point to run away',
			},
			{
				from: 'Lotus the Ghost',
				text: 'Merry Christmas Reli! I hope you\'re able to reach your goals and have fun in the new year!',
			},
			{
				from: 'Lotus the Ghost',
				text: 'help i\'m stuck in a website',
			},
			{
				from: 'Zach M',
				text: 'Happy Holidays Aurelia, I just wanted to use this opportunity to say thank you for being your: awesome, funny, lighthearted, sometimes lewd, always crazy, kind, incredible costume-making, amazing, self. I’m so glad to have discovered you, and look forward to giving you my continued support. Happy holidays!!! P.S. Don’t tell Allen, but you’re actually my number one favorite twerking alien.',
			},
			{
				from: 'Zach M',
				text: 'Aurelia, My last two brain cells were so busy competing for third place that they both came in fourth, trying to write this message; Anyways………..HERES TO CELEBRATING SOME HAPPY HOLIDAYS AND TO MANY MORE!!!!! 🍺',
			},
			{
				from: 'Drewus Maximus',
				text: 'MERRY CHRISTMAS TO OUR BESTEST IDOL ALIEN! Hope you have a nice holiday and all your dreams come true next year 💜',
			},
			{
				from: 'Drewus Maximus',
				text: 'Skibidi Reli in Fortnite',
			},
			{
				from: 'Drewus Maximus',
				text: 'cookie when she heard what Santa eats',
			},
			{
				from: 'Wooderson',
				text: '“I love chicken katsu, on a bed of rice, that shit slaps my nuts." -Aurelia Cassiopeia, 2024',
			},
			{
				from: 'Wooderson',
				text: 'Merry Christmas to the greatest space alien, idol, maid(failure)',
			},
			{
				from: 'Abysmal',
				text: 'Reliiiiii!! While I haven\'t been here long, it\'s been extremely entertaining watching you and your community grow. Anytime I catch you or a VOD I know I\'m in for a good laugh and a great time. Thanks for sharing that golden personality with us! ✌️😁 I\'ll always be wishing you the best!',
			},
			{
				from: 'TomtheIronMan',
				text: '“Oh man, I’m gonna be #FreakinIt” - every time playing RE2',
			},
			{
				from: 'TomtheIronMan',
				text: '"All my cards are ASS"',
			},
			{
				from: 'ZbotZero',
				text: 'I like porple',
			},
			{
				from: 'ZbotZero',
				text: '“She’s gonna cry happy again”',
			},
			{
				from: 'ZbotZero',
				text: 'We pulling out the big tears every time',
			},
			{
				from: 'Lethia',
				text: 'Dear Aurelia, THANK YOU FOR BEING SUCH A FANTASTIC GENMATE!!! You are so freaking talented, and I am floored by both the caliber of your content and how many talents you have. Singing? ✅  Sewing? ✅ Being V-Moe\'s lil freak? ✅ ✅ ✅  I could not imagine Moe-Kyun without you my dear alien. HERE\'S TO MORE SHENANIGANS YIPPEE!!!! 🥳 🥳',
			},
			{
				from: 'Lethia',
				text: 'What\'s an alien\'s favorite holiday treat? Hot cocoa with martian-mellows!!! 👽 ☕',
			}
		]
	}
};
