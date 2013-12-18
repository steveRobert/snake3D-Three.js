/* START CONFIGURATION _________________________________________________________*/

			var VIEW_WIDTH = 680;
			var VIEW_HEIGHT = 480;
			var VIEW_ANGLE = 60;
			var ASPECT = VIEW_WIDTH / VIEW_HEIGHT;
			var NEAR = 0.1;
			var FAR = 1000;

			KEY_UP    = 38;
			KEY_DOWN  = 40;
			KEY_LEFT  = 37;
			KEY_RIGHT = 39;
			KEY_DEPTH = 65;
			KEY_DIST  = 90;
			KEY_SPACE = 32;

			CUBE_SIZE = 20;

			CUBE_WIDTH  = 400;
			CUBE_HEIGHT = 400;
			CUBE_DEPTH  = 400;

			var dirUP    = new THREE.Vector3(0,1,0);
			var dirDOWN  = new THREE.Vector3(0,-1,0);
			var dirLEFT  = new THREE.Vector3(-1,0,0);
			var dirRIGHT = new THREE.Vector3(1,0,0);
			var dirDEPTH = new THREE.Vector3(0,0,1);
			var dirDIST	 = new THREE.Vector3(0,0,-1);
			var direction;

			var renderer, scene, camera, mesh;

			var snakeCube = Array();
			var foodCube = Array();
			var food, snake, time, newPosition;
			var score = 0;
			var count = 0;

/* END CONFIGURATION  ____________________________________________________________ */

			if( !init() ) {
				setTime();
			}
			setup();

			function init () {

			//* ______________________
				scene = new THREE.Scene();

				renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('snake') });
				renderer.setSize(VIEW_WIDTH, VIEW_HEIGHT);
			//*_______________________

				//Plan
				// var plan = new THREE.Mesh(
				// 	new THREE.CubeGeometry(CUBE_WIDTH, CUBE_HEIGHT, CUBE_DEPTH),
				// 	new THREE.MeshBasicMaterial({wireframe: true, color: 'gray'})
				// );
				// scene.add(plan);

				//Permet de ne pas avoir les diagonales du cube.
				var plan = new THREE.BoxHelper();
				plan.material.color.set('gray');
				plan.scale.set(CUBE_WIDTH/2, CUBE_HEIGHT/2, CUBE_DEPTH/2);
				scene.add(plan);			

				//Ajout des lumières et ombre
				scene.add(new THREE.AmbientLight(0x222222));
				var light = new THREE.PointLight(0xffffff);
				light.position.set(0,0,960);
				scene.add(light);

				//Camera
				camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
				camera.position.set(0,0,550);
				camera.lookAt(plan.position);

				create_3D_food();
				create_3D_snake();
				displayScore();
				render();
			}

			function setup() 
			{
				var arrayDirection = [dirUP, dirDOWN, dirRIGHT, dirLEFT, dirDEPTH, dirDIST];
				direction = arrayDirection[Math.floor(Math.random() * arrayDirection.length)];
			}

			function create_3D_food()
			{
				var table = generateFood();
				food = createCube();
				food.position.set(table.x,table.y,table.z);
				foodCube.unshift(food);
			}

			function create_3D_snake() 
			{
				for (var i = 0; i < generateSnake().length; i++) {
					snake = createCube();
					snake.position.x = i *CUBE_SIZE;
					snake.position.y = CUBE_SIZE;
					snake.position.z = CUBE_SIZE;
					snakeCube.unshift(snake);
				}			
			}

			function createCube() 
			{
				var cube = new THREE.Mesh(
					new THREE.CubeGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
					new THREE.MeshLambertMaterial({color: 'black', wireframe: false, vertexColors: THREE.FaceColors})
				);
				scene.add(cube);
				return cube;
			}

			function animate () 
			{
				move();
				render();
				eatColision();
				boarderColision();
				tailColision();
				document.onkeydown = update;
			}

			function render () 
			{
				renderer.render( scene, camera );
			}

			function generateSnake()
			{
				var snake_array = Array();
				for (var i = 0; i < 2; i++) {
					snake_array[i] = i;
				};
				return snake_array;
			}

			function freeCell(x, y, z)
			{
		        for(var i = 0; i < snakeCube.length; i++)
		        {
		          if(snakeCube[i].position.x == x 
		          	&& snakeCube[i].position.y == y
		          	&& snakeCube[i].position.z == z)
		           return false;
		        }
		        return true;
		    }

			function generateFood()
			{
				var isFree = true;

				while(isFree)
				{
					var xPlusOrMinus = Math.random() < 0.5 ? -Math.random() : Math.random();
					var yPlusOrMinus = Math.random() < 0.5 ? -Math.random() : Math.random();
					var zPlusOrMinus = Math.random() < 0.5 ? -Math.random() : Math.random();

					var food_array = Array();
					food_array.x   = Math.floor(xPlusOrMinus*(CUBE_WIDTH-CUBE_SIZE)/CUBE_SIZE/2)*CUBE_SIZE;
					food_array.y   = Math.floor(yPlusOrMinus*(CUBE_WIDTH-CUBE_SIZE)/CUBE_SIZE/2)*CUBE_SIZE;
					food_array.z   = Math.floor(zPlusOrMinus*(CUBE_WIDTH-CUBE_SIZE)/CUBE_SIZE/2)*CUBE_SIZE;

					if (freeCell(food_array.x, food_array.y, food_array.z)) 
					{
						//console.log("x =>", food_array.x, "y =>", food_array.y, "z =>", food_array.z);
						isFree = false;
						return food_array;

					}	
				}
			}

			function displayScore() 
			{
				var displayScore = document.getElementById('score');

				if (score == 0) {
					displayScore.innerHTML = "Score: " + score;
				} else {
					displayScore.innerHTML = "Score: " + score;
				}
			}

			function move() 
			{
				newPosition = snakeCube.pop();
				newPosition.position.x = snakeCube[0].position.x + direction.x *CUBE_SIZE;
				newPosition.position.y = snakeCube[0].position.y + direction.y *CUBE_SIZE;
				newPosition.position.z = snakeCube[0].position.z + direction.z *CUBE_SIZE;
				snakeCube.unshift(newPosition);
			}

			function eatColision()
			{
				if (snakeCube[0].position.x == foodCube[0].position.x
					&& snakeCube[0].position.y == foodCube[0].position.y
					&& snakeCube[0].position.z == foodCube[0].position.z) 
				{
					//console.log('MIAM');
					snakeCube.push(createCube());
					scene.remove(food);
					create_3D_food();

					score += 10;
					displayScore();
				}
			}

			function boarderColision () 
			{
				if (snakeCube[0].position.x > CUBE_WIDTH/2) 
				{
					snakeCube[0].position.x = -CUBE_WIDTH/2;
				}
				else if (snakeCube[0].position.x < -CUBE_WIDTH/2) 
				{
					snakeCube[0].position.x = CUBE_WIDTH/2;
				}

				if (snakeCube[0].position.y > CUBE_HEIGHT/2) 
				{
					snakeCube[0].position.y = -CUBE_HEIGHT/2;
				}
				else if (snakeCube[0].position.y < -CUBE_HEIGHT/2) 
				{
					snakeCube[0].position.y = CUBE_HEIGHT/2;
				}

				if (snakeCube[0].position.z > CUBE_DEPTH/2) 
				{
					snakeCube[0].position.z = -CUBE_DEPTH/2;
				}
				else if (snakeCube[0].position.z < - CUBE_DEPTH/2)
				{
					snakeCube[0].position.z = CUBE_DEPTH/2;
				}
			}

			function tailColision() 
			{
				for (var i = 1; i < snakeCube.length; i++) 
				{
					//console.log("cube x"+ i +"." , snakeCube[i].position.x, "cube y ", snakeCube[i].position.y );
					if(snakeCube[i].position.x == snakeCube[0].position.x 
						&& snakeCube[i].position.y == snakeCube[0].position.y
						&& snakeCube[i].position.z == snakeCube[0].position.z)
					{	
						alert("GAME OVER \n" + "Votre score est de: " + score);
						if (confirm) {
							reset();
						}
					} 
				}
			}

			function setTime() 
			{
				if (count == 0) {
		    		time = setInterval(animate, 80);
		    		count++;
	    		} else {
	    			clearInterval(time);
	    			count--;
	    		}
			}

			function reset()
			{	
				scene.remove(food);

	            for(var i = snakeCube.length; i>=0; i--)
	            {
	              snake = snakeCube[i];
	              scene.remove(snake);
	            }

	            score = 0;
	            displayScore()
	            snakeCube = [];

	            create_3D_food();
	            create_3D_snake();
			}

			function update (event) 
			{	
				if (event.keyCode == KEY_UP && direction != dirDOWN) 
				{
		    		direction = dirUP;
		    	}
		    	else if (event.keyCode == KEY_DOWN && direction != dirUP) 
		    	{
		    		direction = dirDOWN;
		    	}
		    	else if (event.keyCode == KEY_RIGHT && direction != dirLEFT) 
		    	{
		    		direction = dirRIGHT;
		    	}
		    	else if (event.keyCode == KEY_LEFT && direction != dirRIGHT) 
		    	{
		    		direction = dirLEFT;
		    	}
		    	else if (event.keyCode == KEY_DEPTH && direction != dirDIST) 
		    	{
		    		direction = dirDEPTH;
		    	}
		    	else if (event.keyCode == KEY_DIST && direction != dirDEPTH) 
		    	{
		    		direction = dirDIST;
		    	}
		    	else if (event.keyCode == KEY_SPACE) {
		    		setTime();
		    	}
			}
