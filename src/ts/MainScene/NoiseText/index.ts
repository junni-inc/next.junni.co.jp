
export class NoiseText {

	public elm: HTMLElement;
	public text: string = '';
	public noise: string = ' ';

	public tickRate: number = 10;
	private startTime: number = 0;
	private duration : number = 0;

	private interval: number | null = null;

	constructor( elm: HTMLElement ) {

		this.elm = elm;

	}

	public show( text: string, duration: number = 1, tickRate?: number ) {

		this.text = text;

		this.stopAnimation();

		this.startTime = new Date().getTime();
		this.elm.innerText = '';
		this.visible = true;

		this.duration = duration;

		if ( tickRate ) {

			this.tickRate = tickRate;

		}

		this.interval = window.setInterval( () => {

			this.draw();

		}, this.tickRate );


	}

	public hide( callBack?: () => any ) {

		this.stopAnimation();

		this.startTime = new Date().getTime();
		this.visible = false;

		if ( callBack ) {

			callBack();

		}

	}

	public clear() {

		this.elm.innerHTML = '';

	}

	private draw() {

		let currentTime = new Date().getTime();
		let time = ( currentTime - this.startTime ) / 1000;

		let st = Math.min( 1.0, time / this.duration );

		let fixedLength = st * this.text.length;
		let randomLength = Math.min( 3, this.text.length - fixedLength );

		let text = '';

		for ( let i = 0; i < fixedLength; i ++ ) {

			text += this.text[ i ];

		}

		for ( let i = 0; i < randomLength; i ++ ) {

			text += this.noise[ Math.floor( Math.random() * ( this.noise.length - 1.0 ) ) ];

		}

		this.elm.innerHTML = text;

		if ( time >= this.duration ) {

			this.stopAnimation();

		}

	}

	private stopAnimation() {

		if ( this.interval === null ) return;

		window.clearInterval( this.interval );

		this.interval = null;

	}

	public set visible( value: boolean ) {

		this.elm.setAttribute( 'data-visible', value ? "true" : "false" );

	}

}
