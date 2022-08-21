import * as ORE from 'ore-three';
import * as THREE from 'three';
import { Section } from '../Sections/Section';

export class Lights {

	private animator: ORE.Animator;

	private scene: THREE.Scene;

	private light1: THREE.DirectionalLight;
	private light1Taraget: THREE.Object3D;
	private light1Using: boolean = false;

	private light2: THREE.DirectionalLight;
	private light2Taraget: THREE.Object3D;
	private light2Using: boolean = false;


	private helpers: THREE.DirectionalLightHelper[] = [];

	constructor( scene: THREE.Scene ) {

		this.scene = scene;

		this.light1 = new THREE.DirectionalLight();
		scene.add( this.light1 );

		this.light1Taraget = new THREE.Object3D();
		this.scene.add( this.light1Taraget );

		this.light1.target = this.light1Taraget;

		// shadowmap (only light1)

		this.light1.castShadow = true;
		let shadowSize = 10.0;
		this.light1.shadow.blurSamples = 100;
		this.light1.shadow.camera.left = - shadowSize;
		this.light1.shadow.camera.right = shadowSize;
		this.light1.shadow.camera.top = shadowSize;
		this.light1.shadow.camera.bottom = - shadowSize;
		this.light1.shadow.camera.far = 35.0;
		this.light1.shadow.bias = - 0.002;
		this.light1.shadow.mapSize.set( 1024, 1024 );

		this.light2 = new THREE.DirectionalLight();
		scene.add( this.light2 );

		this.light2Taraget = new THREE.Object3D();
		this.scene.add( this.light2Taraget );

		this.light2.target = this.light2Taraget;

		// helpers

		let helper = new THREE.DirectionalLightHelper( this.light1 );
		scene.add( helper );

		this.helpers.push( helper );

		helper = new THREE.DirectionalLightHelper( this.light2 );
		scene.add( helper );

		this.helpers.push( helper );

		this.animator = window.gManager.animator;

		this.animator.add( {
			name: 'light1Position',
			initValue: new THREE.Vector3()
		} );

		this.animator.add( {
			name: 'light1TargetPosition',
			initValue: new THREE.Vector3(),
			easing: ORE.Easings.easeOutCubic,
		} );

		this.animator.add( {
			name: 'light1Intensity',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic,
		} );

		this.animator.add( {
			name: 'light2Position',
			initValue: new THREE.Vector3(),
			easing: ORE.Easings.easeOutCubic,
		} );

		this.animator.add( {
			name: 'light2TargetPosition',
			initValue: new THREE.Vector3(),
			easing: ORE.Easings.easeOutCubic,
		} );

		this.animator.add( {
			name: 'light2Intensity',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic,
		} );

	}

	public update( deltaTime: number ) {

		this.light1.position.copy( this.animator.get( 'light1Position' ) || new THREE.Vector3() );
		this.light1Taraget.position.copy( this.animator.get( 'light1TargetPosition' ) || new THREE.Vector3() );
		this.light1.intensity = this.animator.get<number>( 'light1Intensity' ) || 0;

		this.light2.position.copy( this.animator.get( 'light2Position' ) || new THREE.Vector3() );
		this.light2Taraget.position.copy( this.animator.get( 'light2TargetPosition' ) || new THREE.Vector3() );
		this.light2.intensity = this.animator.get<number>( 'light2Intensity' ) || 0;

		this.helpers.forEach( item => item.update() );

	}

	public changeSection( section: Section ) {

		if ( section.light1Data ) {

			let lightData = section.light1Data;

			if ( this.light1Using ) {

				this.animator.animate( 'light1Position', lightData.position );
				this.animator.animate( 'light1TargetPosition', lightData.targetPosition );
				this.animator.animate( 'light1Intensity', lightData.intensity );

			} else {

				this.animator.setValue( 'light1Position', lightData.position );
				this.animator.setValue( 'light1TargetPosition', lightData.targetPosition );
				this.animator.setValue( 'light1Intensity', lightData.intensity );

			}

			this.light1Using = true;

		} else {

			this.animator.animate( 'light1Intensity', 0, 1, () => {

				this.light1Using = false;

			} );

		}

		if ( section.light2Data ) {

			let lightData = section.light2Data;

			if ( this.light2Using ) {

				this.animator.animate( 'light2Position', lightData.position );
				this.animator.animate( 'light2TargetPosition', lightData.targetPosition );
				this.animator.animate( 'light2Intensity', lightData.intensity );

			} else {

				this.animator.setValue( 'light2Position', lightData.position );
				this.animator.setValue( 'light2TargetPosition', lightData.targetPosition );
				this.animator.setValue( 'light2Intensity', lightData.intensity );

			}

			this.light2Using = true;

		} else {

			this.animator.animate( 'light2Intensity', 0, 1, () => {

				this.light2Using = false;

			} );

		}


	}

}
