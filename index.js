const express = require("express");
const Websocket = require("ws");
const http = require("http");

// const webserver = express()
//     .use((req, res) =>
//         res.send('response')
//     )
//     .listen(5000, () => console.log(`Listening on ${5000}`))

const app = express();
const server = http.createServer(app);

const socket = new Websocket.Server({server});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
});

socket.on("connection", (ws, req) => {
    // let match;
    // if (!(match = req.url.match(/^\/rtmp\/(.*)$/))) {
    //   ws.terminate();
    //   return;
    // }

    const rtmpUrl = decodeURIComponent(req.url);

    console.log("Target RTMP URL:", rtmpUrl);

    console.log("New client connected!");

    ws.send("connection established");

    ws.on("close", () => console.log("Client has disconnected!"));

    const ffmpeg = child_process.spawn("ffmpeg", [
        "-f",
        "lavfi",
        "-i",
        "anullsrc",

        "-i",
        "-",

        "-shortest",

        "-vcodec",
        "copy",

        "-acodec",
        "aac",

        "-f",
        "flv",

        rtmpUrl,
    ]);

    ffmpeg.on("close", (code, signal) => {
        console.log(
            "FFmpeg child process closed, code " + code + ", signal " + signal
        );
        ws.terminate();
    });

    ffmpeg.stdin.on("error", (e) => {
        console.log("FFmpeg STDIN Error", e);
    });

    ffmpeg.stderr.on("data", (data) => {
        console.log("FFmpeg STDERR:", data.toString());
    });

    ws.on("message", (data) => {
        ffmpeg.stdin.write(data);
    });

    ws.on("close", (e) => {
        ffmpeg.kill("SIGINT");
    });

    ws.onerror = function () {
        console.log("websocket error");
    };
});

server.listen(8000, () => {
    console.log("Server is running on port 8000");
});
