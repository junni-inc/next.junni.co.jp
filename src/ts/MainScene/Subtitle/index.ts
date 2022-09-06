import { NoiseText } from '../NoiseText';

export class Subtitles {

	private elm: HTMLElement;

	private noiseTextList: NoiseText[] = [];

	private textList: string[] = [
		"",
		"理想を追求するために柔軟であり続けます。",
		"革新的な提案を実現するために 私たちは挑戦をやめません。",
		"創作をすることで多様な感動と成果をもたらします。"
	];

	constructor( ) {

		this.elm = document.querySelector( '.subtitles' ) as HTMLElement;

	}

	public changeSection( sectionIndex: number ) {

		let text = this.textList[ sectionIndex ] || '';

		this.show( text );

	}

	public show( text: string, duration: number = 1.0 ) {

		this.hideAll();

		if ( ! text ) return;

		let textElm = document.createElement( 'p' );
		textElm.classList.add( "subtitles-text" );
		this.elm.appendChild( textElm );

		let noiseText = new NoiseText( textElm );
		noiseText.noise = "このサイト作るの意外と大変なんですよこれが";
		noiseText.show( text, duration, 40 );

		noiseText.onFinishAnimation = () => {

			setTimeout( () => {

				noiseText.hide();

			}, 2000 );

		};

		noiseText.onFinishHide = () => {

			this.noiseTextList = this.noiseTextList.filter( item => ! item.elm.isEqualNode( noiseText.elm ) );
			noiseText.elm.remove();

		};

		this.noiseTextList.push( noiseText );

	}

	public hideAll() {

		this.noiseTextList.forEach( item => item.hide() );

	}

}
