//
//  NetworkCalls.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-09-25.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

import Foundation

func transferValueByEmail(payer: String, payee: String, amount: Int, callback: @escaping (Any?) -> Void) throws {
  DispatchQueue.global(qos: .userInitiated).async {
    // TODO: API call.
    DispatchQueue.main.async {
      // TODO: Send back data from API call.
      callback("something")
    }
  }
}

