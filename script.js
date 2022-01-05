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
    Destination: "rP9tL4n6mz1GpiFkee9a1G3rLYQsToPcg", //address ? Seed is: sEd7anCeSkcs1tTjn8EDxoyGt31ooAc
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

async function main() {
  // Define the network client
  console.log("Starting connection");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connection stablished");

  //generate a wallet
  console.log("generating a wallet...");
  const test_wallet = xrpl.Wallet.generate();

  //read the public key from wallet
  //wallet generated
  console.log("wallet generated... retreiving public address: ");
  const publicKey = test_wallet.publicKey();
  console.log(publicKey);

  //load the wallet from a known seed
  console.log("returning wallet information from public key...");
  const test_wallet2 = xrpl.Wallet.fromSeed(publicKey);
  const publicKey2 = test_wallet.publicKey();
  console.log(publicKey2);

  //funding a wallet:
  const fund_result = await client.fundWallet();
  const test_wallet3 = fund_result.wallet;
  console.log(fund_result);

  // Disconnect when done
  client.disconnect();
  console.log("client disconnected");
}

function test() {
  document.getElementById("test").innerHTML = "write on the page";
}

//end of part 2 */
