#!/usr/bin/python

import shutil
import os
import re
import time

JOURNAL_HOME = os.environ['JOURNAL_HOME'] + '/'
BACK_UP_PATH = JOURNAL_HOME + '/migration_backup/'

def doMigration(filename):
    readFile = open(JOURNAL_HOME + filename, "r");
    writeFile = open(JOURNAL_HOME + filename + '.tmp', "w");

    lines = readFile.readlines();
    for line in lines:
        if ( 'class:"net.nanopay.account.DigitalAccount"' in line ):
          line = line.replace('class:"net.nanopay.account.DigitalAccount"', 'class:"net.nanopay.account.DigitalAccount",trustAccount:"9"');
        writeFile.writelines(line);

    readFile.close();
    writeFile.close();

    #make backup
    if not os.path.exists(BACK_UP_PATH): os.makedirs(BACK_UP_PATH)
    shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))
    shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)

if os.path.isfile(JOURNAL_HOME + "accounts"):
    doMigration('accounts')
