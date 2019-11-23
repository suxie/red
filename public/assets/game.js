/*global THREE*/

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var player;
var ground;
var box;
var jump = 0.0;
var tick = 0.0;
var clockTick = 0.0;
var plantRate = 600;
var trees = [];

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
		scene.fog = new THREE.Fog(0x1C2F2F, -8, -20);
    camera = new THREE.PerspectiveCamera( 75, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
		dom = document.getElementById('gameContainer');
		clock = new THREE.Clock();
	dom.appendChild(renderer.domElement);
	
	//add items to scene
	var sphereGeom = new THREE.SphereGeometry(0.2, 30, 30); //sphere
	var spherePhong = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
	spherePhong.shininess = 0.5;
	spherePhong.specular = new THREE.Color(0x87CEFA);
	player = new THREE.Mesh(sphereGeom, spherePhong);
	player.castShadow = true;
	player.receiveShadow = false;
	player.position.y = 0.25;
	player.position.z = 4.0;
	scene.add(player);

	var groundGeom = new THREE.CylinderGeometry(5, 5, sceneWidth);
	groundGeom.rotateZ(Math.PI / 2.0);
	groundGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -4.1, 1));
	groundGeom.computeBoundingBox();

	// groundGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -4.1, 1));
	var groundMat = new THREE.MeshStandardMaterial({ color: 0x1C1D2F });
	ground = new THREE.Mesh(groundGeom, groundMat);
	
	box = ground.geometry.boundingBox.clone();
	box.center(ground.geometry.position); // this re-sets the mesh position
	ground.receiveShadow = true;
	ground.castShadow = false;
	ground.rotation.Z = Math.PI / 2.0;
	scene.add(ground);

	var skyGradGeom = new THREE.PlaneGeometry(sceneWidth * 10, sceneHeight * 10);
	skyGradGeom.translate(0, 0, -sceneWidth - 10);
	skyGradGeom.scale(1, 1, 1);
	var skyMat = new THREE.MeshStandardMaterial({ color: 0x462E5E })
	var skyGrad = new THREE.Mesh(skyGradGeom, skyMat);
	skyGrad.receiveShadow = false;
	skyGrad.castShadow=false;
	scene.add(skyGrad);

	var horizonGeom = new THREE.PlaneGeometry(sceneWidth * 10, sceneHeight * 0.05);
	horizonGeom.translate(0, 0, -sceneWidth);
	horizonGeom.scale(1, 1.5, 1);
	var horizonMat = new THREE.MeshStandardMaterial({ color: 0x1C2F2F })
	var horizon = new THREE.Mesh(horizonGeom, horizonMat);
	horizon.receiveShadow = false;
	horizon.castShadow=false;
	scene.add(horizon);

	camera.position.z = 5;
	camera.position.y = 1;
	
	var sun = new THREE.DirectionalLight(0xD3B5FF, 1.5);
	sun.position.set(0, 50, 0);
	sun.castShadow = true;
	scene.add(sun);
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 90;
	
	var helper = new THREE.DirectionalLight(0x7B68EE, 0.8);
	helper.position.set(0, 0, 1.0);
	helper.castShadow = false;
	scene.add(helper);

	var ambient = new THREE.AmbientLight(0x483D8B, 0.75);
	scene.add(ambient);
  	
	window.addEventListener('resize', onWindowResize, false);//resize callback
	document.onkeydown = updateVelocity;
}

function updateVelocity(keyEvent){
	var vector = new THREE.Vector3();
	vector.project(camera);

	vector.x = (player.position.x * sceneWidth / 2.0) + sceneWidth / 2.0;
	vector.y = -(player.position.y * sceneHeight / 2.0 ) + sceneHeight / 2.0;

	if (keyEvent.keyCode === 37) { // left arrow
		if (vector.x > 100) {
			player.position.x -= 0.1;
		}
	} else if (keyEvent.keyCode === 39) { // right arrow
		if (vector.x < sceneWidth - 100) {
			player.position.x += 0.1;
		}
	} else if (keyEvent.keyCode === 32){ // spacebar jump 
		jump = 0.02;
	}
}

function update() { // animate
		//update player
		clockTick++;
		player.position.y += 0.0003 * Math.sin(3 * clock.getElapsedTime()) + jump;
		if (jump === 0.02 && tick < 10.0) {
			tick++;
		} else if (jump === 0.02) {
			jump = -0.02;
			tick = 0.0;
		} else if (jump === -0.02 && tick < 10.0) {
			tick++;
		} else {
			jump = 0.0;
			tick = 0.0;
		}

		// ground.rotation.x += 0.01;
		if (clockTick % plantRate === 0.0) {
			if(plantRate > 400) {
				plantRate -= 10;
			}
			var tree = plant();
			tree.position.x = Math.random() * 2 - 1;
			tree.position.y = -0.4;
			tree.position.z = -20;
			trees.push(tree);
			ground.add(tree);
		}

		for (var i = 0; i < trees.length; i++) {
			trees[0].position.z += 0.025;
			if (trees[i].position.z > 5) {
				ground.remove(trees[i]);
				trees.shift();
			}
		}
		ground.updateMatrixWorld(true);
		box.copy(ground.geometry.boundingBox).applyMatrix4(ground.matrixWorld);
		
		render();
	requestAnimationFrame(update); //request next update
}

function plant() {
	var treeGeom = new THREE.ConeGeometry(0.75, 3.5, 8, 6);
	var treeMat = new THREE.MeshStandardMaterial({ color: 0x008080, shading:THREE.FlatShading });
	var tree = new THREE.Mesh(treeGeom, treeMat);
	console.log("planting tree")
	return tree;
}

function render(){
		renderer.setClearColor(0x13134B, 1);
    renderer.render(scene, camera); //draw
}

function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}