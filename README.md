# firebase-download-image

## This is a firebase function to download an image on a schedule to firebase storage

To get started with the script, first clone the repository and make sure you have the firebase cli installed. 

###### Setup

Run ``` firebase init ``` and if you already have a project select that if not, create one. Once the tool asks you the language, select TypeScript.
I'm not that great with ESLint yet so I haven't enabled it, but feel free to and fix the issues. For the rest of the questions, select no so as to not overwrite
the scripts. At the end make sure the dependencies are installed with NPM and that should be all the setup. 

To deploy just run ``` firebase deploy ``` which will bundle and upload the function to firebase functions. You do need to make sure that the account is set up 
for billing otherwise the function won't deploy. 

###### Settings

You must enable storage on the firebase account and get the bucket name. When looking at the storage page there is a sort of url at the top of the file browser starting with 
gs:// and everything after the slashes is the bucket id. Make sure to put this bucket ID on the mybucket variable in the function so it knows where to store the files.

I'm using this script to download images from the Yosemite webcams to the firebase storage on a 5 minute interval. You can see the interval is set using pubsub.schedule
and to adjust the timing, just change the ``` "every 5 minutes" ``` to whatever schedule you want. 

As for the file image to download, I'm just download an image that updates every 5 minutes so I'm using a static URL specified by the file URL. Once it downloads the image,
it will save the file using the variable called filename which just uses a timestamp and some trailing description and file extension at the end. 

Once everything is set up how you want, just run ```firebase deploy``` to upload it to firebase and the function will run automatically on the set schedule! 

PS: Make sure to add billing alerts so you don't accidentally rack up a large bill. 
