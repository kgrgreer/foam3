#!/bin/bash

rm *.log

# echo "FOAM 2021"
# pushd . ; cd ../../../../.. ;    git log --since="2021-01-01" --until="2022-01-01" --no-merges -p > src/foam/demos/gitlog/data/data2021.log ; popd
# echo "NP 2021"
# pushd . ; cd ../../../../../.. ; git log --since="2021-01-01" --until="2022-01-01" --no-merges -p > foam3/src/foam/demos/gitlog/data/np2021.log ; popd
# echo "FOAM 2022"
# pushd . ; cd ../../../../.. ;    git log --since="2022-01-01" --until="2023-01-01" --no-merges -p > src/foam/demos/gitlog/data/data2022.log ; popd
# echo "NP 2022"
# pushd . ; cd ../../../../../.. ; git log --since="2022-01-01" --until="2023-01-01" --no-merges -p > foam3/src/foam/demos/gitlog/data/np2022.log ; popd
echo "FOAM 2023"
pushd . ; cd ../../../../.. ;    git log --since="2023-01-01" --until="2024-01-01" --no-merges -p > src/foam/demos/gitlog/data/data2023.log ; popd
echo "NP 2023"
pushd . ; cd ../../../../../.. ; git log --since="2023-01-01" --until="2024-01-01" --no-merges -p > foam3/src/foam/demos/gitlog/data/np2023.log ; popd
