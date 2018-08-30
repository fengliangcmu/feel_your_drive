# Feel Your Drive
OBD systems give the vehicle owner or repair technician access to the status of the various vehicle subsystems.
With an OBD adapter, we can not only collect those data that we can see on the dashboard in our car, but also collect some realtime information which, later on, can be used to analyze a driver's behavior. For example, we can tell how many harsh brakings a drive has made during a trip based on a predefined behavior model.
So my colleague Chao and I created a POC application which connects all the parts together including OBD access, realtime data collecting, data analysis and frontend rendering. The main technical stacks involved were Angularjs, MQTT, SAP HANA in-memeory databse, Spark Streaming, cassandra.
1. simple description regarding architecture: desc.pdf.
2. hardwares used:
    a phone with network access and GPS;
    an OBD adapter with bluetooth connection;
    a car, in our case, it was a mazda3 2008;
    macbook pro for hosting application and video recording.
3. here is the video in gif form, recorded while we were driving:
![video recording of the app](https://github.com/fengliangcmu/feel_your_drive/blob/master/recorded_video.gif)

## Notice:
This repo only contains personal techinical exploration for the frontend. It does not include any final frondend code and backend artifacts that were used in a presentation Chao and I give in DKOM (SAP Developer Conference).


