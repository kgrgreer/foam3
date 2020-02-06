# Liquified Crunch

## LiquidCapability.js

### LiquidCapability
- extends Capability 
- hides the unneeded fields of Capability 
- sets the 'of' property to hidden and factory to return `AccountTemplate`

### GlobalLiquidCapability
- extends LiquidCapability
- includes boolean properties on all of the global roles 
- overrides the implies method such that it 
    Takes a permission string generated from the LiquidAuthorizer in the form of any of the boolean property names above.
    Returns true if that boolean is true.

### AccountBasedLiquidCapability
- extends LiquidCapability
- include boolean properties on all the account-based roles
- overrides the implies method such that it :
    Takes a permission string in the form of "booleanPropertyName.outgoingAccountId", and 
    checks if the boolean property is checked.
    If so, find the ucj and check if the outgoingAccountId is in the accountTemplate map or a child of
    an account in the accountTemplate map stored in the ucj.

## AccountTemplate.js

### AccountTemplate
- implement `Validatable`
- the data stored in the liquid specific UserCapabilityJunction
- includes a property called `accounts` of type `Map<Long, AccountData>` where the keys represent account IDs and values are the corresponding `AccountData` object
- methods include: 
  - `hasAccount(x, childAccountId)` : Check if a given account is in the map or implied by an account in the map through cascading. (TODO ruby: the accounts will also be stored in the map as they are traversed, maybe)
  - `mergeMaps(map)` : Update the map stored on this model so that to include entries in the new map.
  - `removeAccount(accountId)` : If account is in the map, remove the account from the map. If account is implied by an account in the map (through cascading), add the immediate parent of account explicitly to the map with cascading set to false and inherited set to true. 
      
## AccountData.js

### AccountData
- model to be stored as the value in the `accounts` map of AccountTemplate. Includes 3 properties needed:
  1. `isCascading : Boolean` : Describes whether or not this account is cascading
  2. `approverLevel : Int` : Describes the approver of level a User has wrt this Account ( Only used for Transaction Approvals )
  3. `inherited : Boolean` : Describes whether this account was added explicitly to the map or as a result of cascading / only cascading for a segment of the tree

## LiquidAuthorizer.js

### LiquidAuthorizer
- a liquid specifc implementation of the Authorizer interface such that it generates liquid permission strings in the form of `LiquidCapabilityCheckboxName` or `LiquidCapabilityCheckboxName.outgoingAccountId`, and passes the permission to `auth.check()`

## LiquidTransactionAuthorizer.js

### LiquidTransactionAuthorizer
- extends `LiquidAuthorizer`
- overrides `authorizeOnRead` so that it checks if either `super.authorizeOnRead` passes or the user is a transaction viewer of the destinationAccount

## LiquidApprovalRequestAuthorizer.js

### LiquidApprovalRequestAuthorizer (TODO ruby)
- extends `LiquidAuthorizer`
- overrides `createPermission` logic so that it return the permission string in the form of "canApprove{classname}" or "canApprove{classname}.outgoingAccountId"

## CapabilityAssignment.js (TODO ruby)
- custom file that handles assigning capabilities by appending to the ucj data or creating ucj, whichever is appropriate.
- and handles revoking by removing from the ucj data or removing the ucj, whichever is appropriate.
- to be used for the custom cap assignment view (implement is js ruby)


