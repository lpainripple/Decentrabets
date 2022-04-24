//'use strict';

///*part 1

// Wrap code in an async function so we can use await
async function generateWallet() {
  // Define the network client
  console.log("Starting connection");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connection stablished");

  //funding a wallet:
  console.log("generating and funding wallet...");
  const fund_result = await client.fundWallet();
  const test_wallet = fund_result.wallet;
  console.log("wallet generated. Result:");
  console.log(fund_result);

  // Disconnect when done
  client.disconnect();
  console.log("client disconnected");
}

async function retrieveWallet() {
  // Define the network client
  console.log("Starting connection");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connection stablished");

  //retrieving a wallet:
  console.log("retrieving wallet...");
  const test_wallet = xrpl.Wallet.fromSeed("sEdSogn53Mmqrz6RgCwkoTY1mZhCUUr");
  console.log("wallet retrieved. Result:");
  console.log(test_wallet);

  // Disconnect when done
  client.disconnect();
  console.log("client disconnected");
}

async function verifyTransaction() {
  // Define the network client
  console.log("Starting connection");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connection stablished");

  //retrieving a wallet:
  console.log("retrieving wallet...");
  const test_wallet = xrpl.Wallet.fromSeed("sEdSogn53Mmqrz6RgCwkoTY1mZhCUUr");
  console.log("wallet retrieved. Result:");
  console.log(test_wallet);

  const response = await client.request({
    command: "account_info",
    account: test_wallet.address,
    ledger_index: "validated",
  });
  console.log(response);

  // Disconnect when done
  client.disconnect();
  console.log("client disconnected");
}

async function sendTransaction() {
  // Define the network client
  console.log("Starting connection");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connection stablished");

  // Example credentials
  const wallet = xrpl.Wallet.fromSeed("sEdSogn53Mmqrz6RgCwkoTY1mZhCUUr");
  console.log("wallet address:");
  console.log(wallet.address);

  // Prepare transaction -------------------------------------------------------
  console.log("Preparing transaction:");
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: wallet.address,
    Amount: xrpl.xrpToDrops("22"),
    Destination: "rJf1LJ4c5jhJAq9iNh2WBDkbRagw9t7re3", //address ? Seed is: sEd7anCeSkcs1tTjn8EDxoyGt31ooAc
  });
  const max_ledger = prepared.LastLedgerSequence;
  console.log("Prepared transaction instructions:", prepared);
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
  console.log("Transaction expires after ledger:", max_ledger);

  // Sign prepared instructions ------------------------------------------------
  const signed = wallet.sign(prepared);
  console.log("Identifying hash:", signed.hash);
  console.log("Signed blob:", signed.tx_blob);

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(signed.tx_blob);

  // Wait for validation -------------------------------------------------------
  // submitAndWait() handles this automatically, but it can take 4-7s.

  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult);
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );

  // Disconnect when done
  client.disconnect();
  console.log("client disconnected");
}

async function accountInfo() {
  // Define the network client
  console.log("Starting connection");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connection stablished");

  const response = await client.request({
    command: "account_info",
    account: "rJf1LJ4c5jhJAq9iNh2WBDkbRagw9t7re3",
    ledger_index: "validated",
  });
  console.log(response);

  // Disconnect when done
  client.disconnect();
  console.log("client disconnected");
}

function test() {
  document.getElementById("test").innerHTML = "write on the page";
}

//end of part 2 */

/* wallet 1 info: 
    {wallet: g, balance: 1000}
    balance: 1000
    wallet: g
    classicAddress: "rJf1LJ4c5jhJAq9iNh2WBDkbRagw9t7re3"
    privateKey: "EDD12AA78BAB0CCB7A8BCA100A1DCD4D61179FA995DBC001DFC8977C47182D1C0C"
    publicKey: "EDEB66CEE8634F452C41A7387C8BE75496185B607BCEABF9C819A494566B437D9B"
    seed: "sEd7XtjizcPqbN5kcsT8bkaJwDgG9u9"
    address: "rJf1LJ4c5jhJAq9iNh2WBDkbRagw9t7re3"
    [[Prototype]]: Object
    [[Prototype]]: Object
end of wallet 1 info */

/* wallet 2 info: 
    {wallet: g, balance: 1000}
    balance: 1000
    wallet: g
    classicAddress: "rsZqYGYsiRLk59troxhKYeb5ijgy4hLC9T"
    privateKey: "ED8C7E534CE7E2918B31EEDF2BF448116ECC104BAD125C55DE81AD77D1D1979365"
    publicKey: "EDB74308497A01BE9F9BB52B067E5F0E318A369169DA8A1E1A2537E4B83DD25C32"
    seed: "sEd7a6q3EKgYgN9uu3nzTyLtDbqjRjL"
    address: "rsZqYGYsiRLk59troxhKYeb5ijgy4hLC9T"
    [[Prototype]]: Object
    [[Prototype]]: Object
end of wallet 1 info */
