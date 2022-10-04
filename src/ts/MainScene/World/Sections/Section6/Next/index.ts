import * as THREE from 'three';
import * as ORE from 'ore-three';

export class Next {

	private time: number = 0.0;
	private elm: HTMLElement;
	private spanElmList: HTMLSpanElement[];

	constructor( ) {

		this.elm = document.querySelector( '#next' )!;

		let str = this.elm.innerText;

		this.elm.innerHTML = '';

		str.split( "" ).forEach( char => {

			this.elm.innerHTML += '<span>' + char + '</span>';

		} );

		this.spanElmList = Array.from( this.elm.querySelectorAll( 'span' ) );


	}

	public update( deltaTime: number ) {

		this.time += deltaTime;

		this.spanElmList.forEach( ( item, index ) => {

			item.style.color = 'hsl(' + ( this.time * 0.2 % 1.0 - ( index * 0.05 ) ) * 360 + 'deg, 80%, 50%)';

		} );



	}

}
