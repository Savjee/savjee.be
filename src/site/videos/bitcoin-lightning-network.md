---
layout: video
collection: videos
title: Bitcoin's Lightning Network
videoId: rrr_zPmEiME
duration: 334
order: 5
series: Simply explained
date: 2017-12-12
tags: ["Bitcoin", "Blockchain scaling"]
---

Bitcoin has a 7 transactions/second limit, far too low for becoming a major payment provider (VISA handles on average around 4000 transactions/second). So how can we solve this?

<!--more-->

One of the proposed solutions is by using the Lightning network. This reduces the load on the main blockchain by letting small transactions happen off-chain. By using this network, you directly exchange money with a counterparty, without hitting the main blockchain. Scalability through this system is virtually limitless.

# Sources

{% bibtex %}
@online{src,
    title = {Visa Inc. Facts & Figures},
    date = 2017,
    organization = {VISA Inc.},
    url = {https://usa.visa.com/dam/VCOM/global/about-visa/documents/visa-facts-figures-jan-2017.pdf},
}

@online{src,
    title = {Scalability},
    organization = {Bitcoin Wiki},
    url = {https://en.bitcoin.it/wiki/Scalability},
}

@online{src,
    title = {A Simple Explanation of the Lightning Network},
    date = 2015,
    author = {Kyle Torpey},
    url = {https://coinjournal.net/a-simple-explanation-of-the-lightning-network/},
}

@online{src,
    title = {Lightning Can Scale Bitcoin, But Are Costs a Barrier?},
    date = 2017,
    author = {Alyssa Hertig},
    url = {https://www.coindesk.com/will-bitcoins-lightning-network-used/},
}

@online{src,
    title = {Mathematical Proof That the Lightning Network Cannot Be a Decentralized Bitcoin Scaling Solution},
    date = 2017,
    author = {Jonald Fyookball},
    url = {https://medium.com/@jonaldfyookball/mathematical-proof-that-the-lightning-network-cannot-be-a-decentralized-bitcoin-scaling-solution-1b8147650800},
}

@online{src,
    title = {What You Need to Know About the Future of Bitcoin Technology},
    date = 2017,
    author = {Subhan Nadeem},
    url = {https://medium.freecodecamp.org/future-of-bitcoin-cc6936ba0b99},
}

@online{src,
    title = {A Primer to The Lightning Network (Part 1)},
    date = 2017,
    organization = {ecurrencyhodler},
    url = {https://medium.com/the-litecoin-school-of-crypto/a-primer-to-the-lightning-network-part-1-be909c403bde},
}

@online{src,
    title = {Multisignature},
    organization = {Bitcoin Wiki},
    url = {https://en.bitcoin.it/wiki/Multisignature#Multisignature_Wallets},
}
{% endbibtex %}