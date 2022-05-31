<script>
	export let name;
	export let id;

	import { Router } from "@roxi/routify";
	import { routes } from "../.routify/routes";
</script>

<Router {routes} />

<main>
	<body onload="startTime()" class="layout fadein-2s">
		<div class="sidebar-top noselect">
		</div>
		<div class="searchbar noselect">
			<!-- <h3 class="searchbar-field noselect">Search a keyword</h3> -->
			2
		</div>
		<div class="navigation-top noselect">3</div>
		<div class="sidebar-right noselect">4</div>
		<div class="sidebar-bottom noselect">
			<span data-text="Hi {name}!" class="tooltip fadein-2s"><img class="logo" src="https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png" alt="Vision"></span>
			<!-- <h4 class="profile-name">{name}#{id}</h4> -->
			<div class="sidebar">
				<span data-text="Home" class="tooltip-sidebar-home"><button class="sidebar-buttons fadein-3s"><i class="fa fa-home"></i></button></span>
				<span data-text="About" class="tooltip-sidebar-user"><button class="sidebar-buttons fadein-4s"><i class="fa fa-user"></i></button></span>
				<span data-text="Projects" class="tooltip-sidebar-book"><button class="sidebar-buttons fadein-5s"><i class="fa fa-book"></i></button></span>
				<span data-text="Development process" class="tooltip-sidebar-laptop"><button class="sidebar-buttons fadein-6s"><i class="fa fa-laptop"></i></button></span>
			</div>
		</div>
		<div class="secondary-field noselect">6</div>
		<div class="main-field noselect">
			<div class="main-field-container">
				<div class="main-content">

				</div>
			</div>
		</div>
		<div class="sidebar-right-bottom noselect">8</div>
		<div class="bottombar-left noselect">
			<button class="sidebar-buttons fadein-6s"><i class="fa fa-gear"></i></button>
		</div>
		<div class="bottombar-secondary noselect">
			<div class="profilepicture-container">
				<img class="profilepicture fadein-6s" src="https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg" alt="User: ">
			</div>
			<div class="profile-info fadein-6s">
				<h4 class="username-profile-field">{name}</h4>
				<h5 class="username-id-field">#{id}</h5>
			</div>
		</div>
		<div class="bottombar-main noselect">11</div>
		<div class="bottombar-right noselect">12</div>
	</body>
</main>

<style>
	@font-face {
		font-family: 'avenircondensed';
		src: url('/Users/lunasofiebergh/Documents/Webapp/vision/fonts/Avenir Next Condensed.ttc') format('TrueType');
	}
	@font-face {
		font-family: 'avenirnext';
		src: url('/Users/lunasofiebergh/Documents/Webapp/vision/fonts/Avenir Next.ttc') format('TrueType');
	}
	@font-face {
		font-family: 'avenir';
		src: url('/Users/lunasofiebergh/Documents/Webapp/vision/fonts/Avenir.ttc') format('TrueType');
	}

	/* @font-face {
		font-family: '';
		src: url('') format('');
	} */

	main {
		overflow-y: hidden;
		text-align: center;
		max-width: 240px;	
	}
	body {
		padding: 0px;
		font-family: avenir;
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
    	"sidebar-top searchbar navigation-top sidebar-right" 3%
    	"sidebar-bottom secondary-field main-field sidebar-right-bottom" 1fr
		"bottombar-left bottombar-secondary bottombar-main bottombar-right" 6.5%
		/ 4.5% 15% 1fr 15%;
  		gap: 0px;
	}

	.sidebar-top { grid-area: sidebar-top; 
		background-color: #111720;
	}
	.searchbar { grid-area: searchbar; 
		background-color: #151927;
		border-bottom: solid .4vh rgb(20, 25, 40);
	}
	.navigation-top { grid-area: navigation-top; 
		background-color: #151927;
  		-webkit-app-region: drag;
		border-bottom: solid .4vh rgb(20, 25, 40);
	}
	.sidebar-right { grid-area: sidebar-right; 
		background-color: #111720;
	}
	.sidebar-bottom { grid-area: sidebar-bottom; 
		background-color: #111720;
	}
	.secondary-field { grid-area: secondary-field; 
		background-color: #171c2a;
		border-right: solid .4vh rgb(22, 28, 45);
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
		background-color: #151927;
		border-top: solid .4vh rgb(22, 28, 45);
		border-right: solid .4vh rgb(22, 28, 45);
	}
	.bottombar-main {
		background-color: #192030;
	}
	.bottombar-right {
		background-color: #111720;
	}
	
	.fadein-6s {
		-webkit-animation: fadein 6s; /* Safari, Chrome and Opera > 12.1 */
		-moz-animation: fadein 6s; /* Firefox < 16 */
   		-ms-animation: fadein 6s; /* Internet Explorer */
    	-o-animation: fadein 6s; /* Opera < 12.1 */
    	animation: fadein 6s;
	}
	.fadein-5s {
		-webkit-animation: fadein 5s; /* Safari, Chrome and Opera > 12.1 */
		-moz-animation: fadein 5s; /* Firefox < 16 */
   		-ms-animation: fadein 5s; /* Internet Explorer */
    	-o-animation: fadein 5s; /* Opera < 12.1 */
    	animation: fadein 5s;
	}
	.fadein-4s {
		-webkit-animation: fadein 4s; /* Safari, Chrome and Opera > 12.1 */
		-moz-animation: fadein 4s; /* Firefox < 16 */
   		-ms-animation: fadein 4s; /* Internet Explorer */
    	-o-animation: fadein 4s; /* Opera < 12.1 */
    	animation: fadein 4s;
	}
	.fadein-3s {
		-webkit-animation: fadein 3s; /* Safari, Chrome and Opera > 12.1 */
		-moz-animation: fadein 3s; /* Firefox < 16 */
   		-ms-animation: fadein 3s; /* Internet Explorer */
    	-o-animation: fadein 3s; /* Opera < 12.1 */
    	animation: fadein 3s;
	}
	.fadein-2s {
		-webkit-animation: fadein 2s; /* Safari, Chrome and Opera > 12.1 */
		-moz-animation: fadein 2s; /* Firefox < 16 */
   		-ms-animation: fadein 2s; /* Internet Explorer */
    	-o-animation: fadein 2s; /* Opera < 12.1 */
    	animation: fadein 2s;
	}

	/* .main-content {

	} */

	.sidebar {
		margin-top: 2vh;
	}
	.sidebar-buttons {
		background: -webkit-linear-gradient(rgb(240, 72, 255), rgb(52, 214, 255)); 
		-webkit-background-clip: text;
		background-clip: text;
  		-webkit-text-fill-color: transparent;
		border: 0;
		font-size: 3vh;
		padding-right: 25%;
		padding-left: 25%;
		transition: transform .15s; /* Animation */
	}

	.sidebar-buttons:hover {
		background: white;
		-webkit-background-clip: text;
		background-clip: text;
  		-webkit-text-fill-color: transparent;
		transform: scale(1.1); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */

	}
	.tooltip {
  		position:relative; /* making the .tooltip span a container for the tooltip text */
	}

	@keyframes fadein {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	/* Firefox < 16 */
	@-moz-keyframes fadein {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	/* Safari, Chrome and Opera > 12.1 */
	@-webkit-keyframes fadein {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	/* Internet Explorer */
	@-ms-keyframes fadein {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	/* Opera < 12.1 */
	@-o-keyframes fadein {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	.tooltip:before {
  		content: attr(data-text); /* here's the magic */
  		position:absolute;
  
  		/* vertically center */
  		top:30%;
  		transform:translateY(-50%);
  
  		/* move to right */
  		left:100%;
  		margin-left:15px; /* and add a small left margin */
  
  		/* basic styles */
  		width:220%;
		padding-top: 1vh;
		padding-bottom: 1vh;
		padding-left: 1vh;
		padding-right: 1vh;
  		border-radius:10px;
  		background:rgb(255, 255, 255);
  		color: rgb(0, 0, 0);
  		text-align:center;

  		display:none; /* hide by default */
}

.tooltip:hover:before {
  	display:block;
  	-webkit-animation: fadein .5s; /* Safari, Chrome and Opera > 12.1 */
	-moz-animation: fadein .5s; /* Firefox < 16 */
    -ms-animation: fadein .5s; /* Internet Explorer */
    -o-animation: fadein .5s; /* Opera < 12.1 */
    animation: fadein .5s;
}

.main-field-container {
	color: white;
	font-family: avenirnext;
	text-align: left;
	margin-left: 5vh;
	line-height:0%;
}

/* #main-field-title {
	font-size: 10vh;
	margin-top: 9%;

} */

/* #main-field-tip {
	font-size: 2.5vh;
	margin-left: .5vh;

}	 */

/*-------------------------------- Home BUTTON SIDEBAR --------------------------------*/

.tooltip-sidebar-home {
  		position:relative; /* making the .tooltip span a container for the tooltip text */
	}

	.tooltip-sidebar-home:before {
  		content: attr(data-text); /* here's the magic */
  		position: absolute;
  
  		/* vertically center */
		margin-top: 50%;
  		transform:translateY(-50%);
  
  		/* move to right */
  		left: 100%;
  		margin-left:0px; /* and add a small left margin */
  
  		/* basic styles */
		text-align:center;
  		width: 0%;
  		padding-top: 1vh;
		padding-bottom: 1vh;
		padding-left: 1vh;
		padding-right: 5vh;
  		border-radius: 10px;
  		background:rgb(255, 255, 255);
  		color: rgb(0, 0, 0);

  		display:none; /* hide by default */
}

.tooltip-sidebar-home:hover:before {
  	display:block;
  	-webkit-animation: fadein .5s; /* Safari, Chrome and Opera > 12.1 */
	-moz-animation: fadein .5s; /* Firefox < 16 */
    -ms-animation: fadein .5s; /* Internet Explorer */
    -o-animation: fadein .5s; /* Opera < 12.1 */
    animation: fadein .5s;
}

/*--------------------------------------------------------------------------------------*/


/*-------------------------------- ABOUT BUTTON SIDEBAR --------------------------------*/

.tooltip-sidebar-user {
  		position:relative; /* making the .tooltip span a container for the tooltip text */
	}

	.tooltip-sidebar-user:before {
  		content: attr(data-text); /* here's the magic */
  		position: absolute;
  
  		/* vertically center */
		top: 85%;
  		transform:translateY(-50%);
  
  		/* move to right */
  		left: 100%;
  		margin-left:0px; /* and add a small left margin */
  
  		/* basic styles */
		text-align:center;
  		width: 100%;
  		padding-top: 1vh;
		padding-bottom: 1vh;
		padding-left: 1vh;
		padding-right: 5vh;
  		border-radius: 10px;
  		background:rgb(255, 255, 255);
  		color: rgb(0, 0, 0);

  		display:none; /* hide by default */
}

.tooltip-sidebar-user:hover:before {
  	display:block;
	width: 100%;
  	-webkit-animation: fadein .5s; /* Safari, Chrome and Opera > 12.1 */
  	-moz-animation: fadein .5s; /* Firefox < 16 */
    -ms-animation: fadein .5s; /* Internet Explorer */
    -o-animation: fadein .5s; /* Opera < 12.1 */
    animation: fadein .5s;
}

/*--------------------------------------------------------------------------------------*/

/*-------------------------------- PROJECTS BUTTON SIDEBAR --------------------------------*/

.tooltip-sidebar-book {
  		position:relative; /* making the .tooltip span a container for the tooltip text */
	}

	.tooltip-sidebar-book:before {
  		content: attr(data-text); /* here's the magic */
  		position: absolute;
  
  		/* vertically center */
		top: 85%;
  		transform:translateY(-50%);
  
  		/* move to right */
  		left: 100%;
  		margin-left:0px; /* and add a small left margin */
  
  		/* basic styles */
		text-align:center;
  		width: 0%;
  		padding-top: 1vh;
		padding-bottom: 1vh;
		padding-left: 1vh;
		padding-right: 6.2vh;
  		border-radius: 10px;
  		background:rgb(255, 255, 255);
  		color: rgb(0, 0, 0);

  		display:none; /* hide by default */
}

.tooltip-sidebar-book:hover:before {
 	display:block;
	-webkit-animation: fadein .5s; /* Safari, Chrome and Opera > 12.1 */
	-moz-animation: fadein .5s; /* Firefox < 16 */
    -ms-animation: fadein .5s; /* Internet Explorer */
    -o-animation: fadein .5s; /* Opera < 12.1 */
    animation: fadein .5s;
}

/*--------------------------------------------------------------------------------------*/

/*-------------------------------- DEV PROCESS BUTTON SIDEBAR --------------------------------*/

.tooltip-sidebar-laptop {
  		position:relative; /* making the .tooltip span a container for the tooltip text */
	}

	.tooltip-sidebar-laptop:before {
  		content: attr(data-text); /* here's the magic */
  		position: absolute;
  
  		/* vertically center */
		top: 85%;
  		transform:translateY(-50%);
  
  		/* move to right */
  		left: 100%;
  		margin-left:0px; /* and add a small left margin */
  
  		/* basic styles */
		text-align:center;
  		width: 0%;
  		padding-top: 1vh;
		padding-bottom: 1vh;
		padding-left: 1vh;
		padding-right: 9.5vh;
  		border-radius: 10px;
  		background:rgb(255, 255, 255);
  		color: rgb(0, 0, 0);

  		display:none; /* hide by default */
}

.tooltip-sidebar-laptop:hover:before {
  	display:block;
  	-webkit-animation: fadein .5s; /* Safari, Chrome and Opera > 12.1 */
	-moz-animation: fadein .5s; /* Firefox < 16 */
    -ms-animation: fadein .5s; /* Internet Explorer */
    -o-animation: fadein .5s; /* Opera < 12.1 */
    animation: fadein .5s;
}

/*--------------------------------------------------------------------------------------*/
	.profilepicture {
		margin-top: 4%; 
		margin-left: 13%; 
		height: 3.5vh; 
		border: solid 2px rgb(227, 227, 227); 
		transition: transform .15s; /* Animation */
		border-radius: 50%;
		float:left;
		margin-right: 7%;
	}

	.profilepicture:hover {
		transform: scale(1.1); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
	}

	.username-profile-field {
		color: white;
	}

	.username-id-field {
		color:rgb(109, 109, 109);
	}

	.profile-info {
		position: top;
		line-height: 0;
		text-align: left;
		margin-top: 9%;
		padding-right: 5%;
	}

	@media only screen and (max-height: 950px) {
    .username-id-field {
        display: none;
    }
}

	@media only screen and (max-width: 1150px) {
		.bottombar-secondary {
			background-color: #171c2a;
		}
		.profilepicture-container {
			margin-top: .6vh;
			margin-left: .6vh;
		}
		.tooltip:before {
			width: 350%;
		}
		.tooltip-sidebar-home:before {
			padding-right: 7.5vh;
		}
		.tooltip-sidebar-user:before {
			padding-right: 7.5vh;
		}
		.tooltip-sidebar-book:before {
			padding-right: 9.5vh;	
		}
		.tooltip-sidebar-laptop:before {
			padding-right: 15vh;
		}
	}

@media only screen and (max-width: 1200px) {
    .profile-info {
        display: none;
    }
	.layout {
		grid:
    	"sidebar-top searchbar navigation-top sidebar-right" 3%
    	"sidebar-bottom secondary-field main-field sidebar-right-bottom" 1fr
		"bottombar-left bottombar-secondary bottombar-main bottombar-right" 6.5%
		/ 5.5% 5.5% 1fr 15%;
	}
	.profilepicture {
		margin-right: 0vh;
		margin-left: 20%;
	}
}

	.logo {
		transition: transform .15s; /* Animation */
		height: 2vh; 
		padding-top: 1vh;
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