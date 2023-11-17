import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import OnlineStatus from "../utils/online-status";

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Translator</title>
      </Head>
      <div className="flex flex-col text-2xl w-full text-center h-screen justify-center items-center">
        <div>
          <Image
            className="ml-auto mr-auto"
            src="/images/solaire.png"
            alt="Logo image"
            width="256"
            height="256"
          />
        </div>
        <h1 className="w-full flex-wrap flex justify-center">
          <OnlineStatus>
            <div className="mt-1 w-full flex-wrap flex justify-center">
              <Link
                href="/next"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <span>Next Page</span>
              </Link>
            </div>
          </OnlineStatus>
        </h1>
      </div>
    </React.Fragment>
  );
}
