#!/bin/bash



docker build .

docker-compose up -d --build

echo "################ initialize the 4 nodes #################"
echo
echo "### the nodes are connected 1->2->3 the 4'th is not connected ###"
echo
echo "---------------------------------------------------------"
echo "#########################################################"
echo "---------------------------------------------------------"
echo
echo Sending two blocks to NODE1, and mining two ways.
echo
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}'  -X POST http://localhost:3001/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}'  -X POST http://localhost:3001/mineBlock/2
echo "--------------------------------------------------------"
echo check the block from NODE1:
echo
curl http://localhost:3001/blocks
sleep 2s
echo
echo "---------------------------------------------------------"
echo "#########################################################"
echo "---------------------------------------------------------"
echo
echo Sending two blocks to NODE2, and mining two ways.
echo
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3002/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3002/mineBlock/2
echo
echo "---------------------------------------------------------"
echo
echo "check the blocks from NODE2, should be at index 4 if it received the blocks from NODE1:"
curl http://localhost:3002/blocks

sleep 2s
echo
echo "---------------------------------------------------------"
echo
echo "#########################################################"
echo
echo "---------------------------------------------------------"
echo
echo Sending two blocks to NODE3, and mining two ways.
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3003/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3003/mineBlock/2
echo
echo ---------------------------------------------------------
echo
echo "check the blocks from NODE3, should be at index 6 if it received the blocks from NODE1:"
echo
curl http://localhost:3003/blocks

sleep 2s
echo
echo "---------------------------------------------------------"
echo
echo "#########################################################"
echo
echo "---------------------------------------------------------"
echo
echo Sending two blocks to NODE4, and mining two ways.
echo
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3004/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3004/mineBlock/2
echo
echo "---------------------------------------------------------"
echo
echo "check the blocks from NODE4, should be at index 8 if it received the blocks from NODE1:"
echo
curl http://localhost:3004/blocks
echo
echo "as you can see, it is only at block index 2, this is because it is not connected"
echo
echo "so we add the NODE4 as a peer to NODE3"
echo
curl -H "Content-type:application/json" -d '{"peer" : "ws://node4:6001"}' -X POST http://localhost:3003/addPeer
echo
echo "lets check if the connection has been established, it should return the number of peers connected"
echo
echo
curl http://localhost:3004/peers
echo
echo
sleep 2s
echo
echo "lets try and mine again and see if it continues from where it was or goes from where the other nodes ended."
echo
echo Sending two blocks to NODE4, and mining two ways.
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3004/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3004/mineBlock/2
echo
echo "---------------------------------------------------------"
echo
echo "check the blocks from NODE4, should be at index 8 if it received the blocks from NODE1:"
echo
curl http://localhost:3004/blocks
echo
echo "as you can see the blockchain is now at index 8 since the NODE4 is connected to the chain and has received the blocks"



