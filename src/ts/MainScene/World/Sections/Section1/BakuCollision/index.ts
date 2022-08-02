import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

export type PhysicsData = {
	body: CANNON.Body,
	mesh: THREE.Mesh
}

export class BakuCollision extends THREE.Object3D {

	private animator: ORE.Animator;

	private cannonWorld: CANNON.World;
	private commonUniforms: ORE.Uniforms;

	private mesh: THREE.Mesh;
	private body: CANNON.Body;
	private kinematicBody: CANNON.Body;

	constructor( cannonWorld: CANNON.World, parentUniforms: ORE.Uniforms ) {

		super();

		this.cannonWorld = cannonWorld;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;
		this.animator.add( {
			name: 'bakuCollisionPosition',
			initValue: new THREE.Vector3( 0, 1, - 1 ),
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let radius = 0.35;
		this.mesh = new THREE.Mesh( new THREE.SphereBufferGeometry( radius ), new THREE.MeshNormalMaterial() );
		this.mesh.visible = false;
		this.add( this.mesh );

		this.body = new CANNON.Body( { type: CANNON.Body.DYNAMIC, mass: 1000 } );
		this.body.addShape( new CANNON.Sphere( radius ) );
		this.body.position.copy( this.animator.get( 'bakuCollisionPosition' ) as CANNON.Vec3 );
		this.body.sleep();
		this.cannonWorld.addBody( this.body );

		this.kinematicBody = new CANNON.Body( { type: CANNON.Body.KINEMATIC } );
		this.kinematicBody.addShape( new CANNON.Sphere( radius * 1.7 ) );
		this.kinematicBody.position.set( 0, 0, - 10 );
		this.cannonWorld.addBody( this.kinematicBody );

		// @ts-ignore
		this.body.name = 'baku';

	}

	public update( deltaTime: number ) {

		this.mesh.position.copy( this.body.position as unknown as THREE.Vector3 );

	}

	public splash() {

		this.body.wakeUp();
		this.body.velocity.set( - 0.5, 1, 5 );

		setTimeout( () => {

			this.animator.animate( 'bakuCollisionPosition', new THREE.Vector3( 0, 1, 0 ), 1 );
			this.kinematicBody.position.set( 0, 1, 0 );

		}, 500 );

	}

}
