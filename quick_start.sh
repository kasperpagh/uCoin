#!/bin/bash

docker build .

docker-compose up -d --build

echo ---------------------------------------------------------
echo #########################################################
echo ---------------------------------------------------------
echo Sending two blocks to NODE1, and mining two ways.
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}'  -X POST http://localhost:3001/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}'  -X POST http://localhost:3001/mineBlock/2
echo ---------------------------------------------------------
echo Get blocks from NODE1:
curl http://localhost:3001/blocks
sleep 2s
echo ---------------------------------------------------------
echo #########################################################
echo ---------------------------------------------------------
echo Sending two blocks to NODE2, and mining two ways.
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3002/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3002/mineBlock/2
echo ---------------------------------------------------------
echo Get blocks from NODE2:
curl http://localhost:3002/blocks
sleep 2s
echo ---------------------------------------------------------
echo #########################################################
echo ---------------------------------------------------------
echo Sending two blocks to NODE3, and mining two ways.
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3003/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3003/mineBlock/2
echo ---------------------------------------------------------
echo Get blocks from NODE3:
curl http://localhost:3003/blocks
sleep 2s
echo ---------------------------------------------------------
echo #########################################################
echo ---------------------------------------------------------
echo Sending two blocks to NODE4, and mining two ways.
curl -H "Content-type:application/json" -d '{"data" : "first block (sequential)"}' -X POST http://localhost:3004/mineBlock/1
curl -H "Content-type:application/json" -d '{"data" : "second block (random)"}' -X POST http://localhost:3004/mineBlock/2
echo ---------------------------------------------------------
echo Get blocks from NODE4:
curl http://localhost:3004/blocks
sleep 2s
echo ---------------------------------------------------------
echo "########################## fra NODE 1###############################"
echo ---------------------------------------------------------
curl http://localhost:3001/blocks | json_pp
echo ---------------------------------------------------------
echo "#########################FRA NODE 2################################"
echo ---------------------------------------------------------
curl http://localhost:3002/blocks | json_pp
echo ---------------------------------------------------------
echo "############################FRA NODE 3############################"
echo ---------------------------------------------------------
curl http://localhost:3003/blocks | json_pp
echo ---------------------------------------------------------
echo "################################FRA NODE 4#########################"
echo ---------------------------------------------------------
curl http://localhost:3004/blocks | json_pp
echo ---------------------------------------------------------
echo "#########################################################"
echo ---------------------------------------------------------

