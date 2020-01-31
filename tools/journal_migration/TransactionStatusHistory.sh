#!/usr/bin/python

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
    for line in lines:

        if ( '\"created\":' in line ):
            status = re.search(r'\"status\":\d+', line)
            statusId = re.search(r'\d+', status.group())
            createdDate = re.search(r'\"created\":\"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z\"', line)
            date = re.search(r'\"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z\"', createdDate.group())
            statusHistory = '\"statusHistory\":[{\"class\":\"net.nanopay.tx.HistoricStatus\",\"timeStamp\":' + date.group() +',\"status\":' + statusId.group() + '}]'
            line = re.sub('\"created\":\"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z\"', statusHistory, line)
        writeFile.writelines(line);

    readFile.close();
    writeFile.close();

    #make backup
    if not os.path.exists(BACK_UP_PATH): os.makedirs(BACK_UP_PATH)
    shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))
    shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)

if os.path.isfile(JOURNAL_HOME + "transactions"):
    doMigration('transactions')
