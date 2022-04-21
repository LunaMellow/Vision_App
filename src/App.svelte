<script>
	export let name;
</script>

<main>
	<section class="layout">
		<div class="sidebar-top">
			<img style="height: 3vh; width: 6.5vh; padding-top: 3vh;" src="https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png" alt="Vision">
		</div>
		<div class="searchbar">2</div>
		<div class="navigation-top">3</div>
		<div class="sidebar-right">4</div>
		<div class="sidebar-bottom">5</div>
		<div class="secondary-field">6</div>
		<div class="main-field">

		</div>
		<div class="sidebar-right-bottom">8</div>
	  </section>
</main>

<style>
	.layout {
  		width: 100%;
  		height: 96vh;

  		display: grid;
  		grid:
    	"sidebar-top searchbar navigation-top sidebar-right" 10%
    	"sidebar-bottom secondary-field main-field sidebar-right-bottom" 1fr
		/ 7% 15% 1fr 15%;
  		gap: 1px;
	}

	.sidebar-top { grid-area: sidebar-top; 
		background-color: #23272a;
	}
	.searchbar { grid-area: searchbar; 
		background-color: #23272a;
	}
	.navigation-top { grid-area: navigation-top; 
		background-color: #2c2f33;
	}
	.sidebar-right { grid-area: sidebar-right; 
		background-color: #23272a;
	}
	.sidebar-bottom { grid-area: sidebar-bottom; 
		background-color: #23272a;
	}
	.secondary-field { grid-area: secondary-field; 
		background-color: #23272a;
	}
	.main-field { grid-area: main-field; 
		background-color: #2c2f33;
	}
	.sidebar-right-bottom { grid-area: sidebar-right-bottom; 
		background-color: #23272a;
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>