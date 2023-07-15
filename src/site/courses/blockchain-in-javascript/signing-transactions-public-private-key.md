---
title: Signing transactions with private key
videoId: kWQ84S13-hw
duration: 1120
order: 4
date: 2018-10-23
---

Transactions on a blockchain have to be signed. You do this with a public and private key. It prevents people from spending coins that aren't theirs.

In this video we will refactor our Javascript blockchain so that it will only accept signed transactions. 

We'll use the `ecp256k1` elliptic curve to generate a keypair. The same algorithm used in Bitcoin. But you can use other algorithms as well.

# Source code
The code used in this video is [available on GitHub](https://github.com/SavjeeTutorials/SavjeeCoin).

Feel free to fork it, improve it and open pull requests!