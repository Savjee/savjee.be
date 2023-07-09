---
layout: video
collection: videos
title: "Oblivious DNS over HTTPS"
videoId: TFvRp5SUgfE
duration: 289
order: 38
series: Simply explained
date: 2020-12-21
tags: ["Privacy"]
not_featureable: true
---

Oblivious DNS is a privacy-friendly version of the DNS protocol. Preventing third-parties from keeping track of the sites you visit.

It builds on top of DoH (DNS over HTTPS) and adds a proxy server to prevent tracking. It was developed by Cloudflare, Apple and Fastly. 

Currently, ODNS is not yet widely supported, but that could quickly change! Especially if Apple would push it to their iOS and macOS customers.

# Sources
This video wouldn't be possible without the work of others. Here are the sources I've used during my research & script writing:

{% bibtex %}
@article{schmitt2019oblivious,
  title={Oblivious DNS: Practical privacy for DNS queries},
  author={Schmitt, Paul and Edmundson, Anne and Mankin, Allison and Feamster, Nick},
  journal={Proceedings on Privacy Enhancing Technologies},
  volume={2019},
  number={2},
  pages={228--244},
  year={2019},
  publisher={Sciendo}
}
@online{src,
    title={},
    url={https://blog.cloudflare.com/oblivious-dns/},
    author={Tanya Verma,Sudheesh Singanamalla},
    organization={Cloudflare},
    year={2020},
    month={8},
    day={12}
}

@online{src,
    title={DoHn't believe the hype! You are being lied to by data-hungry ISPs, Mozilla warns lawmakers},
    url={https://www.theregister.com/2019/11/04/mozilla_doh_congress/},
    author={Thomas Claburn},
    year={2019},
    month={11},
    day={4}
}

@inproceedings{mazhar2020characterizing,
  title={Characterizing Smart Home IoT Traffic in the Wild},
  author={Mazhar, M Hammad and Shafiq, Zubair},
  booktitle={2020 IEEE/ACM Fifth International Conference on Internet-of-Things Design and Implementation (IoTDI)},
  pages={203--215},
  year={2020},
  organization={IEEE}
}

@article{apthorpe2017spying,
  title={Spying on the smart home: Privacy attacks and defenses on encrypted iot traffic},
  author={Apthorpe, Noah and Reisman, Dillon and Sundaresan, Srikanth and Narayanan, Arvind and Feamster, Nick},
  journal={arXiv preprint arXiv:1708.05044},
  year={2017}
}

@online{src,
    title={odoh-client-rs},
    url={https://github.com/cloudflare/odoh-client-rs/},
    organization={Cloudflare}
}
{% endbibtex %}