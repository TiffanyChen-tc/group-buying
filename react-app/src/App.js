import { useState, useEffect } from 'react';
import { ethers, Signer } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Connected from './Components/Connected';
import './App.css';
import { AlertSuccess, AlertError} from './MyAlert';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [buyingStatus, setBuyingStatus] = useState({
    organizer: "",
    supplier: "",
    goalAmount: 0,
    itemPrice: 0,
    timeRemaining: 0,
    totalFunds: 0
  });

  // Whenever app starts, it continuously runs.
  useEffect( () => {
    getCurrentStatus();
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return() => {
      if(window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    }
  })

  async function getCurrentStatus() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const status = await contractInstance.getBuyingStatus(); //smart contract function
      setBuyingStatus({
        organizer: status[0],
        supplier: status[1],
        goalAmount: ethers.utils.formatEther(status[2]),
        itemPrice: ethers.utils.formatEther(status[3]),
        timeRemaining: status[4].toNumber(),
        totalFunds: ethers.utils.formatEther(status[5])
      });
      // console.log("Current BuyingStatus: ", buyingStatus);
    } catch (error) {
      console.error("獲取合約狀態失敗:", error);
    }
    
  }


  function handleAccountsChanged(accounts) {
    // accounts[0] is the current account connected.
    if (accounts.length > 0 && account !== accounts[0]){
      setAccount(accounts[0]);
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected: ", address);
        setIsConnected(true);
      } catch(err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  /**
  * 參與者購買
  */
  async function buy(amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
        AlertError("請輸入有效的金額！");
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
            contractAddress, contractAbi, signer
        );
        if (buyingStatus.timeRemaining > 0) {
          const tx = await contractInstance.contribute({ 
              value: ethers.utils.parseEther(amount)
          });

          await tx.wait(); // 等待交易完成
          console.log("購買成功:", tx);
          AlertSuccess("購買成功！");
        } else {
            console.log("購買失敗，時間已截止。");
            AlertError("購買失敗，時間已截止。");
        }

        // 交易成功後，更新合約的最新數據
        getCurrentStatus();
    } catch (error) {
        console.error("交易失敗:", error);
        AlertError("交易失敗，請確認付款金額是否與商品金額一致。");
    }
  }

  /**
   * 團購發起人結算，進行購買
   */
  async function finalizePurchase() {
    try {
        getAllContributions();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
            contractAddress, contractAbi, signer
        );

        if(buyingStatus.timeRemaining <= 0) {
          const tx = await contractInstance.finalizeGroupPurchase();
          await tx.wait(); // 等待交易完成
          
          if (buyingStatus.totalFunds < buyingStatus.goalAmount){
            console.log("交易失敗，金額尚未達標。", buyingStatus.totalFunds, buyingStatus.goalAmount);
            AlertError("交易失敗，金額尚未達標，將進行退款。");
          }
          else {
            console.log("交易成功！");
            AlertSuccess("交易成功！");
          }
          // 交易成功後，更新合約的最新數據
          getCurrentStatus();
        }
        else {
          console.log("交易失敗，時間尚未截止。");
          AlertError("交易失敗，時間尚未截止。");
        }
    } catch (error) {
        console.error("交易失敗: ", error);
        AlertError("交易失敗");
    }
  }

  /**
   * 印出所有付過款的參與者、其付款總金額
   */
  async function getAllContributions() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress, contractAbi, signer
    );
  
    try {
      const [participants, contributions] = await contractInstance.getAllContributions();
      const contributionDetails = participants.map((address, index) => ({
        address,
        amount: ethers.utils.formatEther(contributions[index])
      }));
  
      console.log("所有參與者的繳款金額:", contributionDetails);

    } catch (error) {
      console.error("錯誤: 無法取得繳款金額", error);
    }
  }

  return (
    <div className="App">
      {isConnected ? (<Connected 
                      account = {account}
                      organizer = {buyingStatus.organizer}
                      supplier = {buyingStatus.supplier}
                      goalAmount = {buyingStatus.goalAmount}
                      itemPrice = {buyingStatus.itemPrice}
                      timeRemaining = {buyingStatus.timeRemaining}
                      totalFunds = {buyingStatus.totalFunds}
                      buy = {buy}
                      finalizePurchase = {finalizePurchase}
                      />) : (<Login connectWallet = {connectToMetamask}/>)}
    </div>
  );
}

export default App;
