import React, { useState } from 'react';

const Connected = (props) => {
    const [amount, setAmount] = useState("");

    const handleInputChange = (e) => {
        setAmount(e.target.value);
    };

    // 將秒數轉換為時:分:秒格式
    const formatTimeRemaining = (seconds) => {
        if (seconds <= 0) return "已結束";
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="connected-container">
            <h1 className="connected-header">You are connected to Metamask.</h1>
            <p className="connected-account"><strong>Metamask Account:</strong> {props.account}</p>

            {/* 使用表格顯示資訊 */}
            <table className="info-table">
                <tbody>
                    <tr>
                        <td>團購發起者 Organizer</td>
                        <td>{props.organizer}</td>
                    </tr>
                    <tr>
                        <td>供應商 Supplier</td>
                        <td>{props.supplier}</td>
                    </tr>
                    <tr>
                        <td>團購目標金額 Goal Amount</td>
                        <td>{props.goalAmount} VT</td>
                    </tr>
                    <tr>
                        <td>商品金額 Item Price</td>
                        <td>{props.itemPrice} VT</td>
                    </tr>
                    <tr>
                        <td>團購剩餘時間 Time Remaining</td>
                        <td>{formatTimeRemaining(props.timeRemaining)}</td>
                    </tr>
                    <tr>
                        <td>團購目前累積金額 Total Funds</td>
                        <td>{props.totalFunds} VT</td>
                    </tr>
                </tbody>
            </table>

            <div className="action-box">
                <input 
                    type="number" 
                    placeholder="Enter the fund" 
                    value={amount} 
                    onChange={handleInputChange} 
                    className="input-field"
                />
                <button className="buy-button" onClick={() => props.buy(amount)}>Buy</button>
            </div>

            {props.account.toLowerCase() === props.organizer.toLowerCase() && (
                <button className="finalize-button" onClick={props.finalizePurchase}>
                    Finalize Purchase
                </button>
            )}
        </div>
    );
}

export default Connected;