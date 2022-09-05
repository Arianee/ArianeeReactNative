require('@ethersproject/shims'); // add special shims to make arianeejs works

const rn_bridge = require('rn-bridge');
const {Arianee} = require('@arianee/arianeejs');
let wallet;

// Echo every message received from react-native.
rn_bridge.channel.on('message', async (msg) => {
  const arianeeLib = new Arianee();
  const arianee = await arianeeLib.init('mainnet');
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

  if (payload.type === 'get_certificate') {
    (async () => {
      try {
        const certificate = await wallet.methods.getCertificate(
          payload.data.certificateId,
          payload.data.passphrase,
        );

        rn_bridge.channel.send(
          JSON.stringify({
            type: 'certificate_created',
            certificate,
          }),
        );
      } catch (e) {
        rn_bridge.channel.send(
          JSON.stringify({
            type: 'error',
            message: `Certificate not created. An error occured : ${e.message}`,
          }),
        );
      }
    })();
  }

  if (payload.type === 'request_ownership') {
    (async () => {
      try {
        const resquestResponse = await wallet.methods.requestCertificateOwnership(
          payload.data.arianeeId,
          payload.data.passphrase,
        );

        rn_bridge.channel.send(
          JSON.stringify({
            type: 'ownership_success',
            ownership: resquestResponse,
          }),
        );
      } catch (e) {
        rn_bridge.channel.send(
          JSON.stringify({
            type: 'error',
            message: `Request ownership fails. An error occured : ${JSON.stringify(e)}`,
          }),
        );

        rn_bridge.channel.send(
          JSON.stringify({
            type: 'ownership_success',
            ownership: {receipt: {status: false}},
          }),
        );
      }
    })();
  }
});