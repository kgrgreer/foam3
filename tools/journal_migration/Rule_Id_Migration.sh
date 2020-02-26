#!/usr/bin/python
#!/bin/bash

import shutil
import os
import re
import time

#JOURNAL_HOME = os.environ['JOURNAL_HOME'] + '/'
JOURNAL_HOME = '/opt/nanopay/journal/'
BACK_UP_PATH = JOURNAL_HOME + '/migration_backup/'

def doMigration(filename):
    readFile = open(JOURNAL_HOME + filename, "r");
    writeFile = open(JOURNAL_HOME + filename + '.tmp', "w")

    lines = readFile.readlines();
    id = 0;
    for line in lines:
        name = re.search(r'\"id\":\d*', line)
        if ( '\"id\":' in line ):
            id = id + 1
            line = line.replace('\"id\"', '\"id\":\"68afcf0c-c718-98f8-0841-75e97a3ad16d' + str(id) + '\",\"name\"')
        writeFile.writelines(line);

    readFile.close();
    writeFile.close();
    
    #make backup
    if not os.path.exists(BACK_UP_PATH): os.makedirs(BACK_UP_PATH)
    shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))
    shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)

if os.path.isfile(JOURNAL_HOME + "rules"):
    print("processing rules")
    doMigration('rules')
else:
    print("can't find rules")
