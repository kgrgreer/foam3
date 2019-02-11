# Compliance service + Rule engine

## Description

- Objective: Evaluate the application of rule engine on compliance service.
- Background: The implementation of compliance service has a good deal of similarity with that of rule engine. In fact, rule engine is designed to be generic and could potentially replace a significant number of decorators on existing DAO services.
- Current status: Compliance service is completed and is in code review stage but retrofit is required to integrate rule engine.
- Strategic fit with product goals or R&D department goals: Investigate the integration of rule engine for compliance validation service to eliminate duplication, extend and enhance robustness of rule engine.

## Solution Description

This project will both extend the capabilities of rule engine to support use cases for compliance validation and update on compliance service itself to make use of rule engine.

### In-Scope

The following components are in scope of compliance service and rule engine integration:

- Evaluate the functionalities needed to be delivered by compliance service in comparison to the capabilities currently offered by rule engine
- Refine/extend rule engine
- Retrofit compliance service to use rule engine

## Analysis

### Rule engine

Rule engine is a feature in FOAM which offers the ability to execute additional actions on top of a DAO operation such as creating, updating or removing object from a DAO. When put into use, rule engine can greatly reduce the number of decorators on existing DAO services by replacing them with rules.

Rules can be added, updated and removed at run-time thus allowing various enhancements on the DAO services to be made on-the-fly without the need to reload the application. 

#### How it works

The target DAO service is wrapped with RulerDAO which takes a serviceName parameter for configuring its daoKey for rule lookup. RulerDAO intercepts put_ and remove_ calls on the target DAO and applies relevant rules on the object being put and removed.

Rules are configured with daoKey and ruler operation which the RulerDAO can match against when looking for relevant to be applied.
Rules are grouped by ruleGroup and applied in descending order of priority. If a rule has its stops flag set to true the following rules in the same group will not be executed.
Rules evaluate their predicates before applying the associated actions.

### Compliance service

Compliance service performs validations on user, business and account entity on creation and updates as a part of KYC and AML solution at Nanopay.

It performs validation by running compliance validators, logging results from the validation to compliance history and updating the entity's compliance status accordingly.

#### How it works

Compliance validation is a two-stage process.

First, the target DAO is wrapped with ComplianceValidationDAO which can be configured with a predicate. ComplianceValidationDAO intercepts the put_ call and runs compliance service when passing the predicate test.
Compliance service goes through all applicable rules and add a compliance history record pending for validation.

Second, ExecuteComplianceHistoryDAO decorator picks up the compliance record and executes the validation using compliance service asynchronously.
Compliance service runs the assoicated validator, set the status and expirationDate of the compliance record and update the compliance status of the entity object.

Compliance service can also be configured with maxRetry (defaults to 5) and retryDelay (defaults to 10 seconds) for error handling and retry when a compliance validation exception occurs.

Expired compliance records will be re-scheduled for excution via RenewExpiredComplianceHistoryCron which has been setup to run every hour.

### Comparison

| Rule engine                                                  | Compliance service                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| **RulerDAO**                                                 | **ComplianceValidationDAO**                                  |
| - applies rules on DAO.put_ and DAO.remove_                  | - applies complianceRules on DAO.put_                        |
| - can apply rules before or after DAO operation              | - applies rules after DAO operation                          |
| - applies rules in order of rule.priority                    | - no rules ordering                                          |
| - can halt lower priority rules in the same group            | - all rules are executed                                     |
| - evaluates `rule.predicate.f(obj)` before applying rule     | - evaluates `predicate(oldObj, obj)`                         |
| - applies actions synchronously                              | - delegates to CompliaceService                              |
|                                                              |                                                              |
| **Rule**                                                     | **ComplianceRule**                                           |
| - N/A                                                        | - `enabled` flag to enable/disable a rule                    |
| - N/A                                                        | - `validity` for automatic re-scheduling                     |
| - `predicate` (mlang predicate) to check applicability       | - delegates to `ComplianceValidator.canValidate`             |
| - `action` (RuleAction) to apply                             | - delegates to `ComplianceValidator.validate`                |
| - `daoKey` and `operation` for filtering                     | - no filtering                                               |
| - `ruleGroup` and `priority` to order rules when applied     | - N/A                                                        |
| - `after` flag to apply rule after DAO operation             | - always after                                               |
| - `stops` flag to stop running subsequent rules in the same group | - N/A                                                        |
|                                                              |                                                              |
| **RuleAction**                                               | **ComplianceValidator**                                      |
| - not needed (`Rule.predicate` would be sufficient)          | - `canValidate(x, obj)`                                      |
| - `applyAction(x, obj, oldObj)`                              | - `validate(x, obj)`                                         |
|                                                              |                                                              |
|                                                              | **ComplianceHistory**                                        |
|                                                              | - `created`, `createdBy`, `lastModified`, `lastModifiedBy` for auditability |
|                                                              | - `ruleId`, `entityId` and `entityDaoKey` for validating the entity (user/business/account) |
|                                                              | - `status` stores result from Compliance.validate            |
|                                                              | - `expirationDate` and `wasRenew` for automatic re-scheduling |
|                                                              | - `retry` for handling retry when rule validator encounter failure |
|                                                              |                                                              |
|                                                              | **ComplianceService**/**NanopayComplianceService**           |
|                                                              | - `validate(x, entity)` adds compliance history records pending for validation for all applicable rules |
|                                                              | - `execute(x, record)` runs compliance validation on the compliance history record and update compliance status on the entity |
|                                                              |                                                              |
|                                                              | **ExecuteComplianceHistoryDAO**                              |
|                                                              | - runs `ComplianceService.execute` asynchronously when adding new compliance history record to DAO |
|                                                              |                                                              |
|                                                              | **RenewExpiredComplianceHistoryCron**                        |
|                                                              | - re-news compliance history records that are expired        |
|                                                              |                                                              |

