THREE.GlassShader = function(map_texture, piece_texture){
    return {
        uniforms: {
            tNormal: { type: 't', value: map_texture },
            tMatCap: { type: 't', value: piece_texture },
            time: { type: 'f', value: 0 },
            bump: { type: 'f', value: 0 },
            noise: { type: 'f', value: .04 },
            repeat: { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
            useNormal: { type: 'f', value: 0 },
            useRim: { type: 'f', value: 0 },
            rimPower: { type: 'f', value: 2 },
            useScreen: { type: 'f', value: 0 },
            normalScale: { type: 'f', value: .5 },
            normalRepeat: { type: 'f', value: 1 }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    }
};