// scripts/embed.ts
import fs from "fs";
import path from "path";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { Document } from "langchain/document";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const docsPath = path.join(process.cwd(), "public/partners");
const outPath = path.join(process.cwd(), "data", "embeddings.json");

async function main() {
  const files = fs.readdirSync(docsPath).filter(f => f.endsWith(".docx"));
  // const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

  const output: any[] = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(docsPath, file), "utf8"); // convert docx → text first
    // const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
    // const chunks = await splitter.splitDocuments([new Document({ pageContent: text, metadata: { source: file } })]);

    // for (const chunk of chunks) {
    //   const vector = await embeddings.embedQuery(chunk.pageContent);
    //   output.push({ text: chunk.pageContent, vector, source: file });
    // }
  }

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✅ Saved embeddings to ${outPath}`);
}

main();