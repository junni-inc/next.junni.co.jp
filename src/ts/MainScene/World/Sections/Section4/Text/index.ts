import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

export class Text {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	public mesh: THREE.Object3D;
	public body: CANNON.Body;
	private baseSize: CANNON.Vec3;
	private boxShape: CANNON.Box;

	constructor( mesh: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.mesh = mesh;
		this.mesh.traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				mesh.castShadow = true;
				mesh.receiveShadow = true;

			}

		} );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.animator.add( {
			name: 'Sec4TextScale' + this.mesh.uuid,
			initValue: 1,
			easing: ORE.Easings.easeOutCubic
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let size = new THREE.Box3().setFromObject( this.mesh ).getSize( new THREE.Vector3() );
		let worldPos = this.mesh.getWorldPosition( new THREE.Vector3() );

		this.body = new CANNON.Body( { mass: 1 } );
		this.baseSize = new CANNON.Vec3( size.x / 2, size.y / 2, size.z / 2 );
		this.boxShape = new CANNON.Box( this.baseSize.clone() );
		this.body.addShape( this.boxShape );
		this.body.position.set( worldPos.x, worldPos.y, worldPos.z );

	}

	public update() {

		this.mesh.position.copy( this.body.position as unknown as THREE.Vector3 );
		this.mesh.quaternion.copy( this.body.quaternion as unknown as THREE.Quaternion );

		if ( this.animator.isAnimatingVariable( 'Sec4TextScale' + this.mesh.uuid ) ) {

			let scale = this.animator.get<number>( 'Sec4TextScale' + this.mesh.uuid ) || 0;
			this.mesh.scale.set( scale, scale, scale );
			this.boxShape.halfExtents.set( this.baseSize.x * scale, this.baseSize.y * scale, this.baseSize.z * scale );
			this.boxShape.updateConvexPolyhedronRepresentation();

		}

	}

	public small() {

		this.animator.animate( 'Sec4TextScale' + this.mesh.uuid, 0, 2 );

	}

}
