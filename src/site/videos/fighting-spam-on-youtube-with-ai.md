---
layout: video
collection: videos
title: "Fighting spam on YouTube with AI (TensorFlow + Python)"
videoId: zSEYC3CCA1I
duration: 362
series: Simply explained
date: 2021-06-25
tags: ["AI", "TensorFlow"]
---

I'm sick of crypto-related spam comments on YouTube, so I trained a machine learning model to delete them! A script runs periodically and uses the text classifier to filter the latest comments on my videos.

The filter is surprisingly effective, even though the training dataset is relatively small. I'll keep expanding the dataset and retrain the classifier so it becomes more accurate overtime.


## Source code
Available on GitHub: [https://github.com/Savjee/yt-spam-classifier](https://github.com/Savjee/yt-spam-classifier)