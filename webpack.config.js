const path = require( 'path' )
module.exports = {
	watch: true,
	watchOptions: {
		aggregateTimeout: 100,
	},
    mode: 'development',
    entry: {
    },
    output: {
    },
    module: {
        rules: [{
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
				test: /\.(vs|fs|glsl)$/,
				exclude: /node_modules/,
				use: [
					'raw-loader',
					{
						loader: 'glslify-loader',
						options: {
							transform: [
								['glslify-hex'],
								['glslify-import']
							],
							basedir: './src/glsl-chunks'
						}
					}
				]
			}
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
		alias: {
            "ore-three": '/packages/ore-three/packages/ore-three/build/ore-three.js',
            "power-mesh": '/packages/power-mesh/packages/power-mesh/build/power-mesh.js',
        }
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename]
		}
	},
	optimization: {
		innerGraph: true
	}
};