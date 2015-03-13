"use strict";
/*Globals*/
var current, user_side;
var passant_capture_w, passant_capture_b;
var board;
var is_multiplayer = false, opponent_ready = false;
var game_finished;

var renderer, scene, camera, light, chessboard;
var cells = [], pieces_list = [], pieces_models = {}, moves_history=[];
var board_coords = "abcdefgh";
var textures = {};
var angle = 0;

/*WORLD SETTINGS*/
var camera_position = {x: 200, y: 340, z: -200};
var light_position = {x: -200, y: 340, z: -200};
var board_center = {x:-200, y: 0, z: -200};
var cell_size = 50;

/*COLOURS*/
var bg_color = 0x333366;
var light_color = 0xFFFFFF;

var background;

function full_height(){
    return window.innerHeight-$('#appBar').height();
}
function full_width(){
    return window.innerWidth;
}

var world=function(){
	return {
		initWorld: function(){
			var container = $('#chess');
            var $this = this;
			var width = full_width(), height = full_height();
			var view_angle = 65, aspect = width/height, near = 1, far = 5000;
			var mouse = { x: 0, y: 0 };
			renderer = new THREE.WebGLRenderer({ antialias: true });
			camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
			scene = new THREE.Scene();
            scene.add(camera);
            camera.position.set(camera_position.x, camera_position.y, camera_position.z);
			camera.lookAt(new THREE.Vector3(board_center.x, board_center.y, board_center.z));

            light = new THREE.DirectionalLight( light_color, 0.8 );
            light.position.set(light_position.x, light_position.y, light_position.z);
            scene.add(light);

            background = new THREE.Mesh( new THREE.BoxGeometry( 4000, 4000, 4000 ), textures['cubemap'] );
            scene.add(background);
            background.position.x = -500;
            background.position.y = 0;
            background.position.z = -500;
            //chessboard
            var platformMaterial = new THREE.MeshPhongMaterial({
                map: textures['chess_board_texture'],
                specularMap: textures['chess_board_specular_texture'],
                normalMap: textures['chess_board_normal_texture']
            });
            var platform = new THREE.Mesh(chessboard, platformMaterial);
            platform.position.x = -175;
            platform.position.y = -3;
            platform.position.z = -175;
            platform.geometry.computeVertexNormals();
            scene.add(platform);

            for(var i=0; i<8; i++){
				var isWhite = i % 2 != 0;
				for(var j=0; j<8; j++){
					var cellGeometry = new THREE.BoxGeometry(cell_size,1,cell_size);
                    //var currentColor = isWhite ? white_cell_color : black_cell_color;
                    var currentColor = isWhite ? textures['white_cell'] : textures['black_cell'];
					var cellMaterial = new THREE.MeshLambertMaterial({map: currentColor});
					var cell = new THREE.Mesh(cellGeometry, cellMaterial);
					cell.x = i;
					cell.y = j;
					cell.isWhite = isWhite;
					scene.add(cell);
					cell.position.x = - i * cell_size;
					cell.position.z = -j * cell_size;
					cells.push(cell);

					isWhite = !isWhite;
				}
			}

			renderer.setSize(width, height);
			renderer.setClearColor(bg_color, 1);
			container.append(renderer.domElement);
			
			$(document).mousemove(function(event){
				event.preventDefault();
				mouse.x = ( event.clientX / full_width() ) * 2 - 1;
				mouse.y = - ( event.clientY / full_height() ) * 2 + 1;
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
					if(
                        (!is_multiplayer && board[cells[hovered].x][cells[hovered].y] != null && board[cells[hovered].x][cells[hovered].y].color == current ) ||
                        (is_multiplayer && board[cells[hovered].x][cells[hovered].y] != null && board[cells[hovered].x][cells[hovered].y].color == user_side )
                    ){
                        _.each(cells, function(cell){
                            cell.isSelected = false;
                        });
						cells[hovered].isSelected = true;
					}
					else{
                        if (game_finished || (is_multiplayer && (!opponent_ready || user_side != current))) return;
						var x = parseInt(selected / 8), y = selected - x * 8;
						var newX = parseInt(hovered / 8), newY = hovered - newX * 8;
                        var result = $this.move(x, y, newX, newY);
                        if(result){
                            if(is_multiplayer){
                                network.move(x, y, newX, newY);
                            }
                            cells[selected].isSelected = false;
                        }
					}
				}
			});

            $(document).keydown(function(e){
                switch(e.which){
                    case 65:
                        angle += 5;
                        camera.position.x = -camera_position.x + cell_size * 8 * Math.cos(Math.PI * angle / 180);
                        camera.position.z = -camera_position.x + cell_size * 8 * Math.sin(Math.PI * angle / 180);
                        break;
                    case 68:
                        angle -= 5;
                        camera.position.x = -camera_position.x + cell_size * 8 * Math.cos(Math.PI * angle / 180);
                        camera.position.z = -camera_position.x + cell_size * 8 * Math.sin(Math.PI * angle / 180);
                        break;
                    case 87:
                        if(camera.position.y < 540){
                            camera.position.y += 10;
                        }
                        break;
                    case 83:
                        if(camera.position.y > 60){
                            camera.position.y -= 10;
                        }
                        break;
                }
            });

			var render = function(){
				requestAnimationFrame(render);
				camera.lookAt(new THREE.Vector3(board_center.x, board_center.y, board_center.z));

				var mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
				mouse3D.unproject(camera);
        		mouse3D.sub(camera.position);
        		mouse3D.normalize();
        		var raycaster = new THREE.Raycaster(camera.position, mouse3D);
				var intersects = raycaster.intersectObjects(cells);
				for(var i=0; i<cells.length; i++){
					//var currentColor = cells[i].isWhite ? white_cell_color : black_cell_color;
                    var currentColor = cells[i].isWhite ? textures['white_cell'] : textures['black_cell'];

					if(!cells[i].isSelected){
						//cells[i].material.color.setHex(currentColor);
                        cells[i].material.map = currentColor;
					}
					cells[i].isHovered = false;
				}
		        if (intersects.length > 0) {
		            //intersects[0].object.material.color.setHex(hover_cell_color);
                    intersects[0].object.material.map = intersects[0].object.isWhite ? textures['white_cell_hover'] : textures['black_cell_hover'];
		            intersects[0].object.isHovered = true;
		        }
				renderer.render(scene, camera);
			}
			render();
			
			window.addEventListener( 'resize', onWindowResize, false );
			function onWindowResize() {
				camera.aspect = full_width() / full_height();
				camera.updateProjectionMatrix();
				renderer.setSize( full_width(), full_height() );
                render();
			}
			this.startGame();
		},
        move: function(x,y,newX,newY){
            var $this = this;
            var result = game.move(x, y, newX, newY);
            if(result.result){
                $this.addToHistory(x, y, newX, newY, result.check,board[newX][newY].piece, board[newX][newY].color);
                showMessage(messages.EMPTY);
                //destroy enemy
                if(result.kill){
                    var enemy = _.find(pieces_list, function(item){
                        return item.x == result.kill.x && item.y == result.kill.y;
                    });
                    pieces_list = _.without(pieces_list, enemy);
                    scene.remove(enemy);
                    enemy = null;
                }
                //find piece
                var piece = _.find(pieces_list, function(item){
                    return item.x == x && item.y == y;
                });
                //move piece
                piece.x = newX;
                piece.y = newY;
                piece.position.x = -newX * cell_size;
                piece.position.z = -newY * cell_size;
                //pawn transform
                if(result.transform){
                    var pawn = _.find(pieces_list, function(item){
                        return item.x == result.transform.x && item.y == result.transform.y;
                    });
                    pieces_list = _.without(pieces_list, pawn);
                    scene.remove(pawn);
                    pawn = null;
                    $this.buildPiece(result.transform.x, result.transform.y);
                }
                //castling
                if(result.castling){
                    var castling_piece = _.find(pieces_list, function(item){
                        return item.x == result.castling.x && item.y == result.castling.y;
                    });
                    castling_piece.x = result.castling.newX;
                    castling_piece.y = result.castling.newY;
                    castling_piece.position.x = -result.castling.newX * cell_size;
                    castling_piece.position.z = -result.castling.newY * cell_size;
                }
                if(result.check){
                    showMessage(messages.CHECK);
                }
                if(result.game_finished){
                    game_finished = true;
                    if(result.check){
                        showMessage(messages.MATE);
                    }
                    else{
                        showMessage(messages.STALEMATE);
                    }
                }
            }
            else{
                if(result.alert){
                    showMessage(result.message);
                }
            }
            return result.result;
        },
        addToHistory: function(x, y, newX, newY, isCheck, piece, color){
            moves_history.push({
                piece: piece,
                color: color,
                x: x + 1,
                y: board_coords[y],
                newX: newX+1,
                newY: board_coords[newY],
                isCheck: isCheck
            });
        },
        buildPiece: function(x,y){
            var pieceMaterial = new THREE.ShaderMaterial(THREE.GlassShader(textures['map_texture'], board[x][y].color == 'w' ? textures['white_piece_texture'] : textures['black_piece_texture']));
            var piece = new THREE.Mesh(pieces_models[board[x][y].piece], pieceMaterial);
            piece.position.x = -x * cell_size;
            piece.position.z = -y * cell_size;
            scene.add(piece);
            piece.x = x;
            piece.y = y;
            piece.geometry.computeVertexNormals();
            if(board[x][y] != null && board[x][y].piece == 'knight' && board[x][y].color == 'b'){
                piece.rotation.y = Math.PI;
            }
            pieces_list.push(piece);
        },
		loadModels: function(){
            var game_id = this.getGameId();
            is_multiplayer = game_id ? true : false;
            showMessage(messages.INITIALIZING);
			var load_geometry = function(name){
				var d = $.Deferred();
				var loader = new THREE.JSONLoader();
				loader.load('models/'+name+'.js', function(geometry){
					pieces_models[name] = geometry;
					d.resolve();
				});
				return d.promise();
			}
            var load_board = function(){
                var d = $.Deferred();
                var loader = new THREE.JSONLoader();
                loader.load('models/chessboard.js', function(geometry){
                    chessboard = geometry;
                    d.resolve();
                });
                return d.promise();
            }
            var load_texture = function(name, path){
                var d = $.Deferred();
                THREE.ImageUtils.loadTexture('assets/textures/'+path, THREE.UVMapping(), function(image){
                    textures[name] = image;
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
            var board_deffer = load_board();
            var chess_board_texture_deffer = load_texture('chess_board_texture', 'chessboard.jpg');
            var chess_board_specular_texture_deffer = load_texture('chess_board_specular_texture', 'chessboard-specular.jpg');
            var chess_board_normal_texture_deffer = load_texture('chess_board_normal_texture', 'chessbord-normal.jpg');
            var white_cell_texture_deffer = load_texture('white_cell','white_cell.jpg');
            var black_cell_texture_deffer = load_texture('black_cell','black_cell.jpg');
            var white_cell_hover_texture_deffer = load_texture('white_cell_hover','white_cell_hover.jpg');
            var black_cell_hover_texture_deffer = load_texture('black_cell_hover','black_cell_hover.jpg');
            var map_texture_deffer = load_texture('map_texture','map.jpg');
            var white_piece_texture_deffer = load_texture('white_piece_texture','white_piece.jpg');
            var black_piece_texture_deffer = load_texture('black_piece_texture','black_piece.jpg');
			var $this = this;

            var urls = [
                    'assets/textures/dawnmountain-xpos.png',
                     'assets/textures/dawnmountain-xneg.png',
                     'assets/textures/dawnmountain-ypos.png',
                     'assets/textures/dawnmountain-yneg.png',
                     'assets/textures/dawnmountain-zpos.png',
                     'assets/textures/dawnmountain-zneg.png'
                ];

            var cubemap = THREE.ImageUtils.loadTextureCube(urls);
            var shader = THREE.ShaderLib["cube"];
            shader.uniforms[ "tCube" ].value = cubemap;
            textures['cubemap'] = new THREE.ShaderMaterial( { // A ShaderMaterial uses custom vertex and fragment shaders.
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            } );

			$.when(pawn_deffer, rook_deffer, knight_deffer, bishop_deffer, queen_deffer, king_deffer, board_deffer, chess_board_texture_deffer,
                    white_cell_texture_deffer,black_cell_texture_deffer,white_cell_hover_texture_deffer,black_cell_hover_texture_deffer,
                    map_texture_deffer, white_piece_texture_deffer, black_piece_texture_deffer, chess_board_specular_texture_deffer, chess_board_normal_texture_deffer
                )
                .done(function(){
                    if(is_multiplayer){
                        showMessage(messages.WAITING_OPPONENT);
                    }
                    else{
                        showMessage(messages.EMPTY);
                    }
                    $this.initWorld();
                    if(is_multiplayer){
                        network.init(game_id);
                        $('.draw').click(function(e){
                            e.preventDefault();
                            if(user_side == current){
                                network.offer_draw();
                            }
                        })
                    }
			});
		},		
		startGame: function(){
			current = 'w';
			passant_capture_w = null; 
			passant_capture_b = null;
            game_finished = false;
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
						this.buildPiece(i,j);
					}
				}
			}
		},
        getGameId: function(){
            var url = window.location.href;
            var id_pattern = /\?id=([\w\d]+)/;
            if(id_pattern.test(url)){
                return  id_pattern.exec(url)[1];
            }
            return null;
        }
	}
}();