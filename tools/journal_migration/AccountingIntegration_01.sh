#!/usr/bin/python

import shutil
import os
import re
import time

JOURNAL_HOME = os.environ['JOURNAL_HOME'] + '/'
BACK_UP_PATH = JOURNAL_HOME + '/migration_backup/'

def findString(regex, str):
    search = re.search(regex, str);
    if search is not None:
        return search.group(0);
    else:
        return "";

def doMigration(filename):
    readFile = open(JOURNAL_HOME + filename, "r");
    writeFile = open(JOURNAL_HOME + filename + '.tmp', "w")

    lines = readFile.readlines();
    for line in lines:
        objectId = re.search(r'\"objectId\":\d*', line)
        if ( 'net.nanopay.integration' in line or 'quick.model.QuickContact' in line or 'quick.model.QuickInvoice' in line ):
            line = line.replace('net.nanopay.integration', 'net.nanopay.accounting')
            line = line.replace('quick.model.QuickContact', 'quickbooks.model.QuickbooksContact')
            line = line.replace('quick.model.QuickInvoice', 'quickbooks.model.QuickbooksInvoice')
            line = re.sub(r',{\"algorithm\":(.*)}', '', line)
        writeFile.writelines(line);

    readFile.close();
    writeFile.close();

    #make backup
    if not os.path.exists(BACK_UP_PATH): os.makedirs(BACK_UP_PATH)
    shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))
    shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)

if os.path.isfile(JOURNAL_HOME + "users"):
    doMigration('users')
if os.path.isfile(JOURNAL_HOME + "invoices"):
    doMigration('invoices')
