import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const request = require("request");
const fs = require("fs");
const os = require("os");
const { createCanvas, loadImage } = require('canvas')
admin.initializeApp();

var mybucket = 'fir-functions-ac6ec.appspot.com';
var fileURL = "https://pixelcaster.com/yosemite/webcams/ahwahnee2.jpg";
var bucketFolderName = 'ahwanee2';
var gifFolderName = 'animations';

export const generateGIF = functions.runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 120,
    memory: "512MB",
}).pubsub
    .schedule("every 1 hours")
    .onRun(async (context) => {
        const GIFEncoder = require('gifencoder');
        var dir = os.tmpdir() + '/' + bucketFolderName;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }


        async function asyncForEach(array: string | any[], callback: { (num: any): Promise<void>; (arg0: any, arg1: number, arg2: any): any; }) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        }

        var [files] = await admin.storage().bucket(mybucket).getFiles();
        await asyncForEach(files, async (file: any) => {
            if (file.name.startsWith('ahwanee2/')) {
                let destFilename = os.tmpdir() + '/' + file.name;
                const options = {
                    // The path to which the file should be downloaded, e.g. "./file.txt"
                    destination: destFilename //destFilename,
                };
                try {
                    await admin.storage().bucket(mybucket).file(file.name).download(options);

                } catch (e) {
                    console.log(e);
                }
            }
        })

        const encoder = new GIFEncoder(640, 480);
        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
        encoder.setDelay(100);  // frame delay in ms
        encoder.setQuality(5); // image quality. 10 is default.

        // use node-canvas
        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');

        // red rectangle


        await fs.readdir(dir, async (err: any, files: any[]) => {
            await asyncForEach(files, async (file: any) => {
                if (file.split('.').pop() == 'jpg') {
                    var image = await loadImage(dir + '/' + file);
                    ctx.drawImage(image, 0, 0, 640, 480)
                    encoder.addFrame(ctx);
                }
            });
            encoder.finish();
            const buf = encoder.out.getData();
            await fs.writeFile(dir + '/ahwanee2.gif', buf, function (err: any) {
                // animated GIF written to myanimated.gif
            });
            await admin
                .storage()
                .bucket(mybucket)
                .upload(dir + '/ahwanee2.gif', { destination: `${gifFolderName}/ahwanee2.gif` });
            deleteFolderRecursive(os.tmpdir() + '/' + bucketFolderName);
            // fs.unlink()
            return null;

        });


    })

export const downloadImageEveryMin = functions.pubsub
    .schedule("every 10 minutes")
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
                .bucket(mybucket)
                .upload(fileLocation, { destination: `${bucketFolderName}${filename}` });
            return "uploaded";
        }
        try {
            await download(
                fileURL,
                filename,
                async function () {
                    console.log("done");
                }
            );
            await uploadFile(os.tmpdir() + filename);
            return await fs.unlink(os.tmpdir() + filename, (err: any) => {
                if (err) {
                    console.log(err)
                    return;
                }
            })

        } catch (e) {
            console.log(e);
            return null;

        }

    });

var deleteFolderRecursive = function (path: string) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file: string) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
