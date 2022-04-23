<script>
	export let name;
	export let id;
</script>

<main>
	<body class="layout">
		<div class="sidebar-top noselect">
		</div>
		<div class="searchbar">
			<!-- <h3 class="searchbar-field noselect">Search a keyword</h3> -->
			2
		</div>
		<div class="navigation-top noselect">3</div>
		<div class="sidebar-right">4</div>
		<div class="sidebar-bottom">
			<span data-text="Hi {name}!" class="tooltip"><img class="logo" src="https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png" alt="Vision"></span>
			<!-- <h4 class="profile-name">{name}#{id}</h4> -->
		</div>
		<div class="secondary-field">6</div>
		<div class="main-field">7</div>
		<div class="sidebar-right-bottom">8</div>
		<div class="bottombar-left">9</div>
		<div class="bottombar-secondary noselect">
			<img class="profilepicture" src="https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg" alt="User: ">
			<div class="profile-info">
				<h4 class="username-profile-field">{name}</h4>
				<h5 class="username-id-field">#{id}</h5>
			</div>
		</div>
		<div class="bottombar-main">11</div>
		<div class="bottombar-right">12</div>
	</body>
</main>

<style>
	.tooltip {
  		position:relative; /* making the .tooltip span a container for the tooltip text */
  		border-bottom:1px dashed #000; /* little indicater to indicate it's hoverable */
	}

	.tooltip:before {
  		content: attr(data-text); /* here's the magic */
  		position:absolute;
  
  		/* vertically center */
  		top:50%;
  		transform:translateY(-50%);
  
  		/* move to right */
  		left:100%;
  		margin-left:15px; /* and add a small left margin */
  
  		/* basic styles */
  		width:400%;
  		padding:10px;
  		border-radius:10px;
  		background:rgb(255, 255, 255);
  		color: rgb(0, 0, 0);
  		text-align:center;

  		display:none; /* hide by default */
}

.tooltip:hover:before {
  display:block;
}

	main {
		text-align: center;
		max-width: 240px;	
	}
	body {
		padding: 0px;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	.layout {
  		width: 100%;
  		height: 100vh;
  		display: grid;
  		grid:
    	"sidebar-top searchbar navigation-top sidebar-right" 5%
    	"sidebar-bottom secondary-field main-field sidebar-right-bottom" 1fr
		"bottombar-left bottombar-secondary bottombar-main bottombar-right" 6.5%
		/ 5% 15% 1fr 15%;
  		gap: 0px;
	}

	.sidebar-top { grid-area: sidebar-top; 
		background-color: #111720;
	}
	.searchbar { grid-area: searchbar; 
		background-color: #171c2a;
	}
	.navigation-top { grid-area: navigation-top; 
		background-color: #131a28;
  		-webkit-app-region: drag;
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

	.bottombar-left {
		background-color: #111720;
	}

	.bottombar-secondary {
		background-color: #111720;
	}
	.bottombar-main {
		background-color: #192030;
	}
	.bottombar-right {
		background-color: #111720;
	}

	/* .searchbar-field {
		border: solid 2px #5c6270;
		padding-top: .1vh;
		padding-bottom: .4vh;
		margin-top: 1.5vh;
		margin-left: 2vh;
		margin-right: 2vh;
		color: #434853;
		border-radius: .5vh;
	} */

	.username-profile-field {
		color: white;
	}

	.username-id-field {
		color:rgb(109, 109, 109);
	}

	@media only screen and (max-height: 900px) {
    .username-id-field {
        display: none;
    }
}

	.profilepicture {
		margin-top: 5%; 
		margin-left: 1.5vh; 
		height: 3.5vh; 
		border: solid 2px rgb(94, 94, 94); 
		transition: transform .15s; /* Animation */
		border-radius: 50%;
		float:left;
		margin-right: 7%;
	}

	.profilepicture:hover {
		transform: scale(1.1); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
	}

	.profile-info {
		position: top;
		line-height: 0;
		text-align: left;
		margin-top: 9%;
		padding-right: 5%;
	}

	.logo {
		transition: transform .15s; /* Animation */
		height: 2vh; 
		padding-top: 0vh;
	}
	.logo:hover {
		transform: scale(1.2); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
	}


.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

	/* .profile-name {
		color: #e2e2e2;
		margin-top: 0;
	} */
</style>