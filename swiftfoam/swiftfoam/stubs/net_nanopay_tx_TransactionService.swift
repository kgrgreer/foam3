// GENERATED CODE. DO NOT MODIFY BY HAND.
public protocol TransactionService {
    func `transferValueById`(_ payerId: Int, _ payeeId: Int, _ amount: Int, _ rate: String, _ purposeCode: String, _ fees: Int, _ notes: String) -> Transaction
    func `transferValueByEmail`(_ payerEmail: String, _ payeeEmail: String, _ amount: Int) -> Any?
}