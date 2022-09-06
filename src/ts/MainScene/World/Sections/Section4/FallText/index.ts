import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import textVert from './shaders/text.vs';
import textFrag from './shaders/text.fs';

export class FallText {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	public root: THREE.Object3D;
	public textAssetPart: THREE.Object3D;
	public meshList: THREE.Mesh[] = [];

	public body: CANNON.Body;
	private baseSize: CANNON.Vec3;
	private boxShape: CANNON.Box;

	constructor( root: THREE.Mesh, textAssetPart: THREE.Object3D, parentUniforms: ORE.Uniforms, parent: THREE.Object3D ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.root = root;
		this.textAssetPart = textAssetPart;

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.animator.add( {
			name: 'Sec4TextScale' + this.root.uuid,
			initValue: 1,
			easing: ORE.Easings.easeOutCubic,
		} );

		this.commonUniforms.uSwap = this.animator.add( {
			name: 'Sec4TextSwap' + this.root.uuid,
			initValue: 1,
			easing: ORE.Easings.easeOutCubic,
		} );

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'Sec4TextVisibility' + this.root.uuid,
			initValue: 1,
			easing: ORE.Easings.easeOutCubic,
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.textAssetPart.children.concat().forEach( ( obj, index ) => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				/*-------------------------------
					BaseMesh
				-------------------------------*/

				mesh.castShadow = true;
				mesh.receiveShadow = true;

				let uni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, THREE.UniformsUtils.clone( THREE.UniformsLib.lights ), {
					uMatCapTex: window.gManager.assetManager.getTex( 'matCapOrange' ),
					shadowLightModelViewMatrix: {
						value: new THREE.Matrix4()
					},
					shadowLightProjectionMatrix: {
						value: new THREE.Matrix4()
					},
					shadowLightDirection: {
						value: new THREE.Vector3()
					},
					shadowLightCameraClip: {
						value: new THREE.Vector2()
					},
					shadowMap: {
						value: null
					},
					shadowMapSize: {
						value: new THREE.Vector2()
					},
					shadowMapResolution: {
						value: new THREE.Vector2()
					},
					cameraNear: {
						value: 0.01
					},
					cameraFar: {
						value: 1000.0
					},
					uPartVisibility: this.animator.add( {
						name: 'visibility' + this.root.name + index,
						initValue: index == 0 ? 1 : 0,
						easing: ORE.Easings.easeOutCubic
					} )
				} );

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: textVert,
					fragmentShader: textFrag,
					uniforms: uni,
					lights: true,
				} );

				mesh.customDepthMaterial = new THREE.ShaderMaterial( {
					vertexShader: textVert,
					fragmentShader: textFrag,
					uniforms: uni,
					lights: true,
					defines: {
						DEPTH: ""
					}
				} );

				mesh.position.setScalar( 0 );
				mesh.scale.setScalar( 1 );
				mesh.rotation.set( 0, 0, 0 );

				this.root.add( mesh );

				/*-------------------------------
					LineMesh
				-------------------------------*/

				let lineMesh = mesh.children[ 0 ] as THREE.Mesh;

				if ( lineMesh ) {

					lineMesh.material = new THREE.ShaderMaterial( {
						vertexShader: textVert,
						fragmentShader: textFrag,
						uniforms: uni,
						side: THREE.BackSide,
						defines: {
							LINE: ""
						}
					} );

				}

				this.meshList.push( mesh );

			}

		} );

		let rot = new THREE.Euler().copy( this.root.rotation );
		this.root.rotation.set( 0, 0, 0 );
		let size = new THREE.Box3().setFromObject( this.root, true ).getSize( new THREE.Vector3() ).multiply( new THREE.Vector3( 0.8, 0.5, 0.0 ) );
		this.root.rotation.copy( rot );

		let pos = this.root.position;
		let qua = this.root.quaternion;

		this.body = new CANNON.Body( { mass: 65 } );
		this.baseSize = new CANNON.Vec3( size.x / 2, size.y / 2, size.z / 2 );
		this.boxShape = new CANNON.Box( this.baseSize.clone() );
		this.body.addShape( this.boxShape );
		this.body.position.set( pos.x, pos.y, pos.z );
		this.body.quaternion.set( qua.x, qua.y, qua.z, qua.w );

	}

	public update() {

		if ( ! this.root.visible ) return;

		this.root.position.copy( this.body.position as unknown as THREE.Vector3 );
		this.root.quaternion.copy( this.body.quaternion as unknown as THREE.Quaternion );

		if ( this.animator.isAnimatingVariable( 'Sec4TextScale' + this.root.uuid ) ) {

			let scale = this.animator.get<number>( 'Sec4TextScale' + this.root.uuid ) || 0;
			this.root.scale.set( scale, scale, scale );
			this.boxShape.halfExtents.set( this.baseSize.x * scale, this.baseSize.y * scale, this.baseSize.z * scale );
			this.boxShape.updateConvexPolyhedronRepresentation();

		}

	}

	public small() {

		// this.animator.animate( 'Sec4TextScale' + this.root.uuid, 0, 2 );

	}

	public switchText( index: number ) {

		this.animator.setValue( 'Sec4TextSwap' + this.root.uuid, 0 );
		this.animator.animate( 'Sec4TextSwap' + this.root.uuid, 1 );

		for ( let i = 0; i < this.meshList.length; i ++ ) {

			let v = i == index;

			if ( v ) this.meshList[ i ].visible = true;


			this.animator.animate( 'visibility' + this.root.name + i, v ? 1 : 0, 1, () => {

				if ( ! v ) this.meshList[ i ].visible = false;

			} );

		}

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'Sec4TextVisibility' + this.root.uuid, visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );


	}

}
