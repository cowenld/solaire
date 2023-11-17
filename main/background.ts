import path from "path";
import { app, ipcMain, desktopCapturer, ipcRenderer } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { chatPost } from "./helpers/chat";
import fs from "fs";
import os from "os";
import config from "dotenv";
import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import mappedLinesJson from "./mappedLines.json";

// Extra
import { Message } from "ai/react";
import { useChat } from "ai/react";
import { ChatRequest, FunctionCallHandler, nanoid } from "ai";

config.config();
const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isProd = process.env.NODE_ENV === "production";
let mainWindow = null;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});

// New shit
function formatDate(date, format) {
  const map = {
    mm: date.getMonth() + 1,
    dd: date.getDate(),
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear(),
  };

  return format.replace(/mm|dd|yy|yyy/gi, (matched) => map[matched]);
}

function pad0(value, count) {
  var result = value.toString();
  while (result.length < count) result = "0" + result;
  return result;
}

function fileSafeDateTime(date) {
  return `${formatDate(date, "yyyy-mm-dd")}_${pad0(
    date.getHours() + "",
    2
  )}-${pad0(date.getMinutes() + "", 2)}-${pad0(
    date.getSeconds() + "",
    2
  )}-${pad0(date.getMilliseconds() + "", 3)}`;
}

const dir = path.join(os.homedir(), "Documents/translator/screenshots");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

ipcMain.on("screenshot", async (event, arg) => {
  // event.reply("message", `${arg} World!`);
  desktopCapturer
    .getSources({
      types: ["window", "screen"],
      thumbnailSize: {
        height: 1440,
        width: 2560,
      },
    })
    .then(async (sources) => {
      for (const source of sources) {
        if (source.name === "Screenshot 2023-11-14 at 10.02.01") {
          // This isn't robust, how the fuck do i find out the name of the game etc

          // BELOW WORKS WELL
          const startTime = performance.now();
          const date = new Date();
          const screenshotPath = path.join(
            dir,
            `screenshot_${fileSafeDateTime(date)}.png`
          );
          const content = source.thumbnail.toJPEG(80);

          const detectDocumentTextCommand = new DetectDocumentTextCommand({
            Document: {
              Bytes: content,
            },
          });

          const { Blocks } = await textractClient.send(
            detectDocumentTextCommand
          );
          console.log("Blocks", Blocks);

          const lines = Blocks.filter((block) => block.BlockType === "LINE");

          const mappedLines = lines.map((line) => {
            return {
              Confidence: line.Confidence,
              Text: line.Text,
              BoundingBox: line.Geometry.BoundingBox,
            };
          });
          console.log("mappedLines", mappedLines);

          // ABOVE WORKS GREAT

          // const mappedLines = mappedLinesJson;
          // console.log("mappedLines", mappedLines);

          // const functionCallHandler: FunctionCallHandler = async (
          //   chatMessages,
          //   functionCall
          // ) => {
          //   const functionResponse = {
          //     messages: [
          //       ...chatMessages,
          //       {
          //         id: nanoid(),
          //         name: "get_text_to_translate",
          //         role: "function" as const,
          //         content: prompt,
          //       },
          //     ],
          //   };
          //   return functionResponse;
          // };

          // -----------------------------------------------
          const response = await chatPost(mappedLines);
          response
            .text()
            .then((data) => {
              console.log(data);
              // If the data is not what we normally expect FREAK OUT
              mainWindow.webContents.send("data", data);
            })
            .catch((error) => {
              console.error(error);
            });
          const endTime = performance.now();

          console.log(
            `Call to doSomething took ${endTime - startTime} milliseconds`
          );

          // ------------------------------------------------------
          // Takes roughly 1.6seconds

          // const textractResult = await textRactClient
          //   .startDocumentTextDetection(textractParams)
          //   .promise();

          // fs.writeFile(
          //   screenshotPath.toString(),
          //   content,
          //   "base64",
          //   function (err) {
          //     if (err) throw err;
          //     console.log("Saved!");
          //   }
          // );
          return;
        }
      }
    });
});
