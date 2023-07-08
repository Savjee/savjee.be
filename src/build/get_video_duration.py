import re
import glob
import subprocess

regexVideoId = r"^videoId:\s?(.*)$"
regexDuration = r"^duration:\s?\d*"

for name in glob.glob("src/site/courses/**/*.md"):
    with open(name, "r+") as file:
        contents_full = file.read()
        contents = contents_full.split("\n")
        output = []
        foundVideoId = False

        if re.search(regexDuration, contents_full, re.MULTILINE) is not None:
            print("File already has duration")
            continue

        for line in contents:
            output.append(line)
            matches = re.search(regexVideoId, line, re.MULTILINE | re.IGNORECASE)

            if line.startswith("duration: "):
                foundDuration = True
                break

            if matches is None:
                continue

            foundVideoId = True
            videoId = matches.group(1)

            print(f"Getting duration for {videoId}")
            ytDlp = subprocess.run(["yt-dlp", "--get-duration", f"https://youtube.com/watch?v={videoId}"], capture_output=True)
            duration_str = ytDlp.stdout.decode("utf-8")

            timeParts = duration_str.split(":")
            seconds = int(timeParts[0])*60 + int(timeParts[1])
            print(f"Duration {duration_str} -> {seconds}")

            output.append(f"duration: {seconds}")

        if foundVideoId == False:
            print(f"Could not find videoId in file {name}")
            continue
        
        newContent = "\n".join(output)
        file.seek(0)
        file.truncate()
        file.write(newContent)
