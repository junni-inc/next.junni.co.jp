import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { PowerMesh } from 'power-mesh';

import comradeFrag from './shaders/comrade.fs';
import bakuVert from './shaders/comrade.vs';

export class Comrade {

	private animator: ORE.Animator;

	private root: THREE.Object3D;
	private animationMixer: THREE.AnimationMixer;
	private animations: THREE.AnimationClip[] = [];

	private mesh: PowerMesh;
	private commonUniforms: ORE.Uniforms;
	private action?: THREE.AnimationAction;

	constructor( root: THREE.Object3D, origin: THREE.Object3D, animations: THREE.AnimationClip[], parentUniforms: ORE.Uniforms, colorNum: number ) {

		this.root = root;
		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uTex: {
				value: null
			},
		} );


		let clonedRoot = SkeletonUtils.clone( origin );
		clonedRoot.position.set( 0, 0, 0 );

		let clonedBone = clonedRoot.getObjectByName( "ComradeBone" ) as THREE.SkinnedMesh;
		clonedBone.position.set( 0, - 0.5, 0 );

		let clonedMesh = clonedRoot.getObjectByName( "Comrades_Origin" ) as THREE.SkinnedMesh;

		/*-------------------------------
			Texture
		-------------------------------*/

		let loader = new THREE.TextureLoader();

		loader.load( './assets/textures/baku/baku_' + colorNum + '.jpg', ( tex ) => {

			this.commonUniforms.uTex.value = tex;

		} );

		/*-------------------------------
			Animtor
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'comradeVisibility' + this.root.uuid,
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );

		this.mesh = new PowerMesh( clonedMesh, {
			fragmentShader: comradeFrag,
			vertexShader: bakuVert,
			uniforms: this.commonUniforms,
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

		this.root.visible = false;

	}

	public update( deltaTime: number ) {

		// 無理やりループ
		if ( this.action && this.action.time > 3.6666666666666665 ) {

			this.action.time = 0;

		}

		this.animationMixer.update( deltaTime );

		// this.root.rotation.z += deltaTime * 0.2;

	}

	private timer: number | null = null;

	public switchVisibility( visible: boolean ) {

		if ( this.timer != null ) {

			window.clearTimeout( this.timer );

		}

		if ( visible ) {

			this.root.visible = true;

		}

		this.timer = window.setTimeout( () => {

			this.animator.animate( 'comradeVisibility' + this.root.uuid, visible ? 1 : 0, 3, () => {

				if ( ! visible ) {

					this.root.visible = false;

				}

			} );

		}, 500 * Math.random() );

	}


}
