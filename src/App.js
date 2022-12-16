/*****************************************/
/* Detect the ABC Wallet Ethereum provider */
/*****************************************/

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import ABCProvider from 'abcwallet-extension-provider-api';
import Caver from 'caver-js';
import styled from 'styled-components'

import "./App.css"
import imgfile from './Frame.svg';
import { callTransfer } from './Contract';

const StyledDiv = styled.div`
  border-bottom: solid black;
`

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [windowABC, setWindowABC] = useState();
  const [web3, setWeb3] = useState();
  const [address, setAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  // check Connected Wallet
  useEffect(() => {
    function checkConnectedWallet() {
      const userData = JSON.parse(sessionStorage.getItem('userAccount'));
      if (userData != null) {
        setUserInfo(userData);
        setIsConnected(true);
      }
    }
    checkConnectedWallet();
    ABCLoader()
  }, []);

  // check ABC Wallect
  const ABCLoader = () => {
    let checkWindowABC = setInterval(() =>
      window.abc !== undefined ? setWindowABC(true) : setWindowABC(false), 1000);
    return () => { clearTimeout(checkWindowABC) }
  }

  const onConnect = async () => {
    try {
      // this returns the provider, or null if it wasn't detected
      const provider = await ABCProvider();
      console.log(provider)
      if (provider) {

        // web3 객체가 있으면 계정 정보를 가져 옵니다. Ethereum에 RPC 요청을 제출하는 데 사용 합니다.
        await provider.request({ method: 'eth_requestAccounts' });

        // http 에서 동작하는 node 에 연결하기 위해 HttpProvider 를 사용해 web3 객체를 생성 합니다.
        const web3 = new Web3(provider);
        setWeb3(web3)
        const userAccount = await web3.eth.getAccounts();

        const chainId = await web3.eth.getChainId();

        const account = userAccount[0];
        setAddress(account)

        let ethBalance = await web3.eth.getBalance(account);  // 지갑 잔고를 가져옵니다.
        ethBalance = web3.utils.fromWei(ethBalance, 'ether'); // 잔액을 Wei로 변환합니다.

        // 유저 정보를 state에 저장합니다.
        saveUserInfo(ethBalance, account, chainId);
        if (userAccount.length === 0) {
          console.log('ABC Wallet 과 연동 하세요');
        }
      }
    } catch (err) {
      console.log(
        '계정을 가져오는 동안 오류가 발생했습니다. 이더리움 클라이언트가 올바르게 구성되었는지 확인하십시오.'
      );
    }
  };

  // 연동해지
  const onDisconnect = () => {
    window.sessionStorage.removeItem('userAccount');
    setUserInfo({});
    setIsConnected(false);
  }

  // 유저정보
  const saveUserInfo = (ethBalance, account, chainId) => {
    const userAccount = {
      account: account,
      balance: ethBalance,
      connectionid: chainId,
    };
    window.sessionStorage.setItem('userAccount', JSON.stringify(userAccount)); //유지될 사용자 데이터
    const userData = JSON.parse(sessionStorage.getItem('userAccount'));
    setUserInfo(userData);
    setIsConnected(true);
  };

  const ConnecteButton = () => (
    windowABC === undefined
      ? <button className="disconnect-button" >
        Loading ABC Wallet
      </button>
      : (windowABC === true
        ? <button className="connect-button" onClick={onConnect}>
          Connect to ABC Wallet
        </button>
        : <button className="connect-button" onClick={() => window.open('https://chrome.google.com/webstore/detail/abc-wallet/mlhakagmgkmonhdonhkpjeebfphligng?hl=ko&', '_blank')}>Download ABC Wallet
        </button>
      )
  )

  const sendValueTransfer = async () => {
    try {
      const tx = {
        from : address,
        to: address,
        gas: 21000,
        value: 10**18,
      }

      const result = await web3.eth
        .sendTransaction(tx)
        .then((receipt) => {
          return receipt
        })
        console.log(result)
    } catch (e) {
      console.log(e)
    }
  }

  const testSignPersonalMessage = async () => {
    try {
      const message = 'My email is john@doe.com - 1537836206101'

      const caver = new Caver(window.abc)
      const result_caver = await caver.rpc.klay.sign(address, message)
      const signer_caver = caver.utils.recover(message, result_caver)
      const verified_caver= signer_caver.toLowerCase() === address.toLowerCase()
      console.log(verified_caver)
      // const result = await web3.eth.personal.sign(message, address, '')
      // const signer = await web3.eth.personal.ecRecover(message, result)
      // const verified = signer.toLowerCase() === address.toLowerCase()

    } catch (e) {
      console.log(e)
    }
  }

  const testSmartContract = async () => {
    try {
      const result = await callTransfer(
        address,
        contractAddress,
        web3
      )
      console.log(result)
    } catch (e) {
      console.log(e)
    }
  }


  return (
    <>
      <div className="app">
        <img src={imgfile} alt="imgfile" />
        <div className="app-wrapper">
          <div className="app-header">
            <h1 style={{ fontWeight: 'normal' }}> <b>ABC Wallet</b> Provider API Demo</h1>
          </div>
          {!isConnected && <ConnecteButton />}
        </div>
        {
          isConnected && (
            <>
              <div className="data-wrapper">
                <div className='completed'><b>Successfully connected to wallet address</b></div>
                <h2 className="app-details">
                  {userInfo.account}
                </h2>
                <h2 className="app-details">
                  Balance: {userInfo.balance}
                </h2>
                <h2 className="app-details">
                  Connection Id: {userInfo.connectionid}
                </h2>
              </div>
              <StyledDiv>
                <button className = "disconnect-button" onClick={testSignPersonalMessage}>
                  Sign Message
                </button>
              </StyledDiv>
              <StyledDiv>
                <button className = "disconnect-button" onClick={sendValueTransfer}>
                  Send Value Transfer Tx
                </button>
              </StyledDiv>
              <StyledDiv>
                <div style={{paddingTop: 10, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                  <label>Token Contract Address: </label>
                  <input
                    style={{padding: '10px', marginLeft: 5}}
                    placeholder='Token Address'
                    value={contractAddress}
                    onChange={e=>setContractAddress(e.target.value)}/>
                </div>
                <div>
                  <button className = "disconnect-button" onClick={testSmartContract}>
                    KIP7/ERC20 Transfer
                  </button>
                </div>
              </StyledDiv>
              <StyledDiv>
                <button className="disconnect-button" onClick={onDisconnect}>
                  Disconnect
                </button>
              </StyledDiv>
            </>
          )
        }
      </div >
    </>
  );
}
export default App;