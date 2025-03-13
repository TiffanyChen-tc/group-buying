async function main() {
    const GroupBuying = await ethers.getContractFactory("GroupBuying");

    // Start deployment, returning a promise that resolves to a contract object
    const GroupBuying_ = await GroupBuying.deploy(
        "0x364a7c1dCc7Ca88E7B4852507aF3f0A6747d1B81", // _supplier
        3, // _goalAmount
        300, // _duration
        1 // _itemPrice
    );
    console.log("Contract address: ", GroupBuying_.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });