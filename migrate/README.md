# MintChip Migration Scripts

## Overview

Listed below are the scripts used as part of the MintChip migration. All scripts except Lock Zero Balance Accounts aid in the fetching of information for analysis. The Lock Zero Balance Accounts script is destructive and will disable all accounts with zero balance.

## Usage

In order to run any of the scripts the following configuration file must be created: _/etc/.prod.migration.env_. This file has the following format:

```
API_MONGODB_URL=""
CRYPTO_MONGODB_URL=""
MSSQL_USER=""
MSSQL_PASS=""
MSSQL_SERVER=""
MSSQL_PORT=
MSSQL_DB=""
MSSQL_TIMEOUT=
```

where:

* **API_MONGODB_URL**: The MongoDB connection string for the Main API database.
* **CRYPTO_MONGODB_URL**: The MongoDB connection string for the Crypto Service API database.
* **MSSQL_USER**: The user for the SQL Server database
* **MSSQL_PASS**:  The password for the SQL Server database 
* **MSSQL_SERVER**: The IP address for the SQL Server database
* **MSSQL_PORT**: The port for the SQL Server database
* **MSSQL_DB**: The HSM Server database name
* **MSSQL_TIMEOUT**: The maximum allowed connect/request timeout

## Balances

### Overview

This script fetches a list of all secure asset stores and their balances. It exports this data to a CSV called _asset_store_list.csv_

### Dependencies

* **bluebird:\^3.4.1**
* **dotenv:\^6.1.0**
* **json2csv:\^3.5.0**
* **mintchip-tools:\^1.0.3**
* **mongodb:\^3.1.9**
* **mssql:\^3.2.1**

## Email List

### Overview

This script fetches user information formatted for MailChimp. It fetches the user's first name, email, and balance and exports them into 6 separate CSV files:

1. Disabled Non-Zero Balance Asset Stores
2. Disabled Promo Balance Asset Stores
3. Disabled Zero Balance Asset Stores
4. Enabled Non-Zero Balance Asset Stores
5. Enabled Promo Balance Asset Stores
6. Enabled Zero Balance Asset Stores

### Dependencies

* **bluebird:\^3.4.1**
* **dotenv:\^6.1.0**
* **json2csv:\^3.5.0**
* **mintchip-tools:\^1.0.3**
* **mongodb:\^3.1.9**
* **mssql:\^3.2.1**
* **node-forge:\^0.7.6**

## Lock Zero Balance Accounts

### Overview

This script disables every user account linked to a secure asset store with a balance of zero. It blocks the asset store from performing any operations and then subsequently disables the user.

### Dependencies

* **bluebird:\^3.4.1**
* **dotenv:\^6.1.0**
* **mintchip-tools:\^1.0.3**
* **mongodb:\^3.1.9**
* **mssql:\^3.2.1**

## Pending VTMs

### Overview

This script fetches a list of Value Transfer Messages (VTMs) that have been issues but that  have no been received. It exports these VTMs to a CSV file called _pending_vtms.csv_. 

### Dependencies

* **bluebird:\^3.4.1**
* **dotenv:\^6.1.0**
* **json2csv:\^3.5.0**
* **mintchip-tools:\^1.0.3**
* **mongodb:\^3.1.9**
* **mssql:\^3.2.1**