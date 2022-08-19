import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { PowerMesh } from 'power-mesh';

import comradeFrag from './shaders/comrade.fs';
import bakuVert from './shaders/comrade.vs';

export class Comrade {

	private root: THREE.Object3D;
	private animationMixer: THREE.AnimationMixer;
	private animations: THREE.AnimationClip[] = [];

	private mesh: PowerMesh;
	private commonUniforms: ORE.Uniforms;

	private action?: THREE.AnimationAction;

	constructor( root: THREE.Object3D, origin: THREE.Object3D, animations: THREE.AnimationClip[], parentUniforms: ORE.Uniforms ) {

		this.root = root;
		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		let clonedRoot = SkeletonUtils.clone( origin );
		clonedRoot.position.set( 0, 0, 0 );

		let clonedBone = clonedRoot.getObjectByName( "ComradeBone" ) as THREE.SkinnedMesh;
		clonedBone.position.set( 0, - 0.5, 0 );

		let clonedMesh = clonedRoot.getObjectByName( "Comrades_Origin" ) as THREE.SkinnedMesh;

		this.mesh = new PowerMesh( clonedMesh, {
			fragmentShader: comradeFrag,
			vertexShader: bakuVert,
		}, true );

		this.root.add( clonedRoot );

		/*-------------------------------
			Animatinon
		-------------------------------*/

		this.animationMixer = new THREE.AnimationMixer( this.root );
		this.animations = animations;

		let clip = this.animations.find( clip => clip.name == 'ComradeAction' );

		if ( clip ) {

			let action = this.animationMixer.clipAction( clip );

			if ( action ) {

				this.action = action;

				this.action.timeScale = 0.8 + Math.random() * 0.2;

				this.action.time = Math.random() * 3.0;

				action.play();

			}

		}

	}

	public update( deltaTime: number ) {

		// 無理やりループ
		if ( this.action && this.action.time > 3.6666666666666665 ) {

			this.action.time = 0;

		}

		this.animationMixer.update( deltaTime );

		// this.root.rotation.z += deltaTime * 0.2;


	}

}
