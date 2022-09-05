import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  Image,
} from 'react-native';
import nodejs from 'nodejs-mobile-react-native';

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [nftData, setNFTData] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [requestOwnershipResp, setRequestOwnershipResp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    nodejs.start('main.js');

    nodejs.channel.addListener(
      'message',
      msg => {
        const payload = JSON.parse(msg);

        if (payload.type === 'wallet_initiated') {
          setWallet(payload.wallet);
        }

        if (payload.type === 'certificate_created') {
          setCertificate(payload.certificate);
        }

        if (payload.type === 'ownership_success') {
          setRequestOwnershipResp(payload.ownership);
          console.log('ownership', payload.ownership);
        }

        if (payload.type === 'error') {
          setError(payload.message);
          console.log('error', payload.message);
        }

        setLoading(false);
      },
      this,
    );
  }, []);

  const handleClick = async () => {
    setLoading(true);
    // Get NFT data
    const nftDemo = await fetch(
      'https://api.bdh-demo.arianee.com/certificate/demo',
    ).then(res => res.json());
    setNFTData(nftDemo);

    // Get certificate
    nodejs.channel.send(
      JSON.stringify({
        type: 'get_certificate',
        data: nftDemo,
      }),
    );
  };

  const claimNFT = () => {
    setError(null);
    setLoading(true);
    nodejs.channel.send(
      JSON.stringify({
        type: 'request_ownership',
        data: nftData,
      }),
    );
  };

  const createWallet = () => {
    setLoading(true);
    nodejs.channel.send(
      JSON.stringify({
        type: 'init_wallet',
      }),
    );
  };

  return (
    <View style={styles.container}>
      <TouchableHighlight
        style={styles.menu}
        onPress={() => setIsMenuOpen(!isMenuOpen)}>
        <Image
          style={styles.menuImage}
          source={require('./src/assets/menu_burger.png')}
        />
      </TouchableHighlight>

      <Image
        style={styles.logo}
        source={require('./src/assets/arianee_logo.png')}
      />

      {!wallet ? (
        <>
          <Text style={styles.title}>To start create a wallet</Text>
          <TouchableHighlight
            style={styles.button}
            onPress={() => createWallet()}>
            <Text style={{color: '#FFF'}}>Create Wallet</Text>
          </TouchableHighlight>
        </>
      ) : (
        <>
          {requestOwnershipResp?.receipt.status && (
            <Text>Congratulation you own this NFT</Text>
          )}

          {!requestOwnershipResp?.receipt.status ?? (
            <Text>Fail to request ownership</Text>
          )}
        </>
      )}

      {nftData && wallet && (
        <>
          <Text style={styles.title}>Demo NFT</Text>
          <Text>Arianee ID: {nftData.arianeeId}</Text>
          <Text>Passphrase: {nftData.passphrase}</Text>
          <Text>Deeplink: {nftData.deeplink}</Text>

          <TouchableHighlight style={styles.button} onPress={() => claimNFT()}>
            <View>
              <Text>Claim NFT</Text>
            </View>
          </TouchableHighlight>
        </>
      )}
      {loading && <ActivityIndicator />}

      {error && (
        <View style={styles.errorWrapper}>
          <Text>Error: {error}</Text>
        </View>
      )}

      {isMenuOpen && (
        <View style={styles.drawer}>
          {!wallet ? (
            <Text style={styles.drawerText}>
              You have to create a wallet first
            </Text>
          ) : (
            <>
              <Text style={styles.drawerText}>
                Wallet Address: {wallet._account.address}
              </Text>
              <Text style={styles.drawerText}>
                Private Key: {wallet._account.privateKey}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
  },
  menuImage: {
    height: 50,
    width: 50,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '100%',
    paddingTop: 200,
    padding: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  drawerText: {
    marginTop: 30,
  },
  logo: {
    marginTop: 200,
    marginBottom: 100,
  },
  title: {
    fontSize: 25,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#bc923e',
    borderRadius: 5,
  },
  errorWrapper: {
    paddingHorizontal: 20,
  },
});

export default App;
