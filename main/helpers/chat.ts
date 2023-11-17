import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from "ai";
import OpenAI from "openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
import config from "dotenv";

config.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

// const functions: ChatCompletionCreateParams.Function[] = [
//   {
//     name: "get_text_to_translate",
//     description: "Get the translations of some text",
//     parameters: {
//       type: "object",
//       properties: {
//         format: {
//           type: "string",
//           description: "Objects to be translated.",
//         },
//       },
//       required: ["text"],
//     },
//   },
// ];

export async function chatPost(mappedLines: any) {
  const prompt = `Utilizing the provided JSON object below the -------, which contains text elements with associated bounding box information ('Confidence,' 'Text,' 'BoundingBox' with 'Height,' 'Left,' 'Top,' and 'Width' properties), perform the following tasks:

  Group the text elements based on their proximity using the 'Left' and 'Top' values in the 'BoundingBox' property. Define a reasonable proximity threshold to consider elements as part of the same group.
  
  As you group elements, evaluate the coherence of the 'Text' within each group. If the text within a group does not form a coherent English sentence, refrain from placing it within the same group.
  
  For each coherent group that forms a coherent English sentence, extract the 'Text' property of the elements and concatenate them to form a single string.

  Ensure that the grouping is done in a way that not only considers proximity but also ensures the coherence of the text within each group, allowing only coherent English sentences to be formed. Adjust the proximity threshold as needed for optimal results.
  
  Provide the resulting strings for each coherent group in the form of a JSON array, where each group is explicitly defined by a key with the title of text. Only include groups that form coherent English sentences.

  Included in the object, should also be a translation property, where a spanish translation of the string will be included. This should be both grammitically and linguistic correct as possible for spanish, it will be the next property in the object with a title of translation.

  The output should look like ---
  '{
    "groups": [
      {
        "text": "*The text*",
        "translation": "*The translation*"
      }
    ]
  }'
  -------
  ${JSON.stringify(mappedLines)}
  `;
  console.log("prompt", prompt);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    stream: true,
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    // functions,
  });

  const data = new experimental_StreamData();
  const stream = OpenAIStream(response);

  // {
  //   experimental_onsaFunctionCall: async (
  //     { name, arguments: args },
  //     createFunctionCallMessages
  //   ) => {
  //     console.log("args", name, args);
  //     const newMessages = createFunctionCallMessages(JSON.parse(args));
  //     return openai.chat.completions.create({
  //       messages: [...messages, ...newMessages],
  //       stream: true,
  //       model: "gpt-3.5-turbo-0613",
  //     });
  //   },
  //   onCompletion(completion) {
  //     console.log("completion", completion);
  //   },
  //   onFinal(completion) {
  //     data.close();
  //   },
  //   experimental_streamData: true,
  // }

  return new StreamingTextResponse(stream);
}
