//
//  NetworkCalls.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-09-25.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

import Foundation

func transferValueBy(transaction: Transaction, callback: @escaping (Any?) -> Void) {
  DispatchQueue.global(qos: .userInitiated).async {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = "http://localhost:8080/transactionDAO"

    let dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox

    let placedTransaction = (try? dao.put(transaction)) as? Transaction
    DispatchQueue.main.async {
      callback(placedTransaction)
    }
  }
}

func transferValueBy(payer payerId: Int,
                     payee payeeId: Int,
                     amount: Int,
                     rate: Float? = 1,
                     purpose: TransactionPurpose?,
                     fees: Int? = 0,
                     notes: String? = "",
                     callback: @escaping (Any?) -> Void)
{
  DispatchQueue.global(qos: .userInitiated).async {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = "http://localhost:8080/transactionDAO"

    let dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox

    let transaction = X.create(Transaction.self)!
    transaction.payerId = payerId
    transaction.payeeId = payeeId
    transaction.amount = amount
    transaction.rate = rate!
    transaction.fees = fees!
    transaction.notes = notes!

    let placedTransaction = (try? dao.put(transaction)) as? Transaction
    DispatchQueue.main.async {
      callback(placedTransaction)
    }
  }
}

