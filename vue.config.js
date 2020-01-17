var version = require('./package.json').version;
process.env.VUE_APP_VERSION = version;

module.exports = {
  publicPath: "./",
  /*devServer: { https: true },*/
  css: {
    sourceMap: true
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    },
    name: process.env.VUE_APP_SHORT_NAME,
    themeColor: process.env.VUE_APP_THEME_COLOR,
    msTileColor: '#f8f9fa',
    appleMobileWebAppCapable: 'yes',
    iconPaths: {
      favicon32: 'images/icon-32.png',
      favicon16: 'images/icon-16.png',
      appleTouchIcon: 'images/apple/icon-152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'images/icon-270.png'
    },
    manifestOptions: {
      short_name: process.env.VUE_APP_SHORT_NAME,
      background_color: "#f8f9fa",
      icons: [{
          src: "/images/icon-16.png",
          type: "image/png",
          sizes: "16x16"
        },
        {
          src: "/images/icon-24.png",
          type: "image/png",
          sizes: "24x24"
        },
        {
          src: "/images/icon-32.png",
          type: "image/png",
          sizes: "32x32"
        },
        {
          src: "/images/icon-48.png",
          type: "image/png",
          sizes: "48x48"
        },
        {
          src: "/images/icon-64.png",
          type: "image/png",
          sizes: "64x64"
        },
        {
          src: "/images/icon-72.png",
          type: "image/png",
          sizes: "72x72",
          density: "1.5"
        },
        {
          src: "/images/icon-96.png",
          type: "image/png",
          sizes: "96x96"
        },
        {
          src: "/images/icon-128.png",
          type: "image/png",
          sizes: "128x128"
        },
        {
          src: "/images/icon-144.png",
          type: "image/png",
          sizes: "144x144",
          density: "2.0"
        },
        {
          src: "/images/icon-192.png",
          type: "image/png",
          sizes: "192x192",
          density: "4.0"
        },
        {
          src: "/images/icon-256.png",
          type: "image/png",
          sizes: "256x256"
        },
        {
          src: "/images/icon-512.png",
          type: "image/png",
          sizes: "512x512"
        }
      ],
    }
  },
  configureWebpack:{
    resolve: {
      alias: {
        pson: 'pson/dist/PSON.js',
        ByteBuffer: 'bytebuffer',
        Long: 'long'
      },
    }
  }
}