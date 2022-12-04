import React, { useEffect, useState } from "react";
import "./App.css";
import ABI from "./utils/WavePortal.json"

// ethers変数を使えるようにする。
import { ethers } from "ethers";

export default function App() {
  // ウォレットを保存するために使用する状態変数を定義する。
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);

  const contractAddress = "0x1C9ED604b34337666d5F99a98EE72B91c3b825AD";
  const contractABI = ABI.abi;

  // window.ethereumにアクセス出来ることを確認
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      // ウォレットへのアクセス許可を確認
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ウォレット接続用のメソッドを実装
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // waveの回数をカウントする関数
  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        /*
         * Signerは抽象クラス。具象型によってできることが違う。
         * metamaskのsignerはtxを送信してmessageに署名できるが、ブロードキャストしないとtxに署名できない。
         * https://docs.ethers.io/v5/api/signer/
         */
        const signer = provider.getSigner();
        console.log("Get signer: ", signer);
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        // waveのカウントアップ
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Webページがロードされたら下記の関数を実行する。
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{" "}
          WELCOME!!
        </div>

        <div className="bio">
          イーサリアムウォレットを接続して、メッセージを作成したら、
          <span role="img" aria-label="hand-wave">
            👋
          </span>
          (wave)を送ってください
          <span role="img" aria-label="shine">
            ✨
          </span>
        </div>
        {/* waveボタンにwave関数を連動させる */}
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/* ウォレットコネクトボタンを実装 */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>
        )}
      </div>
    </div>
  );
}
