import * as THREE from 'three';
import * as ORE from 'ore-three';

export class EasyRaycaster extends THREE.EventDispatcher {

	private raycaster: THREE.Raycaster;
	public touchableObjects: THREE.Object3D[];

	/*-------------------------------
		Hover
	-------------------------------*/
	private hoverMemObj: THREE.Object3D | HTMLElement | null;

	/*-------------------------------
		Click
	-------------------------------*/
	private clickStart: number;
	private touchStartObj: THREE.Object3D | HTMLElement | null;

	constructor() {

		super();

		this.raycaster = new THREE.Raycaster();
		this.touchableObjects = [];
		this.hoverMemObj = null;
		this.touchStartObj = null;
		this.clickStart = 0;

	}

	private dispatchMouseEvent( type: 'enter' | 'out' | 'hover' | 'click', name: string, intersection?: THREE.Intersection ) {

		this.dispatchEvent( {
			type: type + '/' + name,
			intersection: intersection
		} );

	}

	public getIntersection( cursor: THREE.Vector2, camera: THREE.Camera, objects: THREE.Object3D[] ) {

		this.raycaster.setFromCamera( cursor, camera );

		let intersection = this.raycaster.intersectObjects( objects );

		for ( let i = 0; i < intersection.length; i ++ ) {

			if ( intersection[ i ].object.visible ) return intersection[ i ];

		}

		return null;

	}

	public update( cursor: THREE.Vector2, camera: THREE.Camera ) {

		let intersection = this.getIntersection( cursor, camera, this.touchableObjects );

		if ( intersection ) {

			if ( this.hoverMemObj ) {

				if ( 'isObject3D' in this.hoverMemObj ) {

					if ( intersection.object.uuid == this.hoverMemObj.uuid ) {

						this.dispatchMouseEvent( 'hover', intersection.object.name, intersection );

					} else {

						this.dispatchMouseEvent( 'out', this.hoverMemObj.name );
						this.dispatchMouseEvent( 'enter', intersection.object.name, intersection );

					}

				}

			} else {

				this.dispatchMouseEvent( 'enter', intersection.object.name, intersection );

			}

			this.hoverMemObj = intersection.object;

		} else {

			if ( this.hoverMemObj ) {

				if ( 'isObject3D' in this.hoverMemObj ) {

					this.dispatchMouseEvent( 'out', this.hoverMemObj.name );

				}

			}

		}

		this.hoverMemObj = intersection && intersection.object || null;

		return [];

	}

	public touchStart( cursor: THREE.Vector2, camera: THREE.Camera ) {

		let intersection = this.getIntersection( cursor, camera, this.touchableObjects );

		if ( intersection ) {

			this.clickStart = new Date().getTime();
			this.touchStartObj = intersection.object;

		}

	}

	public touchEnd( cursor: THREE.Vector2, camera: THREE.Camera ) {

		let intersection = this.getIntersection( cursor, camera, this.touchableObjects );

		if ( intersection && this.touchStartObj ) {

			let diff = new Date().getTime() - this.clickStart;

			if ( 'isObject3D' in this.touchStartObj ) {

				if ( intersection.object.uuid == this.touchStartObj.uuid && diff < 300 ) {

					this.dispatchMouseEvent( 'click', intersection.object.name, intersection );

				}

			}

		}

	}

}
