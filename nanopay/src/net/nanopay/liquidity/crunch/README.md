# Liquified Crunch

# Models

### LiquidCapability.js

#### LiquidCapability
- extends Capability 
- hides the unneeded fields of Capability 
- sets the 'of' property to hidden and factory to return `AccountTemplate`

#### LiquidCapability
- extends LiquidCapability
- includes boolean properties for view/make/approve on all of the global objects, which are
    - Rule
    - User
    - Liquidity Settings
    - Capability ( Role )
    - CapabilityRequest ( Role Assignment )
    - File Ingestion ( view / make only )
- overrides javaGetter for permissionsGranted based on the boolean properties that were set to true, to grant view permission for certain menus
- overrides the implies method such that it 
    Takes a permission string generated from the LiquidAuthorizer in the form of "className.operation", and returns true if the corresponding boolean in this capabiltiy object is set to true

#### LiquidCapability
- extends LiquidCapability
- includes boolean properties for view/make/approve on all of the account-based objects, which are
    - Account
    - Transaction
    - Dashboard ( view only )
- overrides javaGetter for permissionsGranted based on the boolean properties that were set to true, to grant view permission for certain menus
- overrides the implies method such that it :
    Takes a permission string in the form of "className.operation.outgoingAccountId", and 
    checks if the boolean property corresponding to the className and operation is set to true.
    If so, find the ucj and check if the outgoingAccountId is in the accountTemplate map or a child of
    an account in the accountTemplate map stored in the ucj.

#### Note on UserCapabilityJunctions (UCJ) from User to These Two Types of LiquidCapabilities
- When a user is assigned some Capability, i.e., an ucj is created, there is usually some type of data stored in the ucj, which can be a piece of document, a signature, or any piece of info required to grant a user the capability in question. 
- In the case of LiquidCapabilities, the 'data' represents more 'specific' information for level of access that a user is granted.
- In an ucj object where the Capability is instanceof LiquidCapability, the data is a map, where the keys are all the accounts for which the user is granted this capability, and the values include the approverlevel granted to the user for each specific account, if this capability were to grant the user the ability to 'approve' some object
- In an ucj object where the Capability is instanceof LiquidCapability, the data is simply an 'ApproverLevel' object, which represents the approverLevel granted to the user for that capability, if that capability were to grant the user the ability to 'approve' some object

### AccountTemplate.js

- represents a template of accounts on which a Business Rule may be applied
- includes a property called `accounts` of type `Map<String, AccountData>` where the keys represent account IDs and values are the corresponding `AccountData` object
- has a templateName property, but its id is a long value supplied by sequenceNumberDAO
- implement `Validatable` to ensure accounts provided in map are valid on put

### CapabilityAccountTemplate.js

- extends AccountTemplate
- represents a template of accounts for which an Account-Based Capability can be granted to a user
- includes a properties called `accounts` of type `Map<String, CapabilityAccountData>` where the keys represent account Ids and values are the corresponding `CapabilityAccountData` object

### AccountData.js

#### AccountData
- model to be stored as the value in the `accounts` map of AccountTemplate. Includes 2 properties needed:
  1. `isCascading : Boolean` : Describes whether or not this AccountData object should be extended to the children of the account from which this is mapped
  2. `isIncluded : Boolean` : Describes whether the account from which this was mapped should be included in the account tree that results from expanding this template.
    - this property is useful for when we want an account template which represents a tree of accounts, except for some parts of subtrees

#### CapabilityAccountData
- model to be stored as the value in the `accounts` map of CapabilityAccountTemplate, extends AccountData
- defines an `approverLevel` property which represents the approver level to give the user for the accounts/transactions where the user is assigned an 'approver' role

### Note on AccountTemplates vs. AccountMap and CapabilityAccountTemplate vs. AccountApproverMap

- The properties of an AccountTemplate are essentially the same as that of an AccountMap, and the same goes for CapabilityAccountTemplate and AccountApproverMap.
- This should probably be fixed in the future, but right now they are here and although they are essentially the same thing, they are being used differently.
- Ex. CapabilityAccountTemplates defined and stored into a DAO, and can be selected when assigning an account-based capability to a user. 
    - An AccountApproverMap is then generated from the data of the CapabilityAccountTemplate and displayed to the user in an editable view. 
    - The user can then make changes as they wish to the AccountApproverMap based on the CapabilityAccountTemplate they selected.
    - Or, if the user does not want to follow a pre-defined template, they may create their own AccountApproverMap in the view for assigning an Account-Based Capability
- The same goes for AccountTemplate vs. AccountMap, in the use case of creating Business Rules

### AccountMap.js

- represents a template of accounts on which a Business Rule may be applied
- includes a property called `accounts` of type `Map<String, AccountData>` where the keys represent account IDs and values are the corresponding `AccountData` object
- includes methods :
    - `addAccount(accountID, AccountData data)` - Adds a single account to the `accounts` map
    - `impliesChildAccount(X x, Long childId)` - checks if an account is
        - in the `accounts` map, OR
        - is implied by another account in the map, i.e., its closest ancestor account in the map has a corresponding `AccountData` with `cascading` and `included` set to true.
    - `removeAccount(Long accountId)` - removes an account from the map, if the map contains it, otherwise, throw an error
    - `hasAccount(X x, Long accountId)` - checks if an account is in the `account` map explicitly
        - todo ruby, this does not need x as an arg

### AccountApproverMap.js

- represents one of two things:
    1. a template of accounts for which a user is assigned an account-based capability
    2. the actual map of `<AccountId, CapabilityAccountData>` which is added to the data of a UserCapabilityJunction
- includes a property called `accounts` of type `Map<String, CapabilityAccountData>` where the keys represent account IDs and values are the corresponding `CapabilityAccountData` object
- includes all the methods of AccountMap with the same logic (but does not extend AccountMap)
- has a method `hasAccountByApproverLevel(X x, Long accountId, Integer level)`, which is used to query users accounts in the map for which its CapabilityAccountData has approverlevel set to `level`

### ApproverLevel.js

- an FObject to put into the `data` of UserCapabilityJunction where the Capability is instanceof LiquidCapability, this has an `approverLevel` property, which is an Integer with a range [1, 2].
- implements `Validatable` to ensure the `approverLevel` property is within range
- Needed to be modelled since `data` field of ucj is an `FObjectProperty`

### RootAccount.js

- represents the list of roots of all the disjoint account trees/subtrees that a user has permission to view
- contains two properties:
    1. `userId`, which also represents the id of this object
    2. `rootAccounts`, a list containing the string value of account ids
            - this list is calculated in the `AccountHierarchyService`
- this is stored in rootAccountsDAO so the rootAccount doesn't have to be re-calculate when the server restarts

### CapabilityRequest.js


### CapabilityRequestOperations.js
- an enum class representing the different operations that can be done in a CapabilityRequest:
    - `ASSIGN_ACCOUNT_BASED`
    - `ASSIGN_GLOBAL`
    - `REVOKE_ACCOUNT_BASED`
    - `REVOKE_GLOBAL`


# Authorizers and Services (TODO )

### LiquidAuthorizer.js
- a liquid specifc implementation of the Authorizer interface such that it generates liquid permission strings in the form of `LiquidCapabilityCheckboxName` or `LiquidCapabilityCheckboxName.outgoingAccountId`, and passes the permission to `auth.check()`

### LiquidTransactionAuthorizer.js

- extends `LiquidAuthorizer`
- overrides `authorizeOnRead` so that it checks if either `super.authorizeOnRead` passes or the user is a transaction viewer of the destinationAccount

### LiquidApprovalRequestAuthorizer.js

- extends `LiquidAuthorizer`
- overrides `createPermission` logic so that it return the permission string in the form of "canApprove{classname}" or "canApprove{classname}.outgoingAccountId"

### LiquidCapabilityAuthService ( soon to be foam/nanos/crunch/CapabilityAuthService.js )

### AccountHierarchyService.java


# Rules

Hopefully the titles are self-explanatory

### CreateUserCapabilityJunctionOnRequestApproval.js

### AddAccountToUserCapabilityJunctionOnCreate.js

### RemoveAccountFromUcjDataOnAccountRemoval.js

### RemoveAccountBasedUCJIfAccountsEmpty.js

### RemoveJunctionsOnCapabilityRemoval.js

### RemoveJunctionsOnUserRemoval.js ( foam side ) 
