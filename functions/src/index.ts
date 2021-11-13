import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const request = require("request");
const fs = require("fs");
const os = require("os");

admin.initializeApp();


export const downloadImageEveryMin = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async (context) => {
        var filename = `/${Date.now()}_ahwanee2.jpg`;

        function download(uri: any, filename: any, callback: any) {
            return new Promise(function (resolve, reject) {
                request.head(uri, async function (
                    _err: any,
                    res: { statusCode: number; },
                    _body: any
                ) {
                    if (res.statusCode == 200) {
                        request(uri)
                            .pipe(fs.createWriteStream(os.tmpdir() + filename))
                            .on("close", () => {
                                resolve('os.tmpdir() + filename');
                            });
                    } else {
                        reject('error downloading file');
                    }
                });
            });
        };
        async function uploadFile(fileLocation: string) {
            console.log(fileLocation)
            await admin
                .storage()
                .bucket("fir-functions-ac6ec.appspot.com")
                .upload(fileLocation, { destination: `ahwanee2${filename}` });
            return "uploaded";
        }
        try {
            await download(
                "https://pixelcaster.com/yosemite/webcams/ahwahnee2.jpg",
                filename,
                async function () {
                    console.log("done");
                }
            );
            return await uploadFile(os.tmpdir() + filename);

        } catch (e) {
            console.log(e);
            return null;

        }

    });
