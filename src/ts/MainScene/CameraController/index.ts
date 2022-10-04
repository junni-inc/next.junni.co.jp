import * as THREE from 'three';
import * as ORE from 'ore-three';

export type CameraTransform = {
	position: THREE.Vector3;
	targetPosition: THREE.Vector3;
	fov: number,
	fovCalculated: number
}

export class CameraController {

	private animator: ORE.Animator;
	private portraitWeight: number = 0;

	// camera

	private camera: THREE.PerspectiveCamera;
	private baseCamera: THREE.PerspectiveCamera;

	// cursor

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cursorPosDelayVel: THREE.Vector2;

	// state

	private time: number = 0;
	private shakeTime: number = 0;

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
			initValue: 0,
		} );

		this.animator.add( {
			name: 'cameraMoveRange',
			initValue: new THREE.Vector2( 0.1, 0.1 ),
			userData: {
				pane: {}
			}
		} );

		this.animator.add( {
			name: 'cameraShake',
			initValue: 0,
			userData: {
				pane: {
					min: 0,
					max: 1
				}
			}
		} );

		this.animator.add( {
			name: 'cameraShakeTimeScale',
			initValue: 1,
			userData: {
				pane: {
					min: 0,
					max: 10
				}
			}
		} );

		this.animator.add( {
			name: 'cameraFovOffset',
			initValue: 0,
			userData: {
				pane: {
					min: - 50,
					max: 50
				}
			}
		} );

		this.animator.add( {
			name: 'cameraMove',
			initValue: 0,
			userData: {
				pane: {
					min: 0,
					max: 1
				}
			}
		} );

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cursorPosDelayVel = new THREE.Vector2();

	}

	public updateTransform( cameraTransform: CameraTransform ) {

		this.animator.setValue( 'cameraPos', cameraTransform.position );
		this.animator.setValue( 'cameraTargetPos', cameraTransform.targetPosition );
		this.animator.setValue( 'cameraFov', cameraTransform.fov );

		this.camera.fov = cameraTransform.fovCalculated + ( this.animator.get<number>( 'cameraFovOffset' ) || 0 );
		this.camera.updateProjectionMatrix();

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( 0.3, deltaTime ) * 0.3;

		this.time += deltaTime;

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

		let fovOffset = this.animator.get<number>( 'cameraFovOffset' ) || 0;

		if ( fovOffset > 0 ) {

			this.camera.position.add( new THREE.Vector3( 0.0, 0.0, - fovOffset * 0.05 ).applyQuaternion( this.camera.quaternion ) );

		}

		let cameraMove = this.animator.get<number>( 'cameraMove' ) || 0;

		if ( cameraMove ) {

			let x = Math.sin( this.time ) * 1.5 * cameraMove * 0.0;
			let y = Math.cos( this.time * 1.3 ) * 0.1 * cameraMove;

			this.camera.position.add( new THREE.Vector3( x, y, 0.0 ) );

		}

		/*------------------------
			Target
		------------------------*/

		this.camera.lookAt( this.animator.get<THREE.Vector3>( 'cameraTargetPos' ) || new THREE.Vector3() );

		/*-------------------------------
			Shake
		-------------------------------*/

		let shake = this.animator.get<number>( 'cameraShake' ) || 0;

		if ( shake > 0 ) {

			let timeScale = this.animator.get<number>( 'cameraShakeTimeScale' ) || 1;

			this.shakeTime += deltaTime * timeScale;

			this.camera.applyQuaternion( new THREE.Quaternion().setFromEuler( new THREE.Euler(
				Math.sin( this.shakeTime * 7.0 ) * Math.sin( this.shakeTime * 4.0 ) * 0.1 * shake,
				Math.sin( this.shakeTime * 3.3 ) * Math.sin( this.shakeTime * 5.2 ) * 0.1 * shake,
			) ) );

		}

	}

	public resize( info: ORE.LayerInfo ) {

		this.portraitWeight = info.size.portraitWeight;

	}

	public changeRange( range: THREE.Vector2 ) {

		this.animator.animate( 'cameraMoveRange', range );

	}

	public shake( power: number = 0.15, duration : number = 1.0, shakeTimeScale: number = 8 ) {

		this.animator.setValue( 'cameraShakeTimeScale', shakeTimeScale );

		this.animator.animate( 'cameraShake', power, duration, () => {

			this.animator.setEasing( 'particleTimeScale', ORE.Easings.easeOutCubic );
			this.animator.animate( 'cameraFovOffset', 0, 4 );
			this.animator.animate( 'cameraShake', 0, duration );
			this.animator.animate( 'cameraShakeTimeScale', 2, 4 );

			this.animator.animate( 'particleTimeScale', 1, 4 );

		} );

	}

	public boost( ) {

		this.animator.setEasing( 'particleTimeScale', ORE.Easings.easeOutCubic );

		this.animator.setEasing( 'cameraShake', ORE.Easings.easeInOutCubic );

		this.animator.animate( 'cameraShakeTimeScale', 8, 0.8 );
		this.animator.animate( 'cameraShake', 0.15, 0.8, () => {

			this.animator.setEasing( 'particleTimeScale', ORE.Easings.easeOutCubic );
			this.animator.animate( 'cameraFovOffset', 0, 4 );
			this.animator.animate( 'cameraShake', 0, 2 );
			this.animator.animate( 'cameraShakeTimeScale', 2, 4 );

			this.animator.animate( 'particleTimeScale', 1, 4 );

		} );

	}

	public switchCameraMove( enable: boolean ) {

		this.animator.animate( 'cameraMove', enable ? 1 : 0, 3 );

	}

}
