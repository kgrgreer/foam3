# Liquified Crunch

## LiquidCapability.js

### LiquidCapability
- extends Capability 
- hides the unneeded fields of Capaility 
- sets the 'of' property to hidden and factory to return `AccountTemplate`

### GlobalLiquidCapability
- extends LiquidCapability
- includes boolean properties on all of the global roles 
- overrides the implies method such that it :
    Takes a permission string in the form of "booleanPropertyName.outgoingAccountId", and 
    checks if the boolean property is checked.
    If so, find the ucj and check if the outgoingAccountId is in the accountTemplate map or a child of
    an account in the accountTemplate map stored in the ucj.

### AccountBasedLiquidCapability
- extends LiquidCapability
- include boolean properties on all the account-based roles
- overrides the implies method such that it 
    Takes a permission string generated from the LiquidAuthorizer in the form of any of the boolean property names above.
    Returns true if that boolean is true.

## AccountTemplate.js

### AccountTemplate
- implement `Validatable`
- the data stored in the liquid specific UserCapabilityJunction
- includes a property called `accounts` of type `Map<Long, AccountData>` where the keys represent account IDs and values are the corresponding `AccountData` object
- methods include: 
  - `isParentOf(x, childAccountId)` : Check if a given account is in the map or implied by an account in the map through cascading.
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

## UserCapabilityJunctionDAO.js
- extends `foam.nanos.crunch.UserCapabilityJunctionDAO`
- a liquid specific decorator for the `UserCapabilityJunctionDAO` such that it provides alternative implementations of the following methods: 
  - `put_(x, obj)` : A liquid specific decorator for the UserCapabilityJunctionDAO so that the accountTemplateData will be updated instead of overwritten on ucj update.
  - `remove_(x, obj)` :  A liquid specific decorator for the UserCapabilityJunctionDAO so that the accountTemplateData will be updated instead of overwritten on ucj update.
  - `remove_(x, obj, accountId)` : A liquid specific remove_ for the UserCapabilityJunction such that it removes an account in the junction data instead of removing the whole junction, used for unassigning a capability of an User for some account
