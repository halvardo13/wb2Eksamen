//Disable UI for explore mode
document.getElementById("exploreUI_ID").disabled = true;
document.getElementById("costumMouseCourser").style.opacity = "0";

//Update donation progress from button
const donationBar = document.getElementById("donationProgress");
const donateMax = 10000;//donation goal
let donated = 4000;//donated amount
let percent = donated / donateMax * 100;
donationBar.style.width = percent+"%";
//called from HTML
function addToDonation(amount) {
	//Add amout which is defined in HTML where function is called
	donated += amount;
	//Get percantage of amount gained to donation goal
	let percent = donated / donateMax * 100;
	//Clamp percent between 0 and 100 so bar does not continue past container
	percent = clamp(percent, 0, 100);
	//Set the percent to CSS unit in percent
	donationBar.style.width = percent+"%";
}
window.addToDonation = addToDonation;

//Initilise aos library http://github.com/michalsnik/aos
AOS.init();

//Interpolation for smooth movement
function lerp(x, y, percent) {
	return x+(y-x)*percent;//https://en.wikipedia.org/wiki/Linear_interpolation
}
//Function for getting random number, (used for setting random positions within map)
function irandom_range(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Import three.js library
import * as THREE from "three";
//Import loader for obj models and materials
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
//Import user controls
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { clamp } from "three/src/math/MathUtils.js";

//Create the base scene, with fog and sky color
const scene = new THREE.Scene();
console.log(scene);
scene.background = new THREE.Color(0x276468);
scene.fog = new THREE.Fog(0xcccccc, 15, 75);

//Add raycaster for selecting 3D objects on hovering
const raycast = new THREE.Raycaster();
//Pointer to keep track of X and Y position of user mouse position
const pointer = new THREE.Vector2();

//Define light colors
const amiantLightColor = 0x404040;
const directionalLightColor = 0xff8319;
//Ambient light for base lighting
const light = new THREE.AmbientLight(amiantLightColor, 0.5);
scene.add( light );
//Direction light for ambiance (set to sunset position)
const directionalLight = new THREE.DirectionalLight(directionalLightColor, 0.7);
directionalLight.position.set(10, 5, -24);
scene.add(directionalLight);

//Create regular perspective camera 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
let resetPosCamera = 0;
let resetTargetCamera = 0;

//Animation path //https://threejs.org/docs/?q=CatmullRomCurve3#api/en/extras/core/Curve
//Define a curve path for camera to scroll trough when scrolling page.
const cameraCruve = new THREE.CatmullRomCurve3( [
	//Define the curve path
	new THREE.Vector3( 5, 5, -10),
	new THREE.Vector3( -5, 7, -10),
	new THREE.Vector3( -10, 10, -15),
	new THREE.Vector3( -10, 15, 15),
]);
//Divide the curve to 50 points, camera gets moved between these points
const points = cameraCruve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
//Add the curve to scene
const curveObject = new THREE.Line( geometry, material );
curveObject.visible = false; //make invisible
scene.add(curveObject);

//Loader for 3D Objects 
const loader = new GLTFLoader();
//Laod Main Forest Scene
let oForestScene = -4;
loader.load(
	//Link to 3d model
	'../Models_3d/fullForest.glb',
	//Called upon load
	function (gltf) {
		//Save refrence
		oForestScene = gltf;
		//Add object to scene
		scene.add(gltf.scene);
	},
);
//Array that holds all interacteble objects
//raycaster will only look for these objects
const allInteractives = [];
//infoText will hold information for interactables
const infoText = [];

//Array to store hover information, info is set within the next loop
infoText[0] = {
	name: "Replanting trees", //Main title
	desc: "Replaning damaged areas on all corners of the globe, with diverse tree types", //Descrition
	cost: "30 000", //Cost
	size: 2 //Size of object to represent the cost
}
infoText[1] = {
	name: "Cleaning efforts",
	desc: "Orginizing efforts to clean up trash in local communeties",
	cost: "20 000",
	size: 1.5
}
infoText[2] = {
	name: "Research funding",
	desc: "Funding for research in future technologies and other ways to protect the forest.",
	cost: "30 000",
	size: 1.75
}
infoText[3] = {
	name: "Sustainable Farming",
	desc: "Funding to help farms be sustainable for the furtue.",
	cost: "20 000",
	size: 1.5
}
infoText[4] = {
	name: "Education",
	desc: "Campaings to education about forest protection.",
	cost: "10 000",
	size: 1
}
infoText[5] = {
	name: "Wildlife",
	desc: "Preservation and protection of vunurable habitats for wildife",
	cost: "15 000",
	size: 1.25
}
infoText[6] = {
	name: "Land Areas",
	desc: "Buying land ares for legal protection",
	cost: "35 000",
	size: 2.15
}
infoText[7] = {
	name: "Trail signs",
	desc: "Setting up trail signs for better accses",
	cost: "2 000",
	size: 0.5
}
infoText[8] = {
	name: "Cameras",
	desc: "Wilflife monitoring with cameras",
	cost: "5 000",
	size: 0.75
}
const numberOfObjects = 9;
//Positions and map size
let mapSize = 35;
let xPos = 0;
let yPos = 0;
let zPos = 0;
//Interactables base geomatry and materials
const baseG = new THREE.IcosahedronGeometry(1, 0)
const baseM = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
//Loop the creation of interacable objects, and set information
for (let _i = 0; _i < numberOfObjects; _i++) {
	//Choose a random position 
	xPos = irandom_range(-mapSize, mapSize);
	yPos = irandom_range(-mapSize, mapSize);
	zPos = 8;
	//Create object (with base geometry and material)
	let interacableObject = new THREE.Mesh(baseG, baseM);
	//Set random positon within map
	interacableObject.position.set(xPos, zPos, yPos);
	//Set size based on how much money was spent
	interacableObject.scale.set(infoText[_i].size, infoText[_i].size, infoText[_i].size);
	//Set the information
	interacableObject.userData = {
		titleName : infoText[_i].name,
		desc : infoText[_i].desc,
		cost : infoText[_i].cost
	}
	//Make invisible - gets reactivated in exlpore mode
	interacableObject.visible = false;

	//Add to scene and array
	allInteractives.push(interacableObject);
	scene.add(interacableObject);
}

//Keeps text from constantly updateing when not hovering anything, otherwise links will not work
let constatUpdateSafeGuard = false;

//Function for updating text on hovering
const exploreLayerUI = document.getElementById('exploreUI_ID');
function displayInfoToUser(resetText, storeObj) {
	if (resetText == false) {
		//Set new text
		if (constatUpdateSafeGuard == true) exploreLayerUI.innerHTML = `<h2>${storeObj.titleName}</h2><p>${storeObj.desc}</p><p>Cost: ${storeObj.cost}$</p>`;
		constatUpdateSafeGuard = false;
	}
	else {
		//Reset template text
		if (constatUpdateSafeGuard == false) exploreLayerUI.innerHTML = `<h2>Exploring the forest</h2><p>Left click and drag to rotate camera. Right click and drag to pan camera. Scroll to Zoom.</p><p>Hover white objects to read.</p><button onclick="userResetCamera();">Reset Camera</button><a href="">Return to page</a>`;
		constatUpdateSafeGuard = true;
	}
}
const readBudgetRef = document.getElementById('readBudget');
const buttonBudget = document.getElementById('buttonBudget');
let budgetVeiw = false;
//For users who dont want to / cannot use the 3D interactive scene, but still want to veiw budget
function readBudgetInHTML() {
	if (budgetVeiw == false) {
		let str = "";
		let currrent = 0;
		//Loop interactables and display its info to div
		for (let _i = 0; _i < numberOfObjects; _i++) {
			currrent = allInteractives[_i].userData;
			str += `<h2>${currrent.titleName}</h2><p>${currrent.desc}</p><p>Cost: ${currrent.cost}$</p>`;
		}
		readBudgetRef.innerHTML = str;
		buttonBudget.innerHTML = "Close budget";
	} else {
		//Close budget
		readBudgetRef.innerHTML = '';
		buttonBudget.innerHTML = "Open budget";
	}
	//Toggle button
	budgetVeiw = !budgetVeiw;
}
window.readBudgetInHTML = readBudgetInHTML;

//Get the canvas and apply to renderer
const canvas = document.querySelector(".render3d");
const renderer = new THREE.WebGLRenderer({canvas : canvas});
//Set size
renderer.setSize(window.innerWidth, window.innerHeight);

//Add orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
//controls.autoRotate = true;
controls.autoRotateSpeed = 1;

//Grid helper
const gridHelp = new THREE.GridHelper(16, 16);
gridHelp.position.y -= 0.5;
scene.add(gridHelp);

//Track if user is veiwing HTML or exploring 3D Scene
let globalGameSetting = 0;

//Lerp speeds for smooth scrolling
//let lerpAmountSpd = 0.02;
let lerpScrollBar = 0.1;
//Scrollbar
let scrollBarW = 0;
//Target Position in animation
let cameraPositionFromCurve = 0;
//Camera offset positions
let cameraOffset = new THREE.Vector3();
let cameraLockTo = true;;
//Circle Mouse
const circleMouse = document.getElementById("costumMouseCourser");
//Tracks user scroll position in percent (0 to 1) where 1 is fully scrolled down. Used from camera animation
let yPosScroll = 0;
let yPosScrollLerp = 0; //This will lerp each frame towards the yPosScroll which is updated onscroll

/*Functions for gameloop*/
//Handles scrolling camera along curve + camera offset based on mouse
function UpdateScrollingAndCamera() {
	//Intorpolaite the position towards yPosScroll
	yPosScrollLerp = lerp(yPosScrollLerp, yPosScroll, 0.05);
	//Animate camera along curve based on scroll position
	cameraPositionFromCurve = cameraCruve.getPoint(yPosScrollLerp);
	camera.position.copy(cameraPositionFromCurve);
	//Offset camera slightly based on mouse position
	cameraOffset.x = lerp(cameraOffset.x, -pointer.x, 0.03);
	cameraOffset.y = lerp(cameraOffset.y, pointer.y, 0.03);
	//Set final camera position
	camera.lookAt(cameraOffset);
	camera.updateMatrixWorld();
}

let waveTimer = 0;

//Game Loop
function gameLoop() {
	//Call self so game loop runs every frame
	requestAnimationFrame(gameLoop);

	//Wave effect for interactables
	const generalTimer = performance.now() * 0.001;
	waveTimer = Math.sin((generalTimer * 1)+1) * 2;

	//Check if in nomal HTML or in explore mode
	if (globalGameSetting == 0) { 
		//Normal HTML mode
		//Update scrolling and camera only when veiwing HTML
		UpdateScrollingAndCamera();
	}
	else { //In explore mode
		//User reset camera position
		if (cameraLockTo == true) {
			camera.position.copy(resetPosCamera);
			controls.target.copy(resetTargetCamera);
			controls.update();
			cameraLockTo = false;
		}

		//Update orbit controls
		controls.update();
		//Raycaster for interacable - looks for objects based on courser position
		raycast.setFromCamera(pointer, camera);
		//Look for only interactables
		const intersects = raycast.intersectObjects(allInteractives);
		if (intersects.length > 0) {
			//Refrece to hover object
			let objFound = intersects[0];

			//Display info from interactable to user
			displayInfoToUser(false, objFound.object.userData);
			console.log(objFound.object.userData);
			
		}
		else {
			//Reset text when not hovering
			displayInfoToUser(true, -4);

		}
		//Loop interactables to update the yposition for wave effetc
		for (let _i = 0; _i < allInteractives.length; _i++) {
			allInteractives[_i].position.y = 6-(waveTimer*0.35);

		}
	}

	//Render the Final 3D Scene
	renderer.render(scene, camera);
}
//Initiate the game loop - will continue to call itsleft using animation frames
gameLoop();

//Keep mouse position updated
function UpdateMousePos(e) {
	circleMouse.style.left = e.clientX+"px";
	circleMouse.style.top = e.clientY+"px";
	/*https://threejs.org/docs/index.html?q=raycast#api/en/core/Raycaster*/
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}
document.addEventListener('mousemove', UpdateMousePos); //update on mouse move
//Update on scolling
function UpdateUserScroll() {
	//Keep track of users scolling the document. Saves as percentage between 0 and 1
	//This will controll most of the animatied objects in the scene
	yPosScroll =  window.scrollY / (document.body.clientHeight - window.innerHeight);
}
document.addEventListener('scroll', UpdateUserScroll); //Update on scroll

//Toggle explore mode
const mainDiv = document.getElementById('mainID');
const exploreModeUI = document.getElementById('exploreUI');
function toggleForest() {
	//
	if (globalGameSetting == 0) {
		//Enable explore UI
		exploreLayerUI.style.opacity = "1";
		exploreLayerUI.disabled = false;
		exploreLayerUI.style.display = "flex";
		document.getElementById("costumMouseCourser").style.opacity = "1";
		//Make sure body does not block for obit controls
		document.getElementById("bodyID").style.width = "fit-content";
		//Hide main content and reset scroll position to make UI visible
		document.getElementById("headerID").style.display = "none";
		document.getElementById("footerID").style.display = "none";
		mainDiv.style.display = "none";
		window.scrollTo(0, 0);
		globalGameSetting = 1;

		//Deafult cam pos
		camera.position.set(7, 10, 7);
		resetPosCamera = camera.position.clone();
		resetTargetCamera = controls.target.clone();

		//Make interactables visible
		for (let _i = 0; _i < numberOfObjects; _i++) {
			allInteractives[_i].visible = true;
			console.log(allInteractives[_i].visible);
		}
	}
}
document.getElementById("exploreForestID").addEventListener("click", toggleForest);
//document.getElementById("exit_exploreForestID").addEventListener("click", toggleForest);

//Update aspect ration of the canvas whenever window size is changed on resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//Initiate a camera and orbit controls reset - user can call from button if they zoom or pan too much away from scene
function userResetCamera() {
	cameraLockTo = true;
}
window.userResetCamera = userResetCamera;