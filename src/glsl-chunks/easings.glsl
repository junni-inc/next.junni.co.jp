//  ------

// https://easings.net/

float easeInQuart( float t ) {

	return t * t * t;

}

float easeOutQuart( float t ) {

	return 1.0 - ( --t ) * t * t * t ;

}

float easeInOutQuad( float t ) {

	return t < 0.5 ? 2.0 * t * t : -1.0 + ( 4.0 - 2.0 * t ) * t;

}


float easeInOutQuart( float t ) {

	return t < 0.5 ? 8.0 * t * t * t * t : 1.0 -8.0 * ( --t ) * t * t * t;

}

// ------

float sigmoid( float x ) {
		
	float weight = 6.0;

	float e1 = exp( -weight * ( 2.0 * x - 1.0 ) );
	float e2 = exp( -weight );

	return ( 1.0 + ( 1.0 - e1 ) / ( 1.0 + e1 ) * ( 1.0 + e2 ) / ( 1.0 - e2 ) ) / 2.0;

}

#pragma glslify: export (sigmoid)
#pragma glslify: export (easeOutQuart)
#pragma glslify: export (easeInOutQuad)
#pragma glslify: export (easeInOutQuart)
