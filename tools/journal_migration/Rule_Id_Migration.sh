#!/usr/bin/python
#!/bin/bash

import shutil
import os
import re
import time

JOURNAL_HOME = os.environ['JOURNAL_HOME'] + '/'
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
            line = line.replace('\"id\"', '\"id\":' + str(id) + ',\"name\"')
        writeFile.writelines(line);

    readFile.close();
    writeFile.close();
    
    #make backup
    if not os.path.exists(BACK_UP_PATH): os.makedirs(BACK_UP_PATH)
    shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))
    shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)

if os.path.isfile(JOURNAL_HOME + "rules.0"):
    doMigration('rules.0')
