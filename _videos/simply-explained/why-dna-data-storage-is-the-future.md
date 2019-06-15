---
layout: video
collection: videos
title: "Why DNA Data Storage is the Future"
videoId: aPWA-n9oo4k
order: 25
series: Simply explained
uploadDate: 2019-06-17
hide: true
---

The fact that I have blue eyes, blond hair and that I have an average height is all encoded in my DNA. It’s nature’s way of storing data, but could we also use it to store digital data like documents, photos, music, and videos? And if we could, why would we? 
 
What are the pros and cons of DNA data storage and what problems does it solve? Before answering these questions though, let’s look at how we’ve been storing data up until today. 

## Data storage today
The vast majority of data is currently stored on magnetic media like hard drives or tapes and some of it is stored on optical media like CDs and DVDs. However, our modern storage techniques have a few flaws: they are not robust, have a low information density and each media requires a special device to read and write data. Let’s look at each of these problems in more detail and see how DNA can help.

## Problem 1: Robustness
Let’s start with robustness, or rather lack thereof. Hard drives are pretty unreliable with 1-3% of drives dying within their first year. In subsequent years that can climb to almost 10%. Tape drives are a bit better and are designed to last for up to 30 years IF they are stored in a controlled environment.

You might wonder why robustness is so important. Well, humanity has generated more data in the last few years than in all of history. And yet, in a few hundred years from now, none of it would be left unless we keep copying it to newer drives. That’s a big problem for historical data which could be invaluable in the future. 

DNA, on the other hand, is very robust. In 1991, the mummy of Ötzi the Iceman was found in the Alps. He died over 5000 years ago and yet we were still able to extract his DNA, read it and find out that he was lactose intolerant and that he has living relatives in Austria today. If Ötzi had been carrying a hard drive with him, we likely wouldn’t be able to read it 30 years after his death, let alone after 5000 years.

You could say that DNA is nature’s oldest and most robust storage media. It cannot be stored forever but it can easily last a few centuries.

## Problem 2: Density
The second problem that we currently face is information density. Facebook’s cold storage data center in Oregon is over 5700 square meters in size (62,000 square feet) and can store approximately 1 exabyte of data. That’s a thousand petabytes or 1 billion gigabytes.

It sounds impressive, but if you want to store all of the data that was generated in 2018, you would need 33,000 of these massive data centers. Yikes!

How does DNA compare? Well, theoretically you can store 1 zettabyte of data in a single gram of DNA. That’s a billion terabytes, the equivalent of 71 million of the largest capacity hard drives available today. 
 
But that’s theory, currently, we can only store 215 petabytes per gram of DNA. Which means we can replace Facebook's entire data center with just 5 gram of DNA. 

This insane density allows us to store all of the world’s data in a very small footprint. It also means we don’t have to choose what data we want to preserve for future generations. We can just store all of it all in DNA.

Heck, you even say that we, humans, are huge data capsules. We have over 37 trillion cells in our bodies, each containing a copy of our entire DNA. And if you know that the human genome is 750mb, then we’re carrying 37 trillion times 750 megabytes. Which is a huge amount of information!

## Problem 3: Specialized Readers
The final problem I’d like to highlight is that every advancement in storing data has required a new way to read it. 

The 3,5-inch floppy disks were very popular in the 80s and 90s. And yet, barely 40 years later we can hardly use them because our computers don’t have a reader for them anymore. The same goes for optical media such as CDs and DVDs.

DNA, by contrast, was not a human invention. It’s been around since the beginning of life and has always had the same properties. DNA readers or “sequencers” built today can read all DNA, even old DNA, like the one from Ötzi. 

It’s also future-proof because DNA is becoming a key technology in areas such as biology, medicine, and forensics.

## How to store data in DNA?
Alright, you probably agree with me that DNA is the future of data storage. But how do you actually store data in it? Traditionally we store data in binary form: meaning with zeros and ones. In a hard drive, the zeros are represented by areas which aren’t magnetized and ones by areas that are.

DNA is instead made up of four base components: Adenine, Thymine, Cytosine, and Guanine also referred to as A, T, C, and G. 
This means that we now have four distinct values instead of two, so we have to rework our binary files. Instead of storing each 0 or 1 individually, we store them in pairs of two, like this:

```
00 -> A
01 -> G
10 -> C
11 -> T
```

Once we have that, we can encode the data into synthetic DNA. This is exactly like the real stuff, the only difference being that synthetic DNA is not stored inside a living cell.

Now that our data is stored inside DNA, we can read it by using a DNA sequencer. This deconstructs the DNA and reads out all the A, T, C, G’s. This process, however, is not perfect and read errors might occur. 

The sequencer might not be able to read a certain piece of DNA because it’s damaged or it might say it read an A instead of a T. And when that happens, how can we recover the data?

In our own bodies, there are proteins active that find damaged or “mutated” DNA and try to repair it. If the damage is too big, they can even kill the entire cell to prevent spreading the bad DNA further. 
 
But that’s in organic DNA, in synthetic DNA we don’t have these proteins. So instead we can add error correcting codes to our data. The DNA Fountain method, for instance, uses fountain codes to correct errors, which is also used for broadcasting TV signals.

## Error-correcting codes
How does an error correcting code work? Simple: imagine you want to store three digits: 5, 9 and 17 and that you want to be able to recover all three of them, even if one can’t be read. To do that, you store the sum of all three as well (5 + 9 + 17 = 31). Now when the number 9 gets corrupted, you can recalculate it by subtracting the numbers from the sum. This is a very simple error correcting code but it demonstrates how the concept works.

By adding fountain codes to your DNA encoded data, you can ensure that you can always read it back. Even when some A, T, C or G’s can’t be read correctly.

## Copying DNA
Okay so that’s reading DNA, but can we also copy DNA? Traditionally with hard drives, we have to read one drive and copy every single bit to another one. DNA, by contrast, can easily be copied millions of times with a Polymerase Chain Reaction. This technique is used in forensics for instance to make copies of scarce DNA samples. If you then screw something up, you still have some copies left. 

The same technique can be used with synthetic DNA that contains data. The only downside is that by copying DNA you add some noise and the quality is reduced. But thanks to our error-correcting codes we can overcome this issue.

## Drawbacks of DNA
Using DNA as a storage medium seems like a no-brainer, but there are some drawbacks as well: mainly the cost of it all.

Creating or synthesizing DNA is an expensive process: coming in at $3500 dollars per megabyte. A bit much if you know that a hard drive can do the same for less than a penny. 
 
However we have to see this in context. The first hard drive made by IBM in 1956, could store 5 megabytes at a price of $10.000 per megabyte. We have to start somewhere!

Reading or sequencing DNA is a bit more affordable. You can have your own DNA sequenced for less than $1000. It is, however, time-consuming because the entire DNA has to be sequenced, even if you’re only interested in a small part of it. But that is changing: Microsoft has demonstrated a technique that allows us to randomly read parts of DNA.

## Conclusion
So, time for a conclusion then: DNA data storage is the future but it will take some time before we can phase out our trusty hard drives. 

Costs have to come down first before it can be considered a viable alternative but as history has shown, that’s is only a matter of time. And when it does, it will allow us to store incredible amounts of data in a very small space and we’ll able to archive data for generations to come.

---

# Sources
This video wouldn't be possible without the work of others. Here are the sources I've used during my research & script writing:

{% bibtex %}

@online{src,
    title={How we can store digital data in DNA},
    url={https://www.ted.com/talks/dina_zielinski_how_we_can_store_digital_data_in_dna},
    author={Dina Zielinski},
    organization={TED},
    year={2017},
    month={10},
}

@article{goldman2013towards,
  title={Towards practical, high-capacity, low-maintenance information storage in synthesized DNA},
  author={Goldman, Nick and Bertone, Paul and Chen, Siyuan and Dessimoz, Christophe and LeProust, Emily M and Sipos, Botond and Birney, Ewan},
  journal={Nature},
  volume={494},
  number={7435},
  pages={77},
  year={2013},
  publisher={Nature Publishing Group}
}

@article{erlich2017dna,
  title={DNA Fountain enables a robust and efficient storage architecture},
  author={Erlich, Yaniv and Zielinski, Dina},
  journal={Science},
  volume={355},
  number={6328},
  pages={950--954},
  year={2017},
  publisher={American Association for the Advancement of Science}
}

@online{src,
    title={What is DNA?},
    url={https://ghr.nlm.nih.gov/primer/basics/dna},
    organization={Genetics Home Reference},
    year={2019},
    month={5},
    day={28}
}

@online{src,
    title={How big is the human genome?},
    url={https://medium.com/precision-medicine/how-big-is-the-human-genome-e90caa3409b0},
    author={Reid J. Robison MD MBA},
    year={2014},
    month={1},
    day={6}
}

@article{jorde2004genetic,
  title={Genetic variation, classification and'race'},
  author={Jorde, Lynn B and Wooding, Stephen P},
  journal={Nature genetics},
  volume={36},
  number={11s},
  pages={S28},
  year={2004},
  publisher={Nature Publishing Group}
}

@online{src,
    title={Fountain code},
    url={https://en.wikipedia.org/wiki/Fountain_code},
    organization={Wikipedia},
}

@article{erlich2017dna,
  title={DNA Fountain enables a robust and efficient storage architecture},
  author={Erlich, Yaniv and Zielinski, Dina},
  journal={Science},
  volume={355},
  number={6328},
  pages={950--954},
  year={2017},
  publisher={American Association for the Advancement of Science}
}

@online{src,
    title={Researchers achieve random access in large-scale DNA data storage},
    url={https://phys.org/news/2018-02-random-access-large-scale-dna-storage.html},
    organization={Science X Network},
    year={2018},
    month={2},
    day={21}
}

@online{src,
    title={Ötzi},
    url={https://en.wikipedia.org/wiki/Ötzi},
    organization={Wikipedia},
}

@online{src,
    title={DNA Data Storage – Setting the Data Density Record with DNA Fountain},
    url={https://www.twistbioscience.com/company/blog/twistbiosiencednastoragefountain},
    author={Christiaan Colen},
    year={2017},
    month={12},
    day={12}
}

@article{reinsel2017data,
  title={Data age 2025: The evolution of data to life-critical},
  author={Reinsel, David and Gantz, John and Rydning, John},
  journal={IDC White Paper},
  pages={1--25},
  year={2017}
}

@online{src,
    title={Backblaze Hard Drive Stats for 2018},
    url={https://www.backblaze.com/blog/hard-drive-stats-for-2018/},
    author={Andy Klein},
    organization={Backblaze},
    year={2019},
    month={1},
    day={22}
}

@article{pinheiro2007failure,
  title={Failure trends in a large disk drive population},
  author={Pinheiro, Eduardo and Weber, Wolf-Dietrich and Barroso, Luiz Andr{\'e}},
  year={2007},
  url={https://www.usenix.org/legacy/events/fast07/tech/full_papers/pinheiro/pinheiro_old.pdf}
}

@online{src,
    title={History of IBM magnetic disk drives},
    url={https://en.wikipedia.org/wiki/History_of_IBM_magnetic_disk_drives},
    organization={Wikipedia},
}

@online{src,
    title={Mikhail Samoilovich Neiman},
    url={https://en.wikipedia.org/wiki/Mikhail_Samoilovich_Neiman},
    organization={Wikipedia},
}

@online{src,
    title={The Rise of DNA Data Storage},
    url={https://www.wired.com/story/the-rise-of-dna-data-storage/},
    author={Megan Molteni},
    organization={Wired},
    year={2018},
    month={6},
    day={26}
}

@online{src,
    title={Facebook Builds Exabyte Data Centers for Cold Storage},
    url={https://www.datacenterknowledge.com/archives/2013/01/18/facebook-builds-new-data-centers-for-cold-storage},
    author={Rich Miller},
    organization={DataCenter Knowledge},
    year={2013},
    month={1},
    day={18}
}

@online{src,
    title={Computer hard drives have shrunk like crazy over the last 60 years — here's a look back},
    url={https://www.businessinsider.fr/us/computer-hard-drives-evolution-2016-10},
    author={Samantha Lee},
    organization={Samantha Lee},
    year={2016},
    month={10},
    day={27}
}
{% endbibtex %}
