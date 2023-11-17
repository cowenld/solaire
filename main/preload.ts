import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  desktopCapturer,
} from "electron";

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;

// new code below
// ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
//   console.log("setSource");
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: false,
//       video: {
//         chromeMediaSource: "desktop",
//         chromeMediaSourceId: sourceId,
//         minWidth: 1280,
//         maxWidth: 1280,
//         minHeight: 720,
//         maxHeight: 720,
//       },
//     });
//     handleStream(stream);
//   } catch (e) {
//     handleError(e);
//   }
// });

// function handleStream(stream) {
//   const video = document.querySelector("video");
//   video.srcObject = stream;
//   video.onloadedmetadata = (e) => video.play();
// }

// function handleError(e) {
//   console.log(e);
// }
