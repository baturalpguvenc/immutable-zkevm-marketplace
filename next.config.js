/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: false,
};

module.exports = nextConfig;

// module.exports = {
//   webpack(webpackConfig) {
//     return {
//       ...webpackConfig,
//       optimization: {
//         minimize: false,
//       },
//     };
//   },
// };
