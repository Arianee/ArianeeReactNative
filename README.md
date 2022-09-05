# How to set up Arianee with React Native

### Installation guide

1. Install all dependencies for React Native CLI [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

2. Use react-native to create the project boilerplate [Create React Native App](https://reactnative.dev/docs/environment-setup)

   `npx react-native init ArianeeReactNative`

3. Install nodejs-mobile-react-native [Nodejs Mobile](https://code.janeasystems.com/nodejs-mobile/getting-started-react-native)

   `npm install nodejs-mobile-react-native --save`

4. For iOS install pod for linking the native code parts

   `cd ios && pod install && cd ..`

5. For setup Nodejs Mobile environment go to:

   `cd nodejs-assets/nodejs-project/`

6. Rename the follow files:

   `from sample-package.json to package.json`

   `from sample-main.js to main.js`

7. Install Arianee

   `npm install @arianee/arianeejs --save`

8. Install @ethersproject/shims

   `npm install @ethersproject/shims --save`

9. Modify metro.config.js file to avoid problems with Nodejs Mobile [Nodejs Mobile Duplicate module name](https://code.janeasystems.com/nodejs-mobile/getting-started-react-native#duplicate-module-name)

   ```javascript
   const blacklist = require('metro-config/src/defaults/exclusionList');

   module.exports = {
     transformer: {
       getTransformOptions: async () => ({
         transform: {
           experimentalImportSupport: false,
           inlineRequires: true,
         },
       }),
     },
     resolver: {
       blacklistRE: blacklist([
         /\/nodejs-assets\/nodejs-project\/package.json/,
         /\/nodejs-assets\/nodejs-project\/yarn*/,
         /\/android\/.*/,
         /\/ios\/.*/,
       ]),
     },
   };
   ```

10. For Android, there is a problem importing files starting with underscores (`__mocks__` for example) to fix this we have to replace `node_modules/nodejs-mobile-react-native/android/build.gradle` file with the updated file from this repository `scripts/assets/nodejs-mobile.build.gradle`. We create a script "postinstall" in package.json to automate this process. More information about this problem [here](https://github.com/JaneaSystems/nodejs-mobile/issues/60#issuecomment-378088756)

### Start using Arianee

11. Setup the bridge within nodejs-mobile et react-native,go to `nodejs-assets/nodejs-project/main.js` and add the following code.

    ```javascript
    require('@ethersproject/shims'); // add special shims to make arianeejs works

    const rn_bridge = require('rn-bridge');
    const {Arianee} = require('@arianee/arianeejs');
    let wallet;

    // Echo every message received from react-native.
    rn_bridge.channel.on('message', async (msg) => {
    const arianeeLib = new Arianee();
    const arianee = await arianeeLib.init();
    const payload = JSON.parse(msg);

    if (payload.type === 'init_wallet') {
        (async () => {
        try {
            wallet = arianee.fromRandomMnemonic();
            rn_bridge.channel.send(
            JSON.stringify({
                type: 'wallet_initiated',
                wallet: wallet,
            }),
            );
        } catch (e) {
            rn_bridge.channel.send(
            JSON.stringify({
                type: 'error',
                message: `Wallet not initialized. An error occured : ${e.message}`,
            }),
            );
        }
        })();
    }
    ```

12. Add the following code inside your React component in App.js to get started with consuming the API.

    ```javascript
    import nodejs from 'nodejs-mobile-react-native';

    useEffect(() => {
      nodejs.start('main.js');

      nodejs.channel.addListener(
        'message',
        msg => {
          const payload = JSON.parse(msg);

          if (payload.type === 'wallet_initiated') {
            console.log('account', payload.wallet._account);
          }

          if (payload.type === 'error') {
            console.log('error', payload.message);
          }
        },
        this,
      );
    }, []);

    const createWallet = async () => {
      nodejs.channel.send(
        JSON.stringify({
          type: 'init_wallet',
        }),
      );
    };
    ```

13. Test it

    `npx react-native run-ios`

    or

    `npx react-native run-android`
