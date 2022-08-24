import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PowerMesh } from 'power-mesh';

import bakuFrag from './shaders/baku.fs';
import bakuVert from './shaders/baku.vs';
import passThroughFrag from './shaders/passThrough.fs';
import { TextRing } from './TextRing';

export type BakuMaterialType = 'normal' | 'grass' | 'line'

export class Baku extends THREE.Object3D {

	// animation

	private animator: ORE.Animator;
	private animationMixer?: THREE.AnimationMixer;
	private currentAnimationSection: string | null = null;
	private animationClipNameList: string[] = [];
	private animationActions: { [name:string]: THREE.AnimationAction} = {};

	private manager: THREE.LoadingManager;
	private commonUniforms: ORE.Uniforms;

	private mesh?: PowerMesh;
	protected meshLine?: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>;

	private passThrough?: ORE.PostProcessing;
	public sceneRenderTarget: THREE.WebGLRenderTarget;
	public onLoaded?: () => void;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super();

		this.manager = manager;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uSceneTex: {
				value: null
			},
			winResolution: {
				value: new THREE.Vector2()
			},
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uTransparent = this.animator.add( {
			name: 'bakuTransparent',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic,
			userData: {
				pane: {
					min: 0, max: 1
				}
			}
		} );

		this.commonUniforms.uLine = this.animator.add( {
			name: 'bakuLine',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic,
			userData: {
				pane: {
					min: 0, max: 1
				}
			}
		} );

		/*-------------------------------
			RenderTarget
		-------------------------------*/

		this.sceneRenderTarget = new THREE.WebGLRenderTarget( 1, 1 );

		/*-------------------------------
			Load
		-------------------------------*/

		let loader = new GLTFLoader( this.manager );

		loader.load( './assets/scene/baku.glb', ( gltf ) => {

			let bakuWrap = gltf.scene.getObjectByName( "baku_amature" ) as THREE.Object3D;

			this.add( bakuWrap );

			/*-------------------------------
				MainMesh
			-------------------------------*/

			this.mesh = new PowerMesh( bakuWrap.getObjectByName( 'Baku' ) as THREE.Mesh, {
				fragmentShader: bakuFrag,
				vertexShader: bakuVert,
				uniforms: this.commonUniforms,
			}, true );

			this.mesh.castShadow = true;

			this.mesh.onBeforeRender = ( renderer ) => {

				if ( ! this.passThrough ) {

					this.passThrough = new ORE.PostProcessing( renderer, {
						fragmentShader: passThroughFrag,
					} );

				}

				let currentRenderTarget = renderer.getRenderTarget();

				if ( currentRenderTarget ) {

					this.passThrough.render( { tex: currentRenderTarget.texture }, this.sceneRenderTarget );

					this.commonUniforms.uSceneTex.value = this.sceneRenderTarget.texture;

				}

			};

			/*-------------------------------
				Line Mesh
			-------------------------------*/

			const lineMat = new THREE.ShaderMaterial( {
				vertexShader: bakuVert,
				fragmentShader: bakuFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				} ),
				side: THREE.BackSide,
				transparent: true,
				defines: {
					IS_LINE: ''
				},
			} );

			this.meshLine = new THREE.SkinnedMesh( this.mesh.geometry, lineMat );
			this.meshLine.skeleton = this.mesh.skeleton;
			this.add( this.meshLine );

			/*-------------------------------
				animation
			-------------------------------*/

			this.animationMixer = new THREE.AnimationMixer( this );
			this.animations = gltf.animations;

			for ( let i = 0; i < this.animations.length; i ++ ) {

				let clip = this.animations[ i ];

				this.animator.add( {
					name: "BakuWeight/" + clip.name,
					initValue: 1,
					userData: {
						pane: {
							min: 0,
							max: 1
						}
					},
					easing: ORE.Easings.easeOutCubic
				} );

				this.animationClipNameList.push( clip.name );

				let action = this.animationMixer.clipAction( this.animations[ i ] );
				this.animationActions[ clip.name ] = action;

				if ( action ) {

					action.play();

				}

			}

			if ( this.currentAnimationSection ) {

				this.changeAction( this.currentAnimationSection );

			}

			if ( this.onLoaded ) {

				this.onLoaded();

			}

		} );

	}

	public changeMaterial( type: BakuMaterialType ) {

		this.animator.animate( 'bakuTransparent', type == 'grass' ? 1 : 0, 1 );
		this.animator.animate( 'bakuLine', type == 'line' ? 1 : 0, 1 );

	}

	public changeAction( actionName: string ) {

		for ( let i = 0; i < this.animationClipNameList.length; i ++ ) {

			let name = this.animationClipNameList[ i ];
			this.animator.animate( 'BakuWeight/' + name, name == actionName ? 1 : 0 );

		}

		this.currentAnimationSection = actionName;

	}

	public update( deltaTime: number ) {

		if ( this.animationMixer ) {

			this.animationMixer.update( deltaTime );

			for ( let i = 0; i < this.animationClipNameList.length; i ++ ) {

				let name = this.animationClipNameList[ i ];

				let action = this.animationActions[ name ];

				if ( action ) {

					action.weight = this.animator.get( 'BakuWeight/' + name ) || 0;

				}

			}

		}

	}

	public resize( info: ORE.LayerInfo ) {

		this.sceneRenderTarget.setSize( info.size.canvasPixelSize.x, info.size.canvasPixelSize.y );
		this.commonUniforms.winResolution.value.copy( info.size.canvasPixelSize );

	}

}
