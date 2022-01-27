import React, { useState, useEffect, useRef } from "react";
import web3modal from '../helpers/web3modal'
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import contractABI from "../abi/abi.json"
import { Button, Window, TextField, WindowHeader, WindowContent, LoadingIndicator, Toolbar, Panel, Fieldset } from "react95"
import proxyAbi from "../abi/proxy_abi.json"
const Moralis = require('moralis');

export default function Home() {
  const proxyAddress = "0xA3f32c8cd786dc089Bd1fC175F2707223aeE5d00";
  const msgRef = useRef()
  const serverUrl = "https://jgmsyant2jg0.usemoralis.com:2053/server";
  const appId = "9o0WluuFBIeNvNU9cM27xi2tnoFbC56SBZQPfc2z";
  const [loading, setLoading] = useState(false);
  Moralis.start({ serverUrl, appId });

  let navigate = useNavigate();
  const { user, setUser, instance, setInstance, name, setName } = useAuth()

  const wave = async () => {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(msgRef.current.value, contractABI.abi, signer);

    wavePortalContract.wave("wave").then(() => {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    });
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const instanceProvider = await web3modal.connect();
    setInstance(instanceProvider)
    const provider = new ethers.providers.Web3Provider(instanceProvider);
    const signer = provider.getSigner();

    const addr = await signer.getAddress()
    setUser(await signer.getAddress())

    try {
      const options = { chain: 'mumbai', address: addr };
      const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);

      let token_id;
      for (let i = 0; i < polygonNFTs.result.length; i++) {
        if (polygonNFTs.result[i].token_address === "0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f") {
          token_id = polygonNFTs.result[i].token_id;
          break;
        }
      }

      const proxyReaderContractInstance = new ethers.Contract(proxyAddress, proxyAbi.abi, signer);
      const tokenUri = await proxyReaderContractInstance.tokenURI(token_id);
      const metadataResponse = await fetch(tokenUri);
      const metadata = await metadataResponse.json();

      setName(metadata.name)
      console.log(name)
    } catch (err) {
      console.log(err)
    }

    if (name === "") {
      setName("udtestdev-793960.crypto")
    }

    navigate("/", { replace: false });
  }

  const handleLogout = () => {
    setUser(undefined)
  }

  const nameMarkup = (name === ""
    ? (<span>No domain found</span>)
    : (<span>Used domain: {name}</span>)
  )

  const waveSendMarkup = (loading === true
    ? (<LoadingIndicator></LoadingIndicator>)
    : (<div>
      <TextField id="wave" type="text" style={{ marginTop: "20px", width: "98%", height: "30px" }} placeholder="Enter ETH wallet to send a wave to" ref={msgRef} />
      <Button style={{ marginTop: "20px" }} onClick={wave}>
        Send a wave
      </Button>
    </div>)
  )
  const userMarkup = (user === undefined
    ? (
      <div className="container">
        <p>
          Log in to send a wave.
        </p>
      </div>
    )
    : (
      <div className="container">
        <Fieldset label="User info">
          <p>
            Logged in with {user} wallet
          </p>
          {nameMarkup}
        </Fieldset>
        <br />
        <Fieldset label="Send a wave">
          {waveSendMarkup}
        </Fieldset>
      </div>
    )
  )

  return (
    <div className="content">
      <Window className="window">
        <WindowHeader className='window-header'>
          <span>waver.exe</span>
        </WindowHeader>
        <Toolbar>
          <Button variant='menu' size='sm' onClick={handleLogin} disabled={user === undefined ? false : true}>
            Login with Unstoppable
          </Button>
          <Button variant='menu' size='sm' onClick={handleLogout} disabled={user === undefined}>
            Log out
          </Button>
        </Toolbar>
        <WindowContent>
          {userMarkup}
        </WindowContent>
        <Panel variant='well' className='footer'>
          Powered by <a href="https://unstoppabledomains.com/">https://unstoppabledomains.com/</a>
        </Panel>
      </Window>
    </div>
  );
}