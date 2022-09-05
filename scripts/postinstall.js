const { copyFile } = require('node:fs/promises');

try {
  const rootDir = process.cwd(); 

  (async () => {
    await copyFile(`${rootDir}/scripts/assets/nodejs-mobile.build.gradle`, `${rootDir}/node_modules/nodejs-mobile-react-native/android/build.gradle`);
    console.log('build.gradle file from nodejs-mobile-react-native replaced');
  })()
} catch (e) {
  console.log('Failed to replace build.gradle file from node-js-mobile-react-native : ', e.message);
}
