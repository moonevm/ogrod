import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env["OPENAI"], // This is the default and can be omitted
});