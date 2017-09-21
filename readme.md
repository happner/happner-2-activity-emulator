happner-2-activity-emulator
---------------------------

quickstart:
----------

```bash

git clone https://github.com/happner/happner-2-activity-emulator

cd happner-2-activity-emulator

npm install

# start running, 1000 events per second
node server/start 1000

# 2 stop, press 's' and enter

# start running, 1000 events per second
node server/start 1000

? started, type s to stop OUTPUT:::PUSHING RANDOM::: /random/event/5 event no: 100

OUTPUT:::PUSHING RANDOM::: /random/event/7 event no: 200

OUTPUT:::PUSHING RANDOM::: /random/event/2 event no: 300

OUTPUT:::PUSHING RANDOM::: /random/event/1 event no: 400

...

# you then type 's' and enter, and get a report, should be no invalid items (empty array)

report::: {
  "started": 1506017758826,
  "errored": false,
  "valid": [
    {
      "clientEvents": {
        "1": 136,
        "2": 123,
        "3": 141,
        "4": 144,
        "5": 108,
        "6": 119,
        "7": 129,
        "8": 119,
        "9": 125
      },
      "serverEvents": {
        "1": 136,
        "2": 123,
        "3": 141,
        "4": 144,
        "5": 108,
        "6": 119,
        "7": 129,
        "8": 119,
        "9": 125
      }
    }
  ],
  "invalid": [],
  "ended": 1506017763385
}


```

other options:
```bash

# take note: options must be in order
# [eventCount, meshCount, messages per output, silent]

# start running, 1000 events per second, 2 meshes NB - multiple meshes untested
node server/start 1000 2

# start running, 1000 events per second, 1 mesh, report output every 50 events
node server/start 1000 2 50

# start running, 1000 events per second, 1 mesh, report output every 50 events, silently
node server/start 1000 2 50 true

```