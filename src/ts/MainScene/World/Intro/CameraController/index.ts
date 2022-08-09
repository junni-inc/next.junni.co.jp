import * as THREE from 'three';
import * as ORE from 'ore-three';

export type CameraTransform = {
	position: THREE.Vector3;
	targetPosition: THREE.Vector3;
	fov: number
}

export class CameraController {

	// camera

	private camera: THREE.PerspectiveCamera;
	private baseCamera: THREE.PerspectiveCamera;

	// cursor

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cursorPosDelayVel: THREE.Vector2;

	// param

	private moveRange: THREE.Vector2;

	// pos

	private basePos: THREE.Vector3;
	private target: THREE.Vector3;

	private posData = {
		base: {
			pos: new THREE.Vector3( 0, 0, 5 ),
			target: new THREE.Vector3( 0, 0, 0 )
		},
	};

	constructor( obj: THREE.PerspectiveCamera ) {

		this.camera = obj;
		this.baseCamera = new THREE.PerspectiveCamera( 40, 1.0, 0.1, 1000 );

		// param

		this.moveRange = new THREE.Vector2( 0.1, 0.1 );

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cursorPosDelayVel = new THREE.Vector2();

		this.basePos = new THREE.Vector3();
		this.basePos.copy( this.posData.base.pos );

		this.target = new THREE.Vector3();
		this.target.copy( this.posData.base.target );

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( 0.3, deltaTime ) * 0.3;

		/*------------------------
			update hover
		------------------------*/

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );

		this.cursorPosDelayVel.add( diff.multiplyScalar( 5.0 ) );
		this.cursorPosDelayVel.multiplyScalar( 0.85 );

		this.cursorPosDelay.add( this.cursorPosDelayVel );

		/*------------------------
			Position
		------------------------*/


		this.camera.position.set(
			this.basePos.x + this.cursorPosDelay.x * this.moveRange.x,
			this.basePos.y + this.cursorPosDelay.y * this.moveRange.y,
			this.basePos.z
		);

		/*------------------------
			Target
		------------------------*/

		this.camera.lookAt( this.target );

	}

	public resize( info: ORE.LayerInfo ) {

		this.camera.fov = this.baseCamera.fov * 1.0 + info.size.portraitWeight * 20.0;
		this.camera.updateProjectionMatrix();

	}

}
