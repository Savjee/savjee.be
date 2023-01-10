---
layout: post
title: "Filtering spam on YouTube with TensorFlow & AI"
quote: 
tags: [TensorFlow, AI, YouTube channel]
upload_directory: /uploads/2021-07-06-filtering-spam-on-youtube-with-tensorflow-and-ai/
thumbnail: /uploads/2021-07-06-filtering-spam-on-youtube-with-tensorflow-and-ai/humb_timeline.jpg
toc_enabled: true
---

My YouTube channel has been attracting a lot of spammers. They try to trick people by saying they know how to profit from trading cryptocurrencies or that they can recover lost wallet keys.

I've been marking these comments as spam, thinking that YouTube would learn to recognize them, but that doesn't help. Time to take matters into my own hands and build a spam filter with TensorFlow!

<!--more-->

<small><em>Don't want to read this post? Watch the video:</small></em>
{% include "youtube-embed.html", videoId:"zSEYC3CCA1I" %}

## The plan
The idea is simple: use the YouTube Data API to fetch the latest comments and run them through a text classifier trained to recognize spam. Then, if it's confident enough that a comment is spam, use another YouTube API to flag and delete it!

![The plan to beat spam!](/uploads/2021-07-06-filtering-spam-on-youtube-with-tensorflow-and-ai/yt-spam-comments.svg)
*The plan to beat spam!*

## Fetching comments
Machine learning requires a lot of training data, so I started writing a script to fetch comments and store them in a Google Sheet. For that, I'm using the [YouTube Data API](https://developers.google.com/youtube/v3) and [a service account](https://support.google.com/a/answer/7378726?hl=en) to interact with Google Sheets.

I initially used a CSV file, but those can be a pain to work with. So instead, I switched to Google Sheets. Not only could I store comments in there, but I could also tag them for training and keep track of how well the model performed—effectively using Google Sheets as a mini database.

To make dealing with comments easier, I created a `Comment` class that takes the [output of the CommentThreads API](https://developers.google.com/youtube/v3/docs/commentThreads#resource) and extracts the comment itself, publish date, author name, and like count.

```py
class Comment():
    def __init__(self, ytObj):
        rootObj = None

        if "topLevelComment" in ytObj["snippet"]:
            rootObj = ytObj["snippet"]["topLevelComment"]
        else:
            rootObj = ytObj

        self.id = rootObj["id"]
        self.publishedAt = rootObj["snippet"]["publishedAt"]
        self.textOriginal = rootObj["snippet"]["textOriginal"]
        self.authorName = rootObj["snippet"]["authorDisplayName"]
        self.likeCount = rootObj["snippet"]["likeCount"]
```

Then I wrote a `CommentHelper` class that could carry out the requests to YouTube (fetching comments & marking them as spam):

```py
CHANNEL_ID = "..."
API_KEY = "..."

class CommentHelper():
    def __init__(self):
        self.authenticate()
		  
    def authenticate(self):
        self.yt = googleapiclient.discovery.build("youtube", "v3", developerKey = API_KEY)
        # ...

    def fetch(self, next_page_token = None, moderation_status="published"):
        req = self.yt.commentThreads().list(
            part = "snippet,replies",
            maxResults = 100,
            pageToken = next_page_token,
            allThreadsRelatedToChannelId=CHANNEL_ID,
            moderationStatus=moderation_status,
            order="time"
        )
    
        res = req.execute()

        # Parse the comments into Comment objects
        comms = []
        for c in res["items"]:
            comms.append(Comment(c))
            if "replies" in c:
                comms.extend(list(map(lambda com: Comment(com), c["replies"]["comments"])))

        return (comms, res["nextPageToken"])

    def markAsSpam(self, commentIds: List[str]):
        comIds = ",".join(commentIds)
        
		  req = self.yt.comments().markAsSpam(
                id = comIds
        )
        req.execute()
        
        req2 = self.yt.comments().setModerationStatus(
                id=comIds,
                moderationStatus="heldForReview"
        )
        req2.execute()
```

With the helper in place, I could work on storing the fetched comments in a Google Sheet. For that, I used the excellent [gspread library](https://docs.gspread.org/).

```py
import sys
import time
import datetime
import gspread
import itertools
from helpers import CommentHelper

gc = gspread.service_account(filename=cred_path + "/yt-spam-filter-013e7aa5ffc1.json")
sh = gc.open_by_key("1QEQrLne1SDxwQVl5qpGQokEKG4FNZqX6kMuFMmAyeWg")
worksheet = sh.get_worksheet(0)

print("Fetching latest comments")
ch = CommentHelper.CommentHelper()
ch.authenticate()

nextPageToken = None

while True:
    (comments, nextPageToken) = ch.fetch(next_page_token = nextPageToken)

    # Add comments to Google Sheet
    worksheet.append_rows(
        list(map(lambda c: [
            c[0].id, 
            c[0].publishedAt, 
            c[0].textOriginal, 
            c[0].authorName, 
            c[0].likeCount, 
        ], allComs))
    )

    if nextPageToken is None:
        break
    
    time.sleep(0.25)
```

After letting this script for a few minutes, I had over 16,000 comments stored in my Google Sheet. I then manually tagged about 1,000 of them as spam (1) or not spam (0).

![Tagging comments in Google Sheets. Spam comments are marked with 1, non-spam with 0.](/uploads/2021-07-06-filtering-spam-on-youtube-with-tensorflow-and-ai/spam-comments-in-google-sheets.png)
*Tagging comments in Google Sheets. Spam comments are marked with 1, non-spam with 0.*

With the tagging done, I had a small dataset that could train a text classifier.

## Prepping the data
To work on the spam classifier, I created a Jupyter notebook. I started by downloading the dataset from Google Sheets with gspread. Then, I removed comments that haven't been tagged, as well as duplicates.

```py
import gspread
import pandas as pd

gc = gspread.service_account(filename="yt-spam-filter-013e7aa5ffc1.json")
sh = gc.open_by_key("1QEQrLne1SDxwQVl5qpGQokEKG4FNZqX6kMuFMmAyeWg")
worksheet = sh.get_worksheet(0)

# Load the worksheet in a Panda DataFrame
df = pd.DataFrame(worksheet.get_all_records())
df = df[["Comment", "Spam"]]

# Make sure that comments are parsed as strings
df['Comment'] = df['Comment'].astype(str)

# Remove all duplicate comments and comments that have not been tagged
nan_value = float("NaN")
df = df.replace("", nan_value).dropna().drop_duplicates()
```

Finally, I split the dataset into a training and testing group:

```py
from sklearn.model_selection import train_test_split

X = df['Comment'].values
y = df['Spam'].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
```

In this case, 80% of the dataset will be used to train the classifier, while 20% will be used to test the trained model.

## Build & train the model
At this point, I had everything to train the classifier. Instead of creating my own TensorFlow model, I went with a pre-trained text embedding model from Google ([nnlm-en-dim50](https://tfhub.dev/google/nnlm-en-dim50/2)). Embedding means normalizing input text (in this case comments) and converting it into a format that can be fed to the neural network.

```py
import tensorflow as tf
import tensorflow_hub as hub
from tensorflow.keras.callbacks import EarlyStopping

model = "https://tfhub.dev/google/nnlm-en-dim50/2"
hub_layer = hub.KerasLayer(model, input_shape=[], dtype=tf.string, trainable=True)

model = tf.keras.Sequential()
model.add(hub_layer)
model.add(tf.keras.layers.Dense(16, activation='relu'))
model.add(tf.keras.layers.Dense(1, activation='sigmoid'))

print(model.summary())
```

Summary of the model:

```
Model: "sequential"
_________________________________________________________________
Layer (type)                 Output Shape              Param #   
=================================================================
keras_layer (KerasLayer)     (None, 50)                48190600  
_________________________________________________________________
dense (Dense)                (None, 16)                816       
_________________________________________________________________
dense_1 (Dense)              (None, 1)                 17        
=================================================================
Total params: 48,191,433
Trainable params: 48,191,433
Non-trainable params: 0
_________________________________________________________________
None
```

Now I could start the training process by passing along my training and testing data:

```py
early_stop = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=10)

model.compile(optimizer='rmsprop', loss='binary_crossentropy', metrics=['accuracy'])

model.fit(
    X_train,
    y_train,
    epochs=40,
    batch_size=512,
    validation_data=(X_test, y_test),
    verbose=1,
    callbacks=[early_stop]
)
```

The training took less than a minute, and TensorFlow reported an accuracy of over 90%.

## Testing the model
Time to take my classifier for a test drive. I took a posted spam comment that wasn't in the dataset and ran it through the model:

```py
spamTest = "I’m so happy I met RM_KESH01 on Insta he help me recover my lost Erc20 sent to a wrong network I’m so happy because his trusted and reliableThis is wonderful and unbelievable just got my Bitcoin account back through Doavercracks on ig thanks a lot really appreciate it."

classification = model_prod.predict([spamTest])
```

The output was `0.998727` meaning the model was very confident that this comment was spam.

I also tried writing my own spam comment to trick the AI, but it was still 65% sure that it was spam. 

```
Xavier is wonderful, I traded with him and made huge profits
```

I was amazed at how well this model performed, given such a small dataset. The dataset wasn't even properly balanced as I tagged more comments as not spam than spam (70 / 30%).

## Deploy
The final step in this process was to deploy the trained model to a server. I want the comments to be filtered every half-hour or so.

First, I exported the trained model to an HDF5 (.h5) file:

```py
model.save("trained-model.h5")
```

Then I rewrote the first script. It now loads the trained model, fetches the latest comments, and runs them through the model. If the model is at least 80% that the comment is spam, I flag and delete them with the YouTube API:

```py
import sys
import tensorflow as tf
import tensorflow_hub as hub
import time
import datetime
import gspread
import itertools
from helpers import CommentHelper

# Open Google Sheet and fetch IDs of previously processed comments
gc = gspread.service_account(filename="yt-spam-filter-013e7aa5ffc1.json")
sh = gc.open_by_key("1QEQrLne1SDxwQVl5qpGQokEKG4FNZqX6kMuFMmAyeWg")
worksheet = sh.get_worksheet(0)
commentsInSheet = worksheet.get("A:A")
commentsInSheet = list(itertools.chain.from_iterable(commentsInSheet))

# Load the trained model
model = tf.keras.models.load_model('./trained-model.h5', custom_objects={'KerasLayer':hub.KerasLayer})

# I only want to download comments from the last 7 days
today = datetime.datetime.now()
timespan = datetime.timedelta(days = 7)
mindate = (today - timespan).isoformat()

loop = True
nextPageToken = None

while loop:
    (comments, nextPageToken) = ch.fetch(next_page_token = nextPageToken)
	  spam = [] # Array to store spam comments
    allComms = []

    for com in comments:
        res = float(model.predict([com.textOriginal]))

		  # Confidence level >80% -> Mark as spam
        if res > 0.8:
            spam.append(com.id)

	  # Add the comments + inference result to the Google Sheet
    worksheet.append_rows(
        list(map(lambda c: [
            c[0].id, 
            c[0].publishedAt, 
            c[0].textOriginal, 
            c[0].authorName, 
            c[0].likeCount, 
            "", # Manual spam rating
            c[1] # Inference result
        ], allComs))
    )


    # Report all spam comments in 1 go
    if len(spam) > 0:
        print("Have %d comments, reporting as spam" % (len(spam)))
        ch.markAsSpam(spam)

    if nextPageToken is None:
        break
    
    time.sleep(0.25)  # Wait a bit before making another request
```

And that's it! I deployed it inside an LXC container on my home server, using crontab to trigger the script every half hour.

## Conclusion
I'm happy with how this turned out. It's been running for about a week, and it has processed 186 comments. 94 of these have been correctly identified as spam and have automatically been removed. 

I'm somewhat surprised by those numbers. It means that half the comments posted on my videos are spam. On the flip side: it's only been running for a few days, so the spam ratio might not be this intense all the time.

I'm now seeing more channels &mdash; such as [Graham Stephen](https://www.youtube.com/watch?v=lU1qpBwQFmc) &mdash; that suffer from high levels of spam comments. I've reached out to a few to offer help and retrain my classifier based on their spam comments. We'll see how that turns out!

## Source code
This blog post only contains snippets of code. The entire codebase &mdash; including my initial tests with Apple's CoreML &mdash; is available on GitHub: [https://github.com/Savjee/yt-spam-classifier](https://github.com/Savjee/yt-spam-classifier)

Feel free to fork it, use it yourself, improve it, and open up pull requests. But remember that this is my first substantial Python project, so be gentle ;)