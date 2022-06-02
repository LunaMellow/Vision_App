<!-- onMount(()=>{
	isPageLoaded=true;
}); -->

<script src="index.js">
	// import { Circle3 } from 'svelte-loading-spinners'
	export let name;
	export let id;

	/* SHOW ABOUT TAB */
	function showAbout() {
		var showElement = document.getElementById("layout");
		showElement.style.display === "none"
	}
	/*-------------------*/


	/* SHOW PROJECTS TAB */
	function showProjects() {

	}	
	/*-------------------*/


	/* SHOW PROJECTS TAB */
	function showDevProc() {

	}	
	/*-------------------*/


	/* SHOW PROJECTS TAB */
	function showSettings() {

	}	
	/*-------------------*/
	
</script>

<main>
	<body onLoad="loadingAnimation()" class="layout fadein-2s">
		<!-- <Circle3 size="80" color="#FF3E00" unit="px" duration="2s" style="position:absolute; Top:50%; Left:50%; display: flex; align-items: center; justify-content: center;" id = "loadingDots"></Circle3> -->
		<!-- <div id="home"> -->
			<div class="sidebar-top noselect">
			</div>
			<div class="secondary-field noselect">
				<ul class="cards fadein-2s" style="overflow-y: scroll">
					<h3 style="color:lightgray; border-bottom: solid 0.2vh #3a4f84; padding-bottom: 1.5vh; width: 80%; margin-right: 10%; margin-left: 8.5%">Incoming Messages</h3>
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">franksfan</h4>
								<h6 class="item-name color-grey">🍌 Nanism</h6>
								<h6 class="item-message">➤ How's u doing?</h6>
							</div>
						</div>
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">Definitely Luna</h4>
								<h6 class="item-name color-grey">❤️ Love EMERGY DWINKS</h6>
								<h6 class="item-message">➤ Goodmorning</h6>
							</div>
						</div >
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">RosePhoenix</h4>
								<h6 class="item-name color-grey">Catgirl</h6>
								<h6 class="item-message">➤ [Attachment] </h6>
							</div>
						</div>
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">Raccoonooo</h4>
								<h6 class="item-name color-grey">😩 we live on lies</h6>
								<h6 class="item-message">➤ Kommer du på skolen imorgen?</h6>
							</div>
						</div>
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">Toro</h4>
								<h6 class="item-name color-grey">🙄 Based</h6>
								<h6 class="item-message">➤ bruker 80 nå</h6>
							</div>
						</div>
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">Drox</h4>
								<h6 class="item-name color-grey">💀 Firkant</h6>
								<h6 class="item-message">➤ Nattiii natt 💕</h6>
							</div>
						</div>
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">Marryc</h4>
								<h6 class="item-name color-grey"><span style="font-weight: bold">Playing</span> Minecraft</h6>
								<h6 class="item-message">➤ Stopp å erp'e! La meg joineee!!</h6>
							</div>
						</div>
					</li>    
					<li>
						<div class="items">
							<div class="item-text">
								<h4 class="item-name">Gangstergruppa</h4>
								<h6 class="item-name color-grey">Luna, Peder, Brage, Tor Oskar...</h6>
								<h6 class="item-message">➤ Har vi fri imorgen?</h6>
							</div>
						</div>
					</li>    
				</ul>
			</div>
			<div class="searchbar noselect">
				<!-- <h3 class="searchbar-field noselect">Search a keyword</h3> -->
				<h6 id="app-version">Vision v.2.4</h6>
			</div>
			<div class="navigation-top noselect">
			</div>
			<div class="sidebar-right noselect">
			</div>
			<div class="sidebar-bottom noselect">
				<span data-text="Hi {name}!" class="tooltip fadein-2s"><img class="logo" src="https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png" alt="Vision"></span>
				<!-- <h4 class="profile-name">{name}#{id}</h4> -->
				<div class="sidebar">
					<span data-text="Home" class="tooltip-sidebar-home"><button class="sidebar-buttons fadein-3s"><i class="fa fa-home"></i></button></span>
					<span data-text="About" class="tooltip-sidebar-user"><button class="sidebar-buttons fadein-4s" onclick="showAbout()"><i class="fa fa-user"></i></button></span>
					<span data-text="Projects" class="tooltip-sidebar-book"><button class="sidebar-buttons fadein-5s" onclick="showProjects()"><i class="fa fa-book"></i></button></span>
					<span data-text="Development" class="tooltip-sidebar-laptop"><button class="sidebar-buttons fadein-6s" onclick="showDevProc()"><i class="fa fa-laptop"></i></button></span>
				</div>
			</div>
			<div class="main-field noselect">
				<div class="main-field-container">
					<div class="main-content">
						<div class="main-top-left main-box">
							<div class="main-top-left-text">
								<h4 id="fullstack-title">Fullstack DEV</h4>
								<h1 id="name-title">Luna Sofie Bergh</h1>
							</div>
						</div>
						<div class="main-top-right main-box">  <!-- https://github.com/LunaMellow https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Repl.it_logo.svg/1200px-Repl.it_logo.svg.png -->
							<div class="socials">
								<a href="https://github.com/LunaMellow"><img src="https://cdn.discordapp.com/attachments/640641733151162388/982030723550707762/git.png" alt="GIT" style="height: 5vh; float: right; margin-right: 1vh; margin-top: 1vh;"></a>
								<a href="https://replit.com/@LunaMellow"><img src="https://cdn.discordapp.com/attachments/640641733151162388/982032293151535194/repl.png" alt="GIT" style="height: 5vh; float: right; margin-right: 1vh; margin-top: 1vh;"></a>
							</div>
						</div>
						<div class="main-middle-left main-box">
							<div class="wrapper">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982049506206040084/1.png" alt="s">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982049506633863198/2.png" alt="s">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982049507191713804/3.png" alt="s">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982049507623706654/4.png" alt="s">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982049507921506304/5.png" alt="s">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982049508168982538/6.png" alt="s">
								<img class="slideshow" src="https://media.discordapp.net/attachments/640641733151162388/982050416458076210/7.png" alt="s">
								<img class="slideshow" src="https://cdn.discordapp.com/attachments/640641733151162388/982050416667811840/8.png" alt="s">
							  </div>
						</div>
						<div class="main-middle-right main-box">
							<div class="news">

							</div>
						</div>
						<div class="main-bottom main-box">
					</div>
				</div>
			</div>
			<div class="sidebar-right-bottom noselect">8</div>
			<div class="bottombar-left noselect">
				<button class="sidebar-buttons fadein-6s" onclick="showSettings()"><i class="fa fa-gear"></i></button>
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
		<!-- </div> -->
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

	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

	/* @font-face {
		font-family: '';
		src: url('') format('');
	} */


	main {
		font-family: 'Noto Sans', sans-serif;		
		overflow-y: hidden;
		text-align: center;
		max-width: 240px;	
	}
	body {
		padding: 0px;
		font-family: 'Noto Sans', sans-serif;	
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

	/* .layout {
  		width: 100%;
  		height: 100vh;
  		display: grid;
  		grid:
    	"sidebar-top searchbar navigation-top sidebar-right" 3%
    	"sidebar-bottom secondary-field main-field sidebar-right-bottom" 1fr
		"bottombar-left bottombar-secondary bottombar-main bottombar-right" 6.5%
		/ 4.5% 15% 1fr 15%;
  		gap: 0px;
	} */

.main-content {
	margin-top: 5%;
	text-align: center;
	width: 100%;
	height: 100vh;
	display: grid;
	grid:
		"main-top-left main-top-left main-top-right main-top-right" 10%
		"main-middle-left main-middle-left main-middle-right main-middle-right" 40%
		"main-bottom main-bottom main-bottom main-bottom" 10%
		/ 35% 25% 20% 10%;
	gap: 2%;
}

.main-top-left { grid-area: main-top-left; }

.main-top-right { 
	grid-area: main-top-right; 
}

.main-middle-left { 
	grid-area: main-middle-left; 
	overflow: hidden;
	border-radius: 1vh;
	box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

.main-middle-right { grid-area: main-middle-right; }

.main-bottom { 
	grid-area: main-bottom; 
}

.main-box {
	border: solid .4vh #192030;
} 

.main-top-left-text {
	text-align: left;
	line-height: .8vh;
	font-size: 120%;
	color: rgb(226, 226, 226);
}

.wrapper{
    width: 100%;
    display: flex;
    animation: slide 23s infinite;
}

.slideshow{
    width: 100%;
	border-radius: 1vh;
}

@keyframes slide{
    0%{
        transform: translateX(0);
    }
    5%{
        transform: translateX(0);
    }
    15%{
        transform: translateX(-100%);
    }
    20%{
        transform: translateX(-100%);
    }
    30%{
        transform: translateX(-200%);
    }
    35%{
        transform: translateX(-200%);
    }
    45%{
        transform: translateX(-300%);
    }
    50%{
        transform: translateX(-300%);
    }
	60%{
        transform: translateX(-400%);
    }
    65%{
        transform: translateX(-400%);
    }
	75%{
        transform: translateX(-500%);
    }
    80%{
        transform: translateX(-500%);
    }
	90%{
        transform: translateX(-600%);
    }
    95%{
        transform: translateX(-600%);
    }
	100%{
        transform: translateX(0%);
	}
}  

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
	font-family: 'Noto Sans', sans-serif;	
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
		padding-right: 5.5vh;
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
		padding-right: 6.5vh;
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
		padding-right: 10.5vh;
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
			padding-right: 16vh;
		}

		.main-content {
			margin-top: 2%;
			text-align: center;
			width: 100%;
			height: 100vh;
			display: grid;
			grid:
				"main-top-left main-top-left main-top-right main-top-right" 10%
				"main-middle-left main-middle-left main-middle-right main-middle-right" 40%
				"main-bottom main-bottom main-bottom main-bottom" 30%
				/ 25% 25% 15% 15%;
			gap: 5%;
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

	.cards {
		display: grid;
		margin: 1vh;
		list-style-type: none;
		padding: .0vh;
		margin-top: 0vh;
	}

	.items {
		background: #222939;
		margin: 1vh;
		padding-top: .1vh;
		border-radius: 1vh;
		text-align: left;
		box-shadow: 0vh .5vh .5vh rgba(0,0,0,0.15);
		transition: transform 0.1s ease-in-out;

	}

	.items:hover {
		transform: scale(1.05);
	}

	.item-text {
		line-height: 0vh;
		color: white;
		padding: 0vh;
		margin: 0vh;
	}

	.item-message {
		padding: 1.5vh;
		border-radius: .5vh;
		background: rgb(73, 93, 149);
		box-shadow: 0 1px 2px rgba(0,0,0,0.15);
		transition: box-shadow 0.2s ease-in-out;
		transition: transform 0.1s ease-in-out;
	}

	.item-message:hover {
		transform: scale(1.05);
		box-shadow: 0 5px 15px rgba(0,0,0,0.3);
		background: #3a4f84;
	}

	.item-name {
		margin-left: 1vh;
	}

	.color-grey {
		color: rgb(138, 138, 138);
	}

	@media only screen and (max-width: 1200px) {
    .cards {
        display: none;
    }
	#app-version {
		display: none;
	}
	}

	#app-version {
		margin-top: 3%;
		margin-bottom: 2.5%;
	}

	.socials {
		margin-top: 2vh;
		padding-bottom: 7vh;
		border-radius: 1vh;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		border: solid .4vh #192030;
	}

	.news {
		border-radius: 1vh;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		border: solid .4vh #192030;
		padding-bottom: 121%
	}

	#fullstack-title {
		background: -webkit-linear-gradient(left, rgb(240, 72, 255), rgb(52, 214, 255)); 
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent; 
		padding: .4vh;
		transition: transform .15s; /* Animation */
	}

	#fullstack-title:hover {
		transform: translate(10px,0);
	}

	#name-title {
		margin-left: 0.3vh;
		transition: transform .15s; /* Animation */
	}

	#name-title:hover {
		margin-left: 0.3vh;
		transform: translate(20px,0);
	}

	@media only screen and (max-width: 1200px) {
		.socials {
			margin-top: 4vh;
			padding-bottom: 7.5vh;
		}

		.main-top-left-text {
			font-size: 100%;
		}

		.news {
			padding-bottom: 97%
		}
		#fullstack-title {
			padding-top: .6vh;
			padding-bottom: .8vh;
		}
	}
</style>