//
//  NetworkCalls.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-09-25.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

import Foundation

private func getTransactionDAO() -> ClientDAO {
  let X = getX()

  let httpBox = X.create(HTTPBox.self)!
  httpBox.url = "http://localhost:8080/transactionDAO"

  let dao = X.create(ClientDAO.self)!
  dao.delegate = httpBox
  return dao
}

private func getX() -> Context {
  let boxContext = BoxContext()
  return boxContext.__subContext__
}

public func transferValueBy(transaction: Transaction, callback: @escaping (Any?) -> Void) {
  DispatchQueue.global(qos: .userInitiated).async {
    let dao = getTransactionDAO()

    do {
      let placedTransaction = (try dao.put(transaction)) as? Transaction
      DispatchQueue.main.async {
        callback(placedTransaction)
      }
    } catch let e {
      NSLog(((e as? FoamError)?.toString()) ?? "Error!")
      DispatchQueue.main.async {
        callback(nil)
      }
    }
  }
}

public func transferValueBy(payer payerId: Int,
                     payee payeeId: Int,
                     amount: Int,
                     rate: Float? = 1,
                     purpose: TransactionPurpose?,
                     fees: Int? = 0,
                     notes: String? = "",
                     callback: @escaping (Any?) -> Void)
{
  DispatchQueue.global(qos: .userInitiated).async {
    let dao = getTransactionDAO()

    let transaction = getX().create(Transaction.self)!
    transaction.payerId = payerId
    transaction.payeeId = payeeId
    transaction.amount = amount
    transaction.rate = rate!
    transaction.fees = fees!
    transaction.notes = notes!

    do {
      let placedTransaction = (try dao.put(transaction)) as? Transaction
      DispatchQueue.main.async {
        callback(placedTransaction)
      }
    } catch let e {
      NSLog(((e as? FoamError)?.toString()) ?? "Error!")
      DispatchQueue.main.async {
        callback(nil)
      }
    }
  }
}

public func getTransactions(startingAt skip: Int? = 0,
                            withLimit  limit: Int? = 100,
                            callback: @escaping ([Any?]?) -> Void)
{
  DispatchQueue.global(qos: .userInitiated).async {
    let dao = getTransactionDAO()

    do {
      let sink = (try dao.skip(skip!).limit(limit!).select(ArraySink())) as? ArraySink
      DispatchQueue.main.async {
        callback(sink?.array)
      }
    } catch let e {
      NSLog(((e as? FoamError)?.toString()) ?? "Error!")
      DispatchQueue.main.async {
        callback(nil)
      }
    }
  }
}

