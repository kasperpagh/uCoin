

let marcoCoins = new Blockchain();
console.log("mining 1")
marcoCoins.addBlock(new Block(1,"06/12/2017",{coins: 10}))
console.log("mining 2")
marcoCoins.addBlock(new Block(2,"07/12/2017",{coins: 40}))
console.log("mining 3")
marcoCoins.addBlock2(new Block(3,"08/12/2017",{coins: 60}))
console.log("mining 3")
marcoCoins.addBlock2(new Block(3,"08/12/2017",{coins: 60}))
console.log("mining 3")
marcoCoins.addBlock2(new Block(3,"08/12/2017",{coins: 60}))
console.log("mining 3")
marcoCoins.addBlock2(new Block(3,"08/12/2017",{coins: 60}))
console.log("mining 1")
marcoCoins.addBlock(new Block(1,"06/12/2017",{coins: 10}))
console.log("mining 2")
marcoCoins.addBlock(new Block(2,"07/12/2017",{coins: 40}))
console.log("mining 1")
marcoCoins.addBlock(new Block(1,"06/12/2017",{coins: 10}))
console.log("mining 2")
marcoCoins.addBlock(new Block(2,"07/12/2017",{coins: 40}))

console.log(JSON.stringify(marcoCoins,null,4));
console.log("valid: %s",marcoCoins.isChainValid());
marcoCoins.chain[1].data = {coins: 50};

console.log("valid: %s",marcoCoins.isChainValid());