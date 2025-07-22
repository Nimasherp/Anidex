

module.exports =  {
  experimental: {
    esmExternals: 'loose' // In case ESM format (??)
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }] // required to make pdfjs work
    return config
  },
}