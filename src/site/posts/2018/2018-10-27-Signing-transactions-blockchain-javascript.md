---
layout: post
title: Signing Transactions (Javascript blockchain, part 4)
quote:
tags: [Blockchain]
thumbnail: /uploads/2018-10-27-signing-transactions-blockchain-javascript/poster-750.jpg
upload_directory: /uploads/2018-10-27-signing-transactions-blockchain-javascript
---

This is part 4 of my blog posts series in which we create a blockchain in Javascript. In the previous blog posts, we added wallets and mining rewards to our simple blockchain. But the current implementation doesn't validate transactions. We can effectively spend money from someone else's wallet! Let's fix that.

<!--more-->

Missed the other parts? Read them here:

* [Part 1: Implementing a basic blockchain]({% link collections.posts, '2017-07-19-Writing-tiny-blockchain-in-JavaScript' %}).
* [Part 2: Implementing proof-of-work]({% link collections.posts, '2017-09-03-Implementing-proof-of-work-javascript-blockchain' %}).
* [Part 3: Transactions & mining rewards]({% link collections.posts, '2018-02-12-Transactions-and-mining-rewards' %}).
* **Part 4: Signing transactions**

{% include "youtube-embed.html", videoId:'kWQ84S13-hw' %}

## Creating a key generator
TO solve this problem we have to sign transactions. We do this with a public and private keypair. The public key will be used as our wallet's address and is freely shareable, while the private key will be used to sign transactions. This means we can only spend money in a wallet if we have the associated private key. The same system is used in Bitcoin, Euthereum and other cryptocurrencies.


So let's start by generating ourselves a public and private key. I'll create a file called `keygenerator.js` for that:

{% highlight js %}
// Import the elliptic library and initialize a curve.
// You can use other curves if you want.
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

// Print the keys to the console
console.log();
console.log('Your public key:', publicKey);

console.log();
console.log('Your private key', privateKey);
{% endhighlight %}

We use the [elliptic](https://www.npmjs.com/package/elliptic) library to generate a keypair. We also have to install the package:

```
npm install elliptic
```

Let's now run it!

```
node keygenerator.js
```

The script will return a public and private key. Write these down, they will be used as your wallet address and as a way to get funds out of your wallet.

```
Your public key:
0481758cb017885d884d1a8eb309c82e2644bc1776a0244b000adef2bb05755e8bbca68905b1387cf2e97b044a4287befa9400c1bd6c2ee6bf1241341ab4338f7a

Your private key:
854de2a5ab09aa1ed51fd878a917c9778f606ca010effb7bc488c643744b9a38
```


## Change Transaction class
Now we have to adapt our `Transaction` class. We'll add a methods that allow us to sign a transaction, verify the signature and we're also going to calculate the hash of transactions. 

Let's start with the hash:

{% highlight js %}
calculateHash(){
	return SHA256(this.fromAddress + this.toAddress + this.amount)
			.toString();
}
{% endhighlight %}

Why do we need to calculate a hash for each transaction? Well because we don't want to sign all the data in the Transaction object. We are only going to sign the hash of the transaction.

Next, let's create a `signTransaction` method, which should accept a `signingKey` as a parameter.

{% highlight js %}
signTransaction(signingKey){
	if(signingKey.getPublic('hex') !== this.fromAddress){
		throw new Error('You cannot sign transactions for other wallets!');
	}

	const hashTx = this.calculateHash();
	const sig = signingKey.sign(hashTx, 'base64');
	this.signature = sig.toDER('hex');
}
{% endhighlight %}

We also add a check to verify that the given key matches the sender of the transaction. Remember: you can only sign transactions when they come out of your own pocket. You can't spend the coins of someone else.

Finally, we can add an `isValid` method that will check the signature on the transaction and return `true` if everything is correct or `false` if someone has tried to tamper with a transaction and the signature is invalid:

{% highlight js %}
isValid(){
  if(this.fromAddress === null) return true;

	if(!this.signature || this.signature.length === 0){
		throw new Error('No signature in this transaction');
	}

	const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
	return publicKey.verify(this.calculateHash(), this.signature);
}
{% endhighlight %}



## Block class
To put a transaction in a blockchain, you have to add it to a Block. A block can contain multiple transactions, so to make our lives a bit easier, I'll make a simple method that checks if all the transactions inside a block are valid and correctly signed. 

We just loop over all the transactions and call its `isValid` method:

{% highlight js %}
hasValidTransactions(){
	for(const tx of this.transactions){
		if(!tx.isValid()){
			return false;
		}
	}

	return true;
}
{% endhighlight %}

That's it for the Block class. Now let's move on to our big Blockchain class!

## Blockchain class
Finally we have to adapt our Blockchain class.

We'll start by changing the `isChainValid` method. Right now it looks at all the blocks and verifies that they all point towards the correct previous block. We can keep all of those checks but we also have to check if the block contains valid and signed transactions.

{% highlight js %}
isChainValid(){

	// ....

	for (let i = 1; i < this.chain.length; i++) {
		const currentBlock = this.chain[i];
		const previousBlock = this.chain[i - 1];

		// ...

		if (!currentBlock.hasValidTransactions()) {
			return false;
		}
	}
}
{% endhighlight %}

We can use the `hasValidTransactions` method that we just added to our Block class! Convenient!

Then we also have to change our `createTransaction` method. I'll start by renaming it to `addTransaction` because that makes more sense. The method doesn't create a transaction, it just accepts a `Transaction` object that the user gives it.

Next up, we have to make sure that a user can only add a valid transaction to our blockchain. That means checking if the `from` and `to` addresses are filled in and that the transaction has been correctly signed: 

{% highlight js %}
addTransaction(transaction){
	if(!transaction.fromAddress || !transaction.toAddress){
		throw new Error('Transaction must include from and to address');
	}

	if(!transaction.isValid()){
		throw new Error('Cannot add invalid transaction to chain');
	}

	this.pendingTransactions.push(transaction);
}
{% endhighlight %}

And that's all we have to do! 

## Testing everything!
We're ready to test our new implementation. Let's start by importing the private key that we generated in the beginning of this post:

{% highlight js %}
// Import elliptic
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Create key object
const myKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf');
const myWalletAddress = myKey.getPublic('hex');
{% endhighlight %}

Once we have our key, we can create a new instance of `Blockchain` and make a transaction! In this case, I'm the only one on the network, so I'll just send my money to a random public key. Note however that by doing this, your coins are forever locked away in that address.

{% highlight js %}
// Create new instance of Blockchain class
const savjeeCoin = new Blockchain();

// Make a transaction
const tx1 = new Transaction(myWalletAddress, 'public key of recipient', 10);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);
{% endhighlight %}

After we mined a new block, we can verify our balance by giving the method our public key:

{% highlight js %}
console.log('Balance of xavier is', savjeeCoin.getBalanceOfAddress(myWalletAddress));
{% endhighlight %}

This will report that the balance on my wallet is 90. That's because I receive 100 coins for mining a new block (mining reward) and I spend 10 coins by sending a transaction.

## Tamper-proof
Just like before, our Blockchain remains tamper-proof. In fact, you could say that's it's even more resilient now because we require transactions to be signed with a private key.

{% highlight js %}
// Tampering
savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');
{% endhighlight %}


{% highlight js %}
// Tampering
savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');
{% endhighlight %}


## Limitations & conclusion
This blockchain has some limitations. It still allows you to spend more coins that you have in your wallet and it doesn't have a P2P network. More to follow!

## Disclaimer & Source code
This by no means a complete blockchain implementation! It is for educational purposes only, to understand how a blockchain works on a technical level.

The source code of this project is available [on GitHub](https://github.com/SavjeeTutorials/SavjeeCoin).