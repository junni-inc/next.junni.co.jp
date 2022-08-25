import { NoiseText } from '../NoiseText';

export class Subtitles {

	private elm: HTMLElement;
	private innerElm: HTMLParagraphElement;
	private noiseText: NoiseText;

	private textList: string[] = [
		"",
		"理想を追求するために柔軟であり続けます。",
		"革新的な提案を実現するために 私たちは挑戦をやめません。",
		"創作をすることで多様な感動と成果をもたらします。"
	];

	constructor( ) {

		this.elm = document.querySelector( '.subtitles' ) as HTMLElement;
		this.innerElm = this.elm.querySelector( '.subtitles-text' ) as HTMLParagraphElement;

		this.noiseText = new NoiseText( this.innerElm );
		this.noiseText.noise = "このサイト作るの意外と大変なんですよこれが";

	}

	public changeSection( sectionIndex: number ) {

		let text = this.textList[ sectionIndex ] || '';

		this.noiseText.hide( () => {

			this.noiseText.show( text );

		} );

	}

}
