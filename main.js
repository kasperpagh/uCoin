const SHA256 = require('crypto-js/sha256')
const websocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
let beer_port = process.env.beer_PORT || 6001;
let initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : ['ws://localhost:6002'];
//'ws://localhost:6001'
let http_port = process.env.HTTP_PORT || 3001;
let sockets = [];
let MessageType = {
    LATEST: 0,
    ALL: 1,
    BLOCKCHAIN: 2
};
class Block {
    constructor(index, timestamp, data, previousHash = '', nonce) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data
        this.previousHash = previousHash;
        this.hash = this.calculateHash()
        this.nonce = nonce || 0;
        this.timeUsed = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce).toString();
    }
    mineBlock() {
        let timestart = new Date();
        while (!this.hash.startsWith("fac")) {
            this.nonce++;

            this.hash = this.calculateHash();

        }
        this.timeUsed = new Date() - timestart;
        console.log("Block mined #1: " + this.hash + " : time used: " + this.timeUsed + "ms : index: " + this.index);
    }
    mineBlock2() {
        let timestart = new Date();
        while (!this.hash.startsWith("fac")) {
            this.nonce = Math.random();
            this.hash = this.calculateHash();

        }
        this.timeUsed = new Date() - timestart;
        console.log("Block mined #2: " + this.hash + " : time used: " + this.timeUsed + "ms");
    }
}

class Blockchain {
    constructor() {
        let firstBlock = new Block(0, "05/12/2017", "first block");
        firstBlock.mineBlock();
        this.chain = [firstBlock];
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock();
        if (this.isBlockValid(newBlock)) {
            this.chain.push(newBlock);
            console.log('block added: ' + JSON.stringify(uCoins.getLatestBlock()));
        }

    }
    addBlock2(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock2();
        if (this.isBlockValid(newBlock)) {
            this.chain.push(newBlock);
            console.log('block added: ' + JSON.stringify(uCoins.getLatestBlock()));
        }
    }
    replaceChain(newChain) {
        newChain = generateBlockChain(newChain);
        console.log("er chain valid? " + newChain.isChainValid());
        console.log("her er input: " + newChain.chain.length + " og den anden " + this.chain.length);
        if (newChain.isChainValid() && newChain.chain.length > this.chain.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.chain = newChain.chain;
            broadcast(responseLatestMsg());
        } else {
            console.log('Received blockchain invalid');
        }
    }
    isBlockValid(newBlock) {
        let previousBlock = this.chain[this.chain.length - 1];
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        }
        else if (newBlock.hash !== newBlock.calculateHash()) {
            console.log("invalid hash")
            return false
        }
        else if (newBlock.previousHash !== previousBlock.hash) {
            console.log("invalid previous hash")
            return false
        }
        return true;
    };
    isChainValid() {
        for (let index = 1; index < this.chain.length; index++) {
            
            const currentBlock = this.chain[index];
            const previousBlock = this.chain[index - 1];


            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log("1")
                return false
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log("2")
                return false
            }


        }
        return true
    }
}
let generateBlockChain = function (newChain) {
    let tempChain = new Blockchain();
    for (i = 1; i < newChain.length; i++) {
        let cb = newChain[i];
        tempChain.addBlock(new Block(cb.index, cb.timestamp, cb.data, cb.previousHash, cb.nonce));
    }
    return tempChain;
}


let uCoins = new Blockchain();

let initHttpServer = function () {
    let app = express();
    app.use(bodyParser.json());

    app.get('/blocks', function (req, res) {
        res.send(JSON.stringify(uCoins.chain))
    });
    app.post('/mineBlock/:type', function (req, res) {
        let index = uCoins.getLatestBlock().index + 1;
        console.log(index)
        if (req.params.type == 1) {
            uCoins.addBlock(new Block(index, new Date() / 1000, req.body.data))
        }
        else {
            uCoins.addBlock2(new Block(index, new Date() / 1000, req.body.data))
        }
        broadcast(responseLatestMsg());

        res.send();
    });
    app.get('/peers', function (req, res) {
        console.log(sockets);
        console.log(Object.keys(sockets));
        res.send(JSON.stringify(sockets.length));
        //res.send(sockets.map(function (s) {
          //  s
        //}));

    });
    app.post('/addPeer', function (req, res) {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, function () {
        console.log('Listening http on port: ' + http_port)
    });
};

let P2PServer = function () {
    let server = new websocket.Server({ port: beer_port })
    server.on('connection', function (conn) {
        initConnection(conn);
    });
    console.log("peer to peer connection on: " + beer_port)
}

let initConnection = function (conn) {
    sockets.push(conn);
    initMessageHandler(conn);
    initErrorHandler(conn);
    write(conn, queryChainLengthMsg());
};

let initMessageHandler = function (conn) {
    conn.on('message', function (data) {
        let message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.LATEST:
                write(conn, responseLatestMsg());
                break;
            case MessageType.ALL:
                write(conn, responseChainMsg());
                break;
            case MessageType.BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

let initErrorHandler = function (conn) {
    let closeConnection = function (conn) {
        console.log('connection failed to peer: ' + conn.url);
        sockets.splice(sockets.indexOf(conn), 1);
    };
    conn.on('close', function () {
        return closeConnection(conn);
    });
    conn.on('error', function () {
        return closeConnection(conn);
    });
};

let connectToPeers = function (newPeers) {
    newPeers.forEach(function (peer) {
        let ws = new websocket(peer);
        ws.on('open', function () {
            initConnection(ws)
        });
        ws.on('error', function () {
            console.log('connection failed')
        });
    });
};
let handleBlockchainResponse = function (message) {
    let receivedBlocks = JSON.parse(message.data).sort(function (b1, b2) {
        return (b1.index - b2.index);
    });

    let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    let latestBlockHeld = uCoins.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            uCoins.chain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            uCoins.replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

/*
let generateNextBlock = (blockData) => {
    let previousBlock = uCoins.getLatestBlock();
    let nextIndex = previousBlock.index + 1;
    let nextTimestamp = new Date().getTime() / 1000;
    return new Block(nextIndex,nextTimestamp, blockData, previousBlock.hash);
};
*/



let queryChainLengthMsg = function () {
    return { 'type': MessageType.LATEST };
}
let queryAllMsg = function () {
    return { 'type': MessageType.ALL };
}
let responseChainMsg = function () {
    return { 'type': MessageType.BLOCKCHAIN, 'data': JSON.stringify(uCoins.chain) };
}
let responseLatestMsg = function () {
    return {
        'type': MessageType.BLOCKCHAIN,
        'data': JSON.stringify([uCoins.getLatestBlock()])
    }
};
let write = function (ws, message) {
    ws.send(JSON.stringify(message));
}
let broadcast = function (message) {
    sockets.forEach(function (socket) {
        write(socket, message);
    });
}

connectToPeers(initialPeers);
initHttpServer();
P2PServer();
