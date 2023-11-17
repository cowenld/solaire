import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Background from "@/renderer/components/background";

export default function NextPage() {
  const [text, setText] = useState([]);
  const takeScreenshot = () => {
    const region = { x: 0, y: 0, width: 800, height: 600 }; // Adjust these values as needed
    window.ipc.send("screenshot", region); // include a null check here
  };

  useEffect(() => {
    window.ipc.on("data", (data: any) => {
      const parsedData = JSON.parse(data);
      setText(parsedData.groups);
    });
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Translator</title>
      </Head>
      <div className="relative isolate bg-gray-900 min-h-screen pt-8">
        <Background />
        <div className="flex w-full justify-center items-center">
          <button
            onClick={takeScreenshot}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <svg
              className="fill-current w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
            <span>Screenshot</span>
          </button>
        </div>
        <div>
          {text?.map((item) => {
            return (
              <>
                <p>{item.text}</p>
                <p>{item.translation}</p>
              </>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
