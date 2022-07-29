import * as THREE from 'three';
import * as ORE from 'ore-three';

import slideVert from './shaders/slide.vs';
import slideFrag from './shaders/slide.fs';

export class Slides {

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.root = root;

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			let mat = ( mesh.material as THREE.MeshStandardMaterial );

			let tex = mat.map;

			if ( tex ) {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			}

			mesh.material = new THREE.ShaderMaterial( {
				fragmentShader: slideFrag,
				vertexShader: slideVert,
				uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
					tex: {
						value: tex
					},
					speed: {
						value: Math.random() * 0.5 + 0.5
					}
				} ),
				transparent: true,
			} );

		} );

	}

}
