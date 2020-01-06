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
var plantRate = 500;
var rockRate = 621;
var rocks = [];
var trees = [];
var forest = [];
var endgame = false;
var score = 0;
var scorediv;
var scoreh2;
var menubar;
var screen;

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
	scene.fog = new THREE.FogExp2(0x093767, 0.24);
  camera = new THREE.PerspectiveCamera( 75, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
  renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
  renderer.shadowMap.enabled = true;//enable shadow
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( sceneWidth, sceneHeight );
	dom = document.getElementById('gameContainer');
	scorediv = document.getElementById('score');
	scoreh2 = document.createElement("h2");
	var text = document.createTextNode(score);
	scoreh2.appendChild(text);
	scorediv.appendChild(scoreh2);

	menubar = document.getElementById('menu');
	menubar.classList.add("pause");
	pause = false;
	clock = new THREE.Clock();
	dom.appendChild(renderer.domElement);

	screen = document.getElementById('popup');

	var h1 = document.createElement('h4');
	var i1 = document.createTextNode('use Arrows to move right or left');
	var h2 = document.createElement('h4');
	var i2 = document.createTextNode('press Spacebar to jump');
	h1.appendChild(i1);
	h2.appendChild(i2);
	screen.appendChild(h1);
	screen.appendChild(h2);
	
	//add items to scene
	var objLoader = new THREE.OBJLoader();
	var mtlLoader = new THREE.MTLLoader();

	mtlLoader.load('/public/assets/hero.mtl', function (materials) {
		materials.preload();

		objLoader.setMaterials(materials);
		objLoader.load('/public/assets/hero.obj',	function (object) {	
			window.player = object;
			object.scale.x = 0.015;
			object.scale.y = 0.015;
			object.scale.z = 0.015;
			object.position.z = 4.8;
			object.position.y = 0.85;
			object.rotation.y = Math.PI / 2;
			object.castShadow = true;
			object.receiveShadow = false;
			scene.add(object);
		})
	})
	
	var sphereGeom = new THREE.SphereGeometry(0.2, 30, 30); //sphere
	var spherePhong = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
	spherePhong.shininess = 0.5;
	spherePhong.specular = new THREE.Color(0x87CEFA);
	player = new THREE.Mesh(sphereGeom, spherePhong);
	// player.castShadow = true;
	// player.receiveShadow = false;
	// player.position.y = 0.25;
	// scene.add(player);

	var groundGeom = new THREE.CylinderGeometry(200, 200, sceneWidth);
	groundGeom.rotateZ(Math.PI / 2.0);
	groundGeom.scale(1.0, 1.0, 10.0);
	groundGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -199.05, 0));
	groundGeom.computeBoundingBox();

	var groundMat = new THREE.MeshStandardMaterial({ color: 0xA8D3D6 });
	ground = new THREE.Mesh(groundGeom, groundMat);
	
	box = ground.geometry.boundingBox.clone();
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
	// scene.add(skyGrad);

	var horizonGeom = new THREE.PlaneGeometry(sceneWidth * 10, sceneHeight * 0.05);
	horizonGeom.translate(0, 0, -sceneWidth);
	horizonGeom.scale(1, 1.5, 1);
	var horizonMat = new THREE.MeshStandardMaterial({ color: 0x1C2F2F })
	var horizon = new THREE.Mesh(horizonGeom, horizonMat);
	horizon.receiveShadow = false;
	horizon.castShadow=false;
	// scene.add(horizon);

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
	document.onmousedown = menu;
}

function updateVelocity(keyEvent) {
	var vector = new THREE.Vector3();
	vector.project(camera);

	vector.x = (player.position.x * sceneWidth / 2.0) + sceneWidth / 2.0;
	vector.y = -(player.position.y * sceneHeight / 2.0 ) + sceneHeight / 2.0;

	if (keyEvent.keyCode === 37) { // left arrow
		if (vector.x > sceneWidth * 0.41) {
			player.position.x -= 0.015;
		}
	} else if (keyEvent.keyCode === 39) { // right arrow
		if (vector.x < sceneWidth - sceneWidth * 0.41) {
			player.position.x += 0.015;
		}
	} else if (keyEvent.keyCode === 32) { // spacebar jump 
		jump = 0.005;
	}
}

// play and pause
function menu(event) {
	if (event.clientX > 20 && event.clientX < 50 && 
		event.clientY > 20 && event.clientY < 50) {
			if (menubar.classList[0] === "pause" && !endgame) {
				menubar.classList.remove("pause");
				menubar.classList.add("play");

				screen.classList.add("screen");

				while (screen.childNodes.length > 0) {
					screen.removeChild(screen.firstChild);
				}

				var h1 = document.createElement('h2');
				var i1 = document.createTextNode('PAUSE');
				var h2 = document.createElement('h5');
				var i2 = document.createTextNode('use Arrows to move right or left');
				var h3 = document.createElement('h5');
				var i3 = document.createTextNode('press Spacebar to jump');
				h1.appendChild(i1);
				h2.appendChild(i2);
				h3.appendChild(i3);
				screen.appendChild(h1);
				screen.appendChild(h2);
				screen.appendChild(h3);

				var form = document.createElement('FORM');
				form.method = 'POST';
				var button = document.createElement('BUTTON');
				button.type = 'SUBMIT';
				button.classList.add('end');
				var exit = document.createTextNode('EXIT GAME');
				button.appendChild(exit);
				form.appendChild(button);
				screen.appendChild(form);

				pause = true;

			} else if (menubar.classList[0] === "play") {
				menubar.classList.remove("play");
				menubar.classList.add("pause");
				screen.classList.remove("screen");

				while (screen.childNodes.length > 0) {
					screen.removeChild(screen.firstChild);
				}

				pause = false;
				requestAnimationFrame(update);
			}			
		}
}

function update() { // animate
	//update player
	clockTick++;
	player.position.y += 0.00007 * Math.sin(3 * clock.getElapsedTime()) + jump;
	if (jump === 0.005 && tick < 25.0) {
		tick++;
	} else if (jump === 0.005) {
		jump = -0.005;
		tick = 0.0;
	} else if (jump === -0.005 && tick < 25.0) {
		tick++;
	} else {
		jump = 0.0;
		tick = 0.0;
	}

	// bring player back to correct height
	while (player.position.y > 0.85 + 0.00007 * Math.sin(3 * clock.getElapsedTime()) && jump === 0.0) {
		player.position.y = 0.85 + 0.00007 * Math.sin(3 * clock.getElapsedTime())
	}

	// generate trees
	if (clockTick % plantRate === 0.0) {
		if(plantRate > 200) {
			plantRate -= 10;
		}
		var tree = plant();
		tree.position.x = Math.random() * 0.3 - 0.15;
		tree.position.y = 0.1;
		tree.position.z = -10;
		trees.push(tree);
		ground.add(tree);
	}

	// generate rocks
	if (clockTick % rockRate === 0.0) {
		if (rockRate > 300) {
			rockRate -= 10;
		}
		var rock = genRock();
		rock.position.x = Math.random() * 0.3 - 0.15;
		rock.position.y = 1.07;
		rock.position.z = -10;
		rocks.push(rock);
		ground.add(rock);
	}

	// generate forest 
	if (clockTick % 10 === 0.0) {
		var trunk = genForest();
		var left = Math.random();
		if (left < 0.5) {
			trunk.position.x = Math.random() * -2 - 0.5;
		} else {
			trunk.position.x = Math.random() * 2 + 0.5;
		}
		trunk.position.y = 0.1;
		trunk.position.z = -10;
		forest.push(trunk);
		ground.add(trunk);
	}

	// update trees
	for (var i = 0; i < trees.length; i++) {
		trees[i].position.z += 0.015;

		if (Math.abs(trees[i].position.x - player.position.x) <= 0.09 &&
			Math.abs(trees[i].position.z - player.position.z) <= 0.09) {
			endgame = true;
		}

		if (trees[i].position.z > 5) {
			score++;
			var text = document.createTextNode(score);
			scoreh2.removeChild(scoreh2.firstChild);
			scoreh2.appendChild(text);
			scorediv.appendChild(scoreh2);
			ground.remove(trees[i]);
			trees.shift();
		}
	}

	// update rocks
	for (var i = 0; i < rocks.length; i++) {
		rocks[i].position.z += 0.015;
		rocks[i].position.y -= 0.0003;

		if (Math.abs(rocks[i].position.x - player.position.x) <= 0.05 &&
			Math.abs(rocks[i].position.z - player.position.z) <= 0.05 && 
			player.position.y <= 0.88) {
			endgame = true;
		}

		if (rocks[i].position.z > 5) {
			ground.remove(rocks[i]);
			rocks.shift();
		}
	}

	// update forest
	for (var i = 0; i < forest.length; i++) {
		forest[i].position.z += 0.015;

		if (forest[i].position.z > 5) {
			ground.remove(forest[i]);
			forest.shift();
		}
	}

	ground.updateMatrixWorld(true);
	box.copy(ground.geometry.boundingBox).applyMatrix4(ground.matrixWorld);

	render();

	//request next update
	if (!endgame && !pause) {
		requestAnimationFrame(update);
	} else if (endgame) {

		while (screen.childNodes.length > 0) {
			screen.removeChild(screen.firstChild);
		}

		screen.classList.add('screen');

		var h1 = document.createElement('h2');
		var i1 = document.createTextNode('GAMEOVER');
		var h2 = document.createElement('h1');
		var i2 = document.createTextNode(score);
		var h3 = document.createElement('h5');
		var i3 = document.createTextNode('Enter a nickname to save score:');
		h1.appendChild(i1);
		h2.appendChild(i2);
		h3.appendChild(i3);
		screen.appendChild(h1);
		screen.appendChild(h2);
		screen.appendChild(h3);

		var form = document.createElement('FORM');
		form.method = 'POST';
		var input = document.createElement('INPUT');
		input.type = 'TEXT';
		input.name = 'name';
		var input2 = document.createElement('INPUT');
		input2.type = 'hidden';
		input2.id = 'score';
		input2.name = 'score';
		input2.value = score;
		var button = document.createElement('BUTTON');
		button.type = 'SUBMIT';
		button.classList.add('end');
		var exit = document.createTextNode('RESTART');
		button.appendChild(exit);
		form.appendChild(input);
		form.appendChild(input2);
		form.appendChild(button);
		screen.appendChild(form);
	}
}

// generates trees for player to avoid
function plant() {
	while (screen.childNodes.length > 0) {
		screen.removeChild(screen.firstChild);
	}

	var shadowGeom = new THREE.SphereGeometry(0.07, 30, 30);
	var shadowMat = new THREE.MeshBasicMaterial({ color: 0x5A7A9C });
	var shadow = new THREE.Mesh(shadowGeom, shadowMat);
	shadow.position.y = 0.75;
	shadow.position.z = -0.15;
	shadow.scale.y = 0.1;
	shadow.scale.z = 2.5;

	var trunkGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8, 8);
	var trunkMat = new THREE.MeshPhongMaterial({ color: 0x340608 });
	trunkMat.shininess = 0.5;
	trunkMat.flatShading = true;
	var trunk = new THREE.Mesh(trunkGeom, trunkMat);
	trunk.position.y = 0.8;

	var bottomGeom = new THREE.ConeGeometry(0.1, 0.15, 12, 6);
	var treeMat = new THREE.MeshPhongMaterial({ color: 0x008080 });
	treeMat.shininess = 0.7;
	treeMat.flatShading = true;
	var bottom = new THREE.Mesh(bottomGeom, treeMat);
	bottom.position.y = 0.9;

	var midGeom = new THREE.ConeGeometry(0.08, 0.15, 10, 6);
	var middle = new THREE.Mesh(midGeom, treeMat);
	middle.position.y = 0.99;

	var topGeom = new THREE.ConeGeometry(0.06, 0.1, 9, 6);
	var top = new THREE.Mesh(topGeom, treeMat);
	top.position.y = 1.05;

	var tree = new THREE.Group();
	tree.add(shadow);
	tree.add(trunk);
	tree.add(bottom);
	tree.add(middle);
	tree.add(top);
	tree.castShadow = true;
	return tree;
}

// generates rocks
function genRock() {
	var rockGeom = new THREE.SphereGeometry(0.07, 5, 3);
	var rockMat = new THREE.MeshPhongMaterial({ color: 0x3C447C });
	rockMat.shininess = 0.3;
	rockMat.flatShading = true;
	var rock = new THREE.Mesh(rockGeom, rockMat);
	rock.scale.y = 0.7;

	rock.castShadow = true;
	return rock;
}

// generates forest
function genForest() {

	var bottomGeom = new THREE.ConeGeometry(0.1, 0.35, 10, 6);
	var treeMat = new THREE.MeshPhongMaterial({ color: 0x013636 });
	treeMat.shininess = 0.7;
	treeMat.flatShading = true;
	var bottom = new THREE.Mesh(bottomGeom, treeMat);
	bottom.position.y = 0.9;

	var midGeom = new THREE.ConeGeometry(0.08, 0.35, 9, 6);
	var middle = new THREE.Mesh(midGeom, treeMat);
	middle.position.y = 1.1 + Math.random() * 0.05 - 0.025;

	var topGeom = new THREE.ConeGeometry(0.06, 0.2, 8, 6);
	var top = new THREE.Mesh(topGeom, treeMat);
	top.position.y = 1.2 + + Math.random() * 0.1 - 0.05;

	var tree = new THREE.Group();
	tree.add(bottom);
	tree.add(middle);
	tree.add(top);
	tree.castShadow = true;
	tree.rotation.y = Math.random();
	return tree;
}

function render() {
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