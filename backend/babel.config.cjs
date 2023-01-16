module.exports = (api) => {
  // transpile down to commonjs for test only
  const cjs = api.env('test')

  const plugins = []
  if (cjs) {
    plugins.push('babel-plugin-transform-import-meta')
//  } else {
//    // add extensions to import paths, this is a workaround until your source is fixed
//    plugins.push(['babel-plugin-transform-import-extension', {
//      'construct': 'construct.js',
//      'enum': 'enum.js',
//      'model': 'model.js',
//      'repository': 'repository.js',
//      'service': 'service.js'
//    }])
  }

  return {
    presets: [
      [
        '@babel/env', {
          targets: { node: true },
          modules: cjs ? 'commonjs' : false
        }
      ],
      '@babel/typescript'
    ],
    plugins: plugins,
    sourceMaps: true
  }
}
