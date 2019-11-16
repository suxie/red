/*global THREE*/

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var hero;
var sun;
var ground;
var orbitControl;

init();
function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene() {
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    scene = new THREE.Scene();//the 3d scene
    camera = new THREE.PerspectiveCamera( 75, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
    dom = document.getElementById('gameContainer');
	dom.appendChild(renderer.domElement);
	
	//add items to scene
	var cubeGeom = new THREE.BoxGeometry(1, 1, 1);//cube
	var cubeMat = new THREE.MeshPhongMaterial({ color: 0x87CEFA });
	cubeMat.shininess = 10.0;
	cubeMat.specular = new THREE.Color(0x87CEFA);
	cube = new THREE.Mesh(cubeGeom, cubeMat);
	cube.castShadow = true;
	cube.receiveShadow = false;
	cube.position.y = 1.5;
	scene.add(cube);
	var groundGeom = new THREE.PlaneGeometry(sceneWidth, sceneWidth, 5, 5);
	var groundMat = new THREE.MeshStandardMaterial({ color: 0xFFC0CB })
	ground = new THREE.Mesh(groundGeom, groundMat);
	ground.receiveShadow = true;
	ground.castShadow=false;
	ground.rotation.x=-Math.PI/2;
	scene.add(ground);

	camera.position.z = 5;
	camera.position.y = 1;
	
	sun = new THREE.DirectionalLight(0xFFFAFA, 1.5);
	sun.position.set(0, 6, 1);
	sun.castShadow = true;
	scene.add(sun);
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50 ;
  	
	window.addEventListener('resize', onWindowResize, false);//resize callback
}

function update(){
    //animate
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    render();
	requestAnimationFrame(update);//request next update
}
function render(){
    renderer.render(scene, camera);//draw
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}