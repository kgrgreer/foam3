# MintChip Migration

## Description

## Requirements

- Java 8
- MongoDB database access

## Instructions

1. Modify the MODE parameter in Main.java to choose the environment you want to migrate.
2. Ensure that your configuration file is properly set up
3. Run the following command to execute the script: `./run.sh`
4. The script will produce journal files with the migrated information
5. Verify that the data is correct

## Migration Mode

The migration script runs operates in three modes:

1. DEBUG - runs the script on your local MongoDB database
2. STAGING - runs the script on the staging MongoDB database
3. PRODUCTION - runs the script on the production MongoDB database

**NOTE** : While the script is non-destructive, do NOT run against Production environment.

## Configuration files

The script loads the database credentials from configuration files located in `conf/`. 

The filename format is as follows:

```
credentials.${mode}.properties
``` 

**Example**
```
credentials.staging.properties
```


The configuration file should look like

```
mongodb.host=
mongodb.user=
mongodb.pass=
```

where:
- **mongodb.host** : is a list of host separated by a semi-colon 
  - i.e. 127.0.0.1:27017;127.0.0.1:27017;127.0.0.1:27017
- **mongodb.user** : is the user to authenticate with
- **mongodb.pass** : is the users password encoded in Base64