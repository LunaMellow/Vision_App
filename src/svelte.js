import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'LunaMellow',
		id: '3333'
	}
});


function doesThisWork() {
	console.log("Hey, svelte.js actually works!")
}

export default app;