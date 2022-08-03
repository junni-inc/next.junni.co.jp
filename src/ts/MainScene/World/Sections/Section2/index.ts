import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Ground } from './Ground';
import { Displays } from './Displays';

export class Section2 extends Section {

	private ground?: Ground;
	private displays?: Displays;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_2', parentUniforms );

		this.ppParam.bloomBrightness = 1.0;

		let light = new THREE.DirectionalLight();
		light.position.set( 0.5, 0.0, - 0.9 );
		this.add( light );

		light = new THREE.DirectionalLight();
		light.position.set( - 1.5, 0.3, - 1 );
		this.add( light );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

		/*-------------------------------
			Ground
		-------------------------------*/

		this.ground = new Ground( this.getObjectByName( 'Ground' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Displays
		-------------------------------*/

		this.displays = new Displays( this.getObjectByName( 'Displays' ) as THREE.Object3D, this.commonUniforms );

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		if ( this.viewing == 'viewing' ) {

			// this.bakuTransform.rotation.premultiply( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.01, 0.0 ) ) );

		}

	}

	public resize( info: ORE.LayerInfo ) {

		super.resize( info );

	}

}
