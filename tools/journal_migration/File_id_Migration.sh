#!/usr/bin/python3
#!/bin/bash

import os
import uuid
import shutil
import time

JOURNAL_HOME = "/opt/nanopay/journals/"
BACK_UP_PATH = JOURNAL_HOME + "migration_backup/"

def doMigration(filename):
#  writeFile = open(JOURNAL_HOME + filename + ".tmp", "w")

  id = 0

  with open(JOURNAL_HOME + filename, "r") as readFile:
    with open(JOURNAL_HOME + filename + ".tmp", "w") as writeFile:
      for line in readFile:
        start = line.find('"id"')
        if start != -1:
          end = start + 5
          if line[end] != '"':
            while line[end] != ',':
              end += 1
            if line[start+5:end].isdigit():
              line = line.replace(line[start:end], '"id":"' + str(uuid.uuid1()) + '"')
              print(line)
        writeFile.writelines(line)

  if not os.path.exists(BACK_UP_PATH):
    os.makedirs(BACK_UP_PATH)
  shutil.move(JOURNAL_HOME + filename, BACK_UP_PATH + filename + '_' + str(int(round(time.time()))))
  shutil.move(JOURNAL_HOME + filename + '.tmp' , JOURNAL_HOME + filename)

if os.path.isfile(JOURNAL_HOME + "files"):
  doMigration("files")
  print("Long id changed to GUID")
else:
  print("can't find files")

