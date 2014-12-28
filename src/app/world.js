"use strict";
/*Globals*/
var current;
var passant_capture_w, passant_capture_b;
var board;

var world=function(){
	var renderer, scene, camera, projector;
	var cells = [], pieces = [], pieces_models = {};
	return {
		initWorld: function(){
			var container = $('#chess');

			var width = window.innerWidth, height = window.innerHeight;
			var view_angle = 45, aspect = width/height, near = 0.1, far = 1000;
			var mouse = { x: 0, y: 0 }
			renderer = new THREE.WebGLRenderer();
			camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
			scene = new THREE.Scene();
			scene.add(camera);
			camera.position.set(200, 500, -250);
			camera.lookAt(new THREE.Vector3(-200, 0, -200));
			
			for(var i=0; i<8; i++){
				var isWhite = i % 2 != 0;
				for(var j=0; j<8; j++){
					var cellGeometry = new THREE.BoxGeometry(50,1,50);
					var currentColor = isWhite ? 0xffffff : 0x000000;
					
					var cellMaterial = new THREE.MeshBasicMaterial({color: currentColor});
					var cell = new THREE.Mesh(cellGeometry, cellMaterial);
					cell.x = i;
					cell.y = j;
					cell.isWhite = isWhite;
					scene.add(cell);
					cell.position.x = -i*50;
					cell.position.z = -j*50;
					cells.push(cell);

					isWhite = !isWhite;
				}
			}

			renderer.setSize(width, height);
			renderer.setClearColor(0x00BFFF, 1);
			container.append(renderer.domElement);
			
			$(document).mousemove(function(event){
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			});

			$(document).mousedown(function(event){
				var selected = -1, hovered = -1;
				for(var i=0; i<cells.length; i++){
					if(cells[i].isSelected){
						selected = i;
					}
					if(cells[i].isHovered){
						hovered = i;	
					}
				}
				if(hovered != -1){
					if(selected == -1 ){
						cells[hovered].isSelected = true;
					}
					else{
						cells[selected].isSelected = false;
						var x = parseInt(selected / 8), y = selected - x * 8;
						var newX = parseInt(hovered / 8), newY = hovered - newX * 8;
						var result = game().move(x, y, newX, newY);
						if(result.result){
							//destroy enemy
							if(result.kill){
								var enemy = _.find(pieces, function(item){
									return item.x == result.kill.x && item.y == result.kill.y;
								});								
								pieces = _.without(pieces, enemy);
								scene.remove(enemy);
								enemy = null;
							}
							//find piece
							var piece = _.find(pieces, function(item){
								return item.x == x && item.y == y;
							});
							//TODO: pawn transform
							//move piece
							piece.x = newX;
							piece.y = newY;
							piece.position.x = -newX*50;
							piece.position.z = -newY*50;
							//castling
							if(result.castling){
								var castling_piece = _.find(pieces, function(item){
									return item.x == result.castling.x && item.y == result.castling.y;
								});								
								castling_piece.x = result.castling.newX;
								castling_piece.y = result.castling.newY;
								castling_piece.position.x = -result.castling.newX*50;
								castling_piece.position.z = -result.castling.newY*50;
							}
						}
						else{
							if(result.alert){
								console.log(result.message);
							}
						}
					}
				}
			});

			var render = function(){
				requestAnimationFrame(render);
				camera.lookAt(new THREE.Vector3(-200, 0, -200));

				var mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
				mouse3D.unproject(camera);
        		mouse3D.sub(camera.position);
        		mouse3D.normalize();
        		var raycaster = new THREE.Raycaster(camera.position, mouse3D);
				var intersects = raycaster.intersectObjects(cells);
				for(var i=0; i<cells.length; i++){
					var currentColor = cells[i].isWhite ? 0xffffff : 0x000000;
					if(!cells[i].isSelected){
						cells[i].material.color.setHex(currentColor);
					}
					cells[i].isHovered = false;
				}
		        if (intersects.length > 0) {
		            intersects[0].object.material.color.setHex(0xff0000);
		            intersects[0].object.isHovered = true;
		        }

				renderer.render(scene, camera);
			}
			render();
			
			window.addEventListener( 'resize', onWindowResize, false );
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
                render();
			}
			this.startGame();
		},
		loadModels: function(){
			console.log('Initializing...');
			var load_geometry = function(name){
				var d = $.Deferred();
				var loader = new THREE.JSONLoader();
				loader.load('models/'+name+'.js', function(geometry){
					pieces_models[name] = geometry;
					d.resolve();
				});
				return d.promise();
			}
			var pawn_deffer = load_geometry('pawn');
			var rook_deffer = load_geometry('rook');
			var knight_deffer = load_geometry('knight');
			var bishop_deffer = load_geometry('bishop');
			var queen_deffer = load_geometry('queen');
			var king_deffer = load_geometry('king');
			var $this = this;
			$.when(pawn_deffer, rook_deffer, knight_deffer, bishop_deffer, queen_deffer, king_deffer).done(function(){
				console.log('Done...');
				$this.initWorld();
			});
		},		
		startGame: function(){
			current = 'w';
			passant_capture_w = null; 
			passant_capture_b = null;
			board = [
				[
					{piece:'rook',color:'w'},{piece:'knight',color:'w'},{piece:'bishop',color:'w'},
					{piece:'queen',color:'w'},{piece:'king',color:'w'},
					{piece:'bishop',color:'w'},{piece:'knight',color:'w'},{piece:'rook',color:'w'}
				],
				[
					{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},
					{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'}
				],
				[null,null,null,null,null,null,null,null],
				[null,null,null,null,null,null,null,null],
				[null,null,null,null,null,null,null,null],
				[null,null,null,null,null,null,null,null],
				[
					{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},
					{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'}
				],
				[
					{piece:'rook',color:'b'},{piece:'knight',color:'b'},{piece:'bishop',color:'b'},
					{piece:'queen',color:'b'},{piece:'king',color:'b'},
					{piece:'bishop',color:'b'},{piece:'knight',color:'b'},{piece:'rook',color:'b'}
				]
			];

			for(var i=0; i<8; i++){
				for(var j=0; j<8; j++){
					if(board[i][j] != null){
						var pieceColor = board[i][j].color == 'w' ? 0xf9e17e : 0x542217;
						var pieceMaterial = new THREE.MeshBasicMaterial({color: pieceColor});
						var piece = new THREE.Mesh(pieces_models[board[i][j].piece], pieceMaterial);
						piece.position.x = -i*50;
						piece.position.z = -j*50;
						scene.add(piece);
						piece.x = i;
						piece.y = j;
						pieces.push(piece);
					}
				}
			}
		}
	}
}