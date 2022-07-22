import * as THREE from 'three';
import * as ORE from 'ore-three';

export class CameraController {

	private camera: THREE.PerspectiveCamera
	private cameraBasePos: THREE.Vector3;
	private cameraTargetPos: THREE.Vector3;

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cameraMoveWeight: THREE.Vector2;

	private baseCamera: THREE.PerspectiveCamera;

	constructor( camera: THREE.PerspectiveCamera, data?: THREE.Object3D ) {

		this.camera = camera;

		let cameraModel = data && data.getObjectByName( 'Camera' ) as THREE.PerspectiveCamera;
		this.cameraBasePos = cameraModel ? cameraModel.getWorldPosition( new THREE.Vector3() ) : new THREE.Vector3( 0, 1, 5 );

		let cameraTarget = data && data.getObjectByName( 'CameraTarget' );
		this.cameraTargetPos = cameraTarget ? cameraTarget.getWorldPosition( new THREE.Vector3() ) : new THREE.Vector3( 0, 1, 0 );

		let baseCamera = data && data.getObjectByName( 'Camera' );
		this.baseCamera = baseCamera ? ( baseCamera.children[ 0 ] as THREE.PerspectiveCamera ) : camera.clone() as THREE.PerspectiveCamera;

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cameraMoveWeight = new THREE.Vector2( 1.0, 1.0 );

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( 0.3, deltaTime );

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );
		this.cursorPosDelay.add( diff );

		this.camera.position.set( this.cameraBasePos.x + this.cursorPosDelay.x * this.cameraMoveWeight.x, this.cameraBasePos.y + this.cursorPosDelay.y * this.cameraMoveWeight.y, this.cameraBasePos.z );

		if ( this.cameraTargetPos ) {

			this.camera.lookAt( this.cameraTargetPos );

		}

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.camera.fov = this.baseCamera.fov + layerInfo.size.portraitWeight * 20.0;
		this.camera.updateProjectionMatrix();

	}

}
