import * as THREE from 'three';
import * as ORE from 'ore-three';

export type CameraTransform = {
	position: THREE.Vector3;
	targetPosition: THREE.Vector3;
	fov: number
}

export class CameraController {

	private animator: ORE.Animator;

	// camera

	private camera: THREE.PerspectiveCamera;
	private baseCamera: THREE.PerspectiveCamera;

	// cursor

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cursorPosDelayVel: THREE.Vector2;

	private posData = {
		base: {
			pos: new THREE.Vector3( 0, 0, 3.49641 ),
			target: new THREE.Vector3( 0, 0, 0 )
		},
	};

	constructor( obj: THREE.PerspectiveCamera ) {

		this.camera = obj;
		this.baseCamera = new THREE.PerspectiveCamera( 40, 1.0, 0.1, 1000 );

		/*------------------------
			Animator
		------------------------*/

		this.animator = window.gManager.animator;

		this.animator.add( {
			name: 'cameraPos',
			initValue: this.posData.base.pos.clone(),
		} );

		this.animator.add( {
			name: 'cameraTargetPos',
			initValue: this.posData.base.target.clone(),
		} );

		this.animator.add( {
			name: 'cameraFov',
			initValue: 0
		} );

		this.animator.add( {
			name: 'cameraMoveRange',
			initValue: new THREE.Vector2( 0.1, 0.1 )
		} );

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cursorPosDelayVel = new THREE.Vector2();

	}

	public updateTransform( cameraTransform: CameraTransform ) {

		this.animator.setValue( 'cameraPos', cameraTransform.position );
		this.animator.setValue( 'cameraTargetPos', cameraTransform.targetPosition );
		this.animator.setValue( 'cameraFov', cameraTransform.fov );

		this.camera.fov = cameraTransform.fov;
		this.camera.updateProjectionMatrix();

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

		let basePos = this.animator.get<THREE.Vector3>( 'cameraPos' ) || new THREE.Vector3();

		let moveRange = this.animator.get( 'cameraMoveRange' ) as THREE.Vector2;

		this.camera.position.set(
			basePos.x + this.cursorPosDelay.x * moveRange.x,
			basePos.y + this.cursorPosDelay.y * moveRange.y,
			basePos.z
		);

		/*------------------------
			Target
		------------------------*/

		this.camera.lookAt( this.animator.get<THREE.Vector3>( 'cameraTargetPos' ) || new THREE.Vector3() );

	}

	public resize( info: ORE.LayerInfo ) {

		this.camera.fov = this.baseCamera.fov * 1.0 + info.size.portraitWeight * 20.0;
		this.camera.updateProjectionMatrix();

	}

	public changeRange( range: THREE.Vector2 ) {

		this.animator.animate( 'cameraMoveRange', range );

	}

}
