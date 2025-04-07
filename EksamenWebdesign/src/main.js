function lerp(x, y, percent) {
	//Interpolation for smooth movement
	return x+(y-x)*percent;
}
//Make sure HTMML loads from top. (refresh without this causes user to stay where they refresed)
window.scrollTo(0, 0);

//Import three.js library, located in node_modules
import * as THREE from "three";
//Import loader for obj models and materials
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//Import user controls
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//Create a three scene
const scene = new THREE.Scene();
console.log(scene);
scene.background = new THREE.Color(0x276468);
//scene.fog = new THREE.Fog(0xcccccc, 15, 20);

//Raycaster for mouse interactivity
const raycast = new THREE.Raycaster();
const pointer = new THREE.Vector2();
//Lighting colors in hex
const directionalLightColor = 0xff8319;
const amiantLightColor = 0x404040;
//Ambient light
const light = new THREE.AmbientLight(amiantLightColor, 0.5);
scene.add( light );
const directionalLight = new THREE.DirectionalLight(directionalLightColor, 0.7);
directionalLight.position.set(10, 5, -24);
scene.add(directionalLight);
//helper
const helperdir = new THREE.DirectionalLightHelper(directionalLight, 2);
scene.add( helperdir );

//Load Ground
const loader = new GLTFLoader();

//Laod Main Forest Scene
let oForestScene = -4;
loader.load(
	//Link to 3d model
	'../Models_3d/forestScene_wip.glb',
	//Called upon load
	function (gltf) {
		//Save refrence
		oForestScene = gltf;
		//Add object to scene
		scene.add(gltf.scene);
	},
);

//Create Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
//Position camera
camera.position.set(5, 5, -5);

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

//Lerp speeds
let lerpAmountSpd = 0.02;
let lerpScrollBar = 0.1;
//Camera zoom animate
let zoomCamera = 0.5;
let zoomTo = 2;
//Scrollbar
let scrollBarW = 0;
//Target Position in animation
let cameraTargetZ = 15;
let cameraTargetY = 5;


//Game Loop
function gameLoop() {
	requestAnimationFrame(gameLoop);
	//Check for forest scene (if forest scene is loaded, all other objects should be loaded aswell)
	if (oForestScene != -4) {
		//Rotate forest scene on scrolling
		oForestScene.scene.rotation.y = lerp(oForestScene.scene.rotation.y, 1.5*yPosScroll, lerpAmountSpd);
	

	}
	//Camera movement on scroll
	zoomTo = 1.5-(zoomCamera*yPosScroll);
	camera.zoom = lerp(camera.zoom, zoomTo, lerpAmountSpd);
	camera.updateProjectionMatrix();
	//Animate camera backwards and slightly up
	camera.position.z = 5+(cameraTargetZ*yPosScroll);
	camera.position.y = 5+(cameraTargetY*yPosScroll);
	//Update scrollbar
	scrollBarW = lerp(scrollBarW, 320*yPosScroll, lerpScrollBar);
	document.getElementById("progressScroll").style.width = scrollBarW+"px";


	//Raycaster 
	raycast.setFromCamera(pointer, camera);
	const intersects = raycast.intersectObjects(scene.children);
	if (intersects.length > 0) {
		/*
		let objFound = intersects[0];
		objFound.highlight(true);
		console.log(objFound);
		*/
	}
	
	//Update controls
	controls.update();
	//Render Final 3D Scene
	renderer.render(scene, camera);
}

//Keep mouse position updated
function UpdateMousePos(e) {
	/*https://threejs.org/docs/index.html?q=raycast#api/en/core/Raycaster*/
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}
document.addEventListener('mousemove', UpdateMousePos);
//Update on scolling
let yPosScroll = 0;
function UpdateUserScroll() {
	//Keep track of users scolling the document. Saves as percentage between 0 and 1
	//This will controll most of the animatied objects in the scene
	yPosScroll =  window.scrollY / (document.body.clientHeight - window.innerHeight);
	//console.log(yPosScroll);
}
document.addEventListener('scroll', UpdateUserScroll);

//Run the Game Loop
gameLoop();

//Funtions called in HTML
let isDay = true;

//
function buttonTest() {
	if (isDay == false) {
		scene.background = new THREE.Color(0x276468);
	}
	else scene.background = new THREE.Color(0x000000);
	isDay = !isDay;
}
document.getElementById("testButtonID").addEventListener("click", buttonTest);