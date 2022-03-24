const xrpl = require('xrpl')

// Wrap code in an async function so we can use await
async function main() {
  // Define the network client
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  // Prompt for account creation
  let prompt = require("prompt-sync")();
  let answer = prompt("Generate accounts (y or n)? ");

  let gamb1Wallet
  let gamb2Wallet
  let gamb1Address
  let gamb2Address
  const decentAddress = "rwb6rkXPrpkaX8aoF5M9yEoMhsUgmWub9Z"

  // Create new accounts and fund them
  if (answer == "y") {
    console.log("\n","-------------GENERATING ACCOUNTS-------------","\n")
    const fundResult1 = await client.fundWallet()
    gamb1Wallet = fundResult1.wallet
    const fundResult2 = await client.fundWallet()
    gamb2Wallet = fundResult2.wallet
    gamb1Address = gamb1Wallet.classicAddress
    gamb2Address = gamb2Wallet.classicAddress
    gamb1Seed = gamb1Wallet.seed
    gamb2Seed = gamb2Wallet.seed
    console.log("Gambler 1's Account: ", gamb1Address)
    console.log("Gambler 1's Seed: ", gamb1Seed)
    console.log("Gambler 2's Account: ", gamb2Address)
    console.log("Gambler 2's Seed: ", gamb2Seed)

  // Use old accounts
  } else if (answer == "n") {
    //Gambler 1 Account: r9ogWj4PkRjb1fwcNhQE8XphhsamYEezkK
    //Gambler 2 Account: rUKiJrmDALnFYPZ3NiZYV3HdefYqAut5iy
    const seed = ['sEdVY8jUp9kassuSkkKw6cPnw5PzqM9', 'sEdVrvKSjQYBtTRXYtamTuj4oyTEaN5']
    gamb1Wallet = xrpl.Wallet.fromSeed(seed[0])
    gamb2Wallet = xrpl.Wallet.fromSeed(seed[1])
    gamb1Address = gamb1Wallet.address
    gamb2Address = gamb2Wallet.address
  }

  // Get info from the ledger about the address we just funded
  const response1 = await client.request({
    "command": "account_info",
    "account": gamb1Address,
    "ledger_index": "validated"
  })
  console.log("\n","-------------ACCOUNT INFO FOR GAMBLER 1-------------","\n")
  console.log(response1)

  const response2 = await client.request({
    "command": "account_info",
    "account": gamb2Address,
    "ledger_index": "validated"
  })
  console.log("\n","-------------ACCOUNT INFO FOR GAMBLER 2-------------","\n")
  console.log(response2)

  // Prompt for bets
  prompt = require("prompt-sync")();
  const bet1 = prompt("Place bet for Gambler 1 (in XRP): ");
  const bet2 = prompt("Place bet for Gambler 2 (in XRP): ");
  console.log("Place escrow expiration time (4 for the Winner / 60 for the Loser)")
  const time1 = prompt("Gambler 1 (in s): ");
  const time2 = prompt("Gambler 2 (in s): ");

  // Create Escrow for Gambler 1
  console.log("\n","-------------ESCROW FOR GAMBLER 1-------------","\n")

  const return1 = await escrowCreate(client, gamb1Wallet, gamb2Wallet, bet1, time1)
  const fulfillment1 = return1[0]
  const condition1 = return1[1]
  const sequence1 = return1[2]
  const hash1 = return1[3]

  // Create Escrow for Gambler 2
  console.log("\n","-------------ESCROW FOR GAMBLER 2-------------","\n")

  const return2 = await escrowCreate(client, gamb2Wallet, gamb1Wallet, bet2, time2)
  const fulfillment2 = return2[0]
  const condition2 = return2[1]
  const sequence2 = return2[2]
  const hash2 = return2[3]

  if (time1 < time2) {
    console.log("\n\n\n")
    console.log('*******************************************************')
    console.log('***************** Winner is Gambler 1 *****************')
    console.log('*******************************************************',"\n\n\n")
    await escrowFinish(client, gamb2Wallet, sequence2, condition2, fulfillment2)
    await escrowCancel(client, gamb1Wallet, sequence1)
    await feeSend(client, gamb1Wallet, decentAddress)

  } else if (time1 > time2) {
    console.log("\n\n\n")
    console.log('*******************************************************')
    console.log('***************** Winner is Gambler 2 *****************')
    console.log('*******************************************************',"\n\n\n")
    await escrowFinish(client, gamb1Wallet, sequence1, condition1, fulfillment1)
    await escrowCancel(client, gamb2Wallet, sequence2)
    await feeSend(client, gamb2Wallet, decentAddress)
  }
  client.disconnect()
}

// Winner sends fee to Decentrabet's account
async function feeSend(client, gambWallet, decentAddress) {
  // Send XRP Fee to Decentrabets Account
  const prepared = await client.autofill({
      "TransactionType": "Payment",
      "Account": gambWallet.address,
      "Amount": xrpl.xrpToDrops("1"),
      "Destination": decentAddress
  })

  console.log("\n","-------------TRANSACTION FEE INFO-------------","\n")

  const tx = await signAndSubmit (client, gambWallet, prepared)
}

// Create escrow for both gamblers
async function escrowCreate(client, gamb1Wallet, gamb2Wallet, bet, time) {
  // Creating unique PREIMAGE SHA 256 CONDITION
  const cc = require('five-bells-condition')
  const crypto = require('crypto')

  const preimageData = crypto.randomBytes(32)
  const myFulfillment = new cc.PreimageSha256()
  myFulfillment.setPreimage(preimageData)
  console.log("\n","-------------CREATING PREIMAGE-SHA-256 CONDITION-------------","\n")
  const condition = myFulfillment.getConditionBinary().toString('hex').toUpperCase()
  console.log('Condition:', condition)
  // (Random hexadecimal, 72 chars in length)

  // keep secret until you want to finish executing the held payment:
  const fulfillment = myFulfillment.serializeBinary().toString('hex').toUpperCase()
  console.log('Fulfillment:', fulfillment)
  // (Random hexadecimal, 78 chars in length)

  // Escrow fulfillment expiration (3s)
  const rippleOffset = 946684800
  const cancelAfter = Math.floor(Date.now() / 1000) + (1*time) - rippleOffset
  //const cancelAfter = Math.floor(Date.now() / 1000) + (24*60*60) - rippleOffset (24h)

  // Creating Conditional Escrow
  const prepared = await client.autofill({
    "TransactionType": "EscrowCreate",
    "Account": gamb1Wallet.address,
    "Amount": xrpl.xrpToDrops(bet),
    "Destination": gamb2Wallet.address,
    "Condition": condition,
    "CancelAfter": cancelAfter
  })

  console.log("\n","-------------CREATING ESCROW INFO-------------","\n")

  const tx = await signAndSubmit (client, gamb1Wallet, prepared)
  const sequence = tx.result.Sequence
  const hash = tx.result.hash
  console.log('Hash:', hash)
  console.log('Sequence:', sequence)
  return [fulfillment, condition, sequence, hash]
}

// Release loser's escrow
async function escrowFinish(client, gambWallet, sequence, condition, fulfillment)  {
  // Creating Conditional Escrow
  const prepared = await client.autofill({
    "TransactionType": "EscrowFinish",
    "Account": gambWallet.address,
    "Owner": gambWallet.address,
    "Fulfillment": fulfillment,
    "Condition": condition,
    "OfferSequence": sequence
  })

  console.log("\n","-------------RELEASING ESCROW INFO-------------","\n")

  await signAndSubmit (client, gambWallet, prepared)
}

// Cancel winner's escrow
async function escrowCancel(client, gambWallet, sequence) {
  // Creating Conditional Escrow
  const prepared = await client.autofill({
    "TransactionType": "EscrowCancel",
    "Account": gambWallet.address,
    "Owner": gambWallet.address,
    "OfferSequence": sequence
  })

  console.log("\n","-------------CANCELLING ESCROW INFO-------------","\n")

  await signAndSubmit (client, gambWallet, prepared)
}

// Sign and Submit transactions/escrows
async function signAndSubmit(client, gambWallet, prepared)  {
  const maxLedger = prepared.LastLedgerSequence

  console.log("Prepared instructions:", prepared)
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  console.log("Transaction expires after ledger:", maxLedger)

  // Sign prepared instructions ------------------------------------------------
  const signed = gambWallet.sign(prepared)
  console.log("\n","-------------SIGNING INFO-------------","\n")
  //console.log("Identifying hash:", signed.hash)
  //console.log("Signed blob:", signed.tx_blob)

  // Submit signed blob --------------------------------------------------------
  console.log("\n","-------------SUBMITTING INFO-------------","\n")
  const tx = await client.submitAndWait(signed.tx_blob)
  console.log(tx)
  // Check transaction results -------------------------------------------------
  console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
  return tx
}

main()
