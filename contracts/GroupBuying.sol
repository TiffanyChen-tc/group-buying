// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract GroupBuying {
    address public organizer;
    address public supplier;
    uint public goalAmount;
    uint public deadline;
    uint public totalFunds;
    uint public itemPrice; // 商品價格
    mapping(address => uint) public contributions;
    address[] public participants; // 儲存所有參與者的地址

    constructor(address _supplier, uint _goalAmount, uint _duration, uint _itemPrice) {
        organizer = msg.sender;
        supplier = _supplier;
        goalAmount = _goalAmount * 1 ether;
        itemPrice = _itemPrice * 1 ether; // 商品價格設定為 ether 單位
        deadline = block.timestamp + _duration;
    }

    // 是否在截止時間前
    modifier beforeDeadline() {
        require(block.timestamp < deadline, "Contribution period ended");
        _;
    }

    // 繳款金額是否符合商品價格
    modifier correctAmount() {
        require(msg.value == itemPrice, "Contribution must match the item price");
        _;
    }

    // 參與者進行繳款
    function contribute() public payable beforeDeadline correctAmount {
        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;

        // 第一次參與，參與者地址加入列表
        if (contributions[msg.sender] == msg.value) {
            participants.push(msg.sender);
        }
    }

    // 最終購買，將錢轉移給供應商或退款
    function finalizeGroupPurchase() public {
        require(block.timestamp >= deadline, "Contribution period still active");
        
        if (totalFunds >= goalAmount) {
            payable(supplier).transfer(totalFunds); // 達成目標，資金轉給供應商進行購買
        } else {
            refund(); // 未達成目標，退款給參與者
        }
        totalFunds = 0;
    }

    // 退款
    function refund() private {
        for (uint i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint refundAmount = contributions[participant];
            // 確認合約餘額足夠
            require(address(this).balance >= refundAmount, "Insufficient balance for refund");
            payable(participant).transfer(refundAmount);

            contributions[participant] = 0;
        }

        // 清空參與者列表
        delete participants;
    }

    // 取得目前狀態(組織者、供應商、目標金額、商品價格、距離合約結束時間、合約總金額)
    function getBuyingStatus() public view returns (
        address _organizer, 
        address _supplier, 
        uint _goalAmount, 
        uint _itemPrice, 
        uint _timeRemaining, 
        uint _totalFunds
    ) {
        _organizer = organizer;
        _supplier = supplier;
        _goalAmount = goalAmount;
        _itemPrice = itemPrice;
        _timeRemaining = deadline > block.timestamp ? deadline - block.timestamp : 0; // 剩餘時間
        _totalFunds = totalFunds;
    }

    // 取得所有參與者及其繳款金額
    function getAllContributions() public view returns (address[] memory, uint[] memory) {
        uint length = participants.length;
        uint[] memory contributionsList = new uint[](length);
        
        for (uint i = 0; i < length; i++) {
            contributionsList[i] = contributions[participants[i]];
        }
        
        return (participants, contributionsList);
    }
}