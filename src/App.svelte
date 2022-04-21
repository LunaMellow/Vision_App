<script>
	export let name;
	export let id;
</script>

<main>
	<section class="layout">
		<div class="sidebar-top">
		</div>
		<div class="searchbar">
			<h3 class="searchbar-field">Search a keyword</h3>
		</div>
		<div class="navigation-top">3</div>
		<div class="sidebar-right">4</div>
		<div class="sidebar-bottom">
			<!-- <h4 class="profile-name">{name}#{id}</h4> -->
		</div>
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
		background-color: white;
  		display: grid;
  		grid:
    	"sidebar-top searchbar navigation-top sidebar-right" 6%
    	"sidebar-bottom secondary-field main-field sidebar-right-bottom" 1fr
		/ 4% 15% 1fr 15%;
  		gap: 1px;
	}

	.sidebar-top { grid-area: sidebar-top; 
		background-color: #111720;
	}
	.searchbar { grid-area: searchbar; 
		background-color: #171c2a;
	}
	.navigation-top { grid-area: navigation-top; 
		background-color: #131a28;
	}
	.sidebar-right { grid-area: sidebar-right; 
		background-color: #111720;
	}
	.sidebar-bottom { grid-area: sidebar-bottom; 
		background-color: #111720;
	}
	.secondary-field { grid-area: secondary-field; 
		background-color: #171c2a;
	}
	.main-field { grid-area: main-field; 
		background-color: #192030;
	}
	.sidebar-right-bottom { grid-area: sidebar-right-bottom; 
		background-color: #111720;
	}
	main {
		text-align: center;
		padding: 0vh;
		max-width: 240px;
		margin: 0;
		gap: 0;
		padding: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.searchbar-field {
		border: solid 2px #3c4b6e;
		padding-top: 1vh;
		padding-bottom: 1vh;
		margin-left: 2vh;
		margin-right: 2vh;
		color: #2c3751;
		border-radius: 1vh;
	}

	/* .profile-name {
		color: #e2e2e2;
		margin-top: 0;
	} */
</style>