#!/usr/bin/python


import os
import shutil
import time

JOURNAL_HOME = os.environ['JOURNAL_HOME'] + '/'
BACK_UP_PATH = JOURNAL_HOME + '/migration_backup/'

filename = 'services'

if os.path.isfile(JOURNAL_HOME + filename):

    # do the migration
    readFile   = open(JOURNAL_HOME + filename, 'r')
    writeFile  = open(JOURNAL_HOME + filename + '.tmp', 'w')

    lines = readFile.readlines();
    for line in lines:

        if ( line.find('"id":"http"') != -1 or line.find('"name":"http"') != -1 ) and line.find('script-src') != -1:
            if line.find('script-src https://cdn.plaid.com/link/v2/stable/link-initialize.js') == -1:
                index = line.find('script-src') + 10
                line = line[:index] + " https://cdn.plaid.com/link/v2/stable/link-initialize.js" + line[index:]
            if line.find('frame-src https://cdn.plaid.com/link/') == -1:
                index = line.find('frame-src') + 9
                line = line[:index] + " https://cdn.plaid.com/link/" + line[index:]
        writeFile.write(line)

    readFile.close()
    writeFile.close()

    # back up
    if not os.path.exists(BACK_UP_PATH): os.makedirs(BACK_UP_PATH)
    shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))

    # replace the old journal
    shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)
