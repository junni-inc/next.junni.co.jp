import * as THREE from 'three';
import * as ORE from 'ore-three';

export class CursorLight extends THREE.DirectionalLight {

	private goalPos: THREE.Vector3 = new THREE.Vector3();
	private currentPos: THREE.Vector3 = new THREE.Vector3();
	private velocity: THREE.Vector3 = new THREE.Vector3();

	// private helper: THREE.PointLightHelper;

	constructor() {

		super();

		this.goalPos.set( - 1.0, - 1.0, - 0.5 );

	}

	public update( deltaTime: number ) {

		let diff = this.goalPos.clone().sub( this.currentPos );
		this.velocity.add( diff.multiplyScalar( deltaTime * 2.5 ) );
		this.velocity.multiplyScalar( 0.8 );

		this.currentPos.add( this.velocity );
		this.position.copy( this.currentPos );

	}

	public hover( args: ORE.TouchEventArgs ) {

		this.goalPos.set( args.screenPosition.x, args.screenPosition.y, - 0.5 );

	}

}
