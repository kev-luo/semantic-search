import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { timeout } from './config';

// fxn for creating pinecone index
export const createPineconeIndex = async (client, indexName, vectorDimension) => {
    // initialize index existence check
    console.log(`Checking "${indexName}"...`);
    // get list of existing indexes that are available
    const existingIndexes = await client.listIndexes();
    // if index doesn't exist, create it
    if (!existingIndexes.includes(indexName)) {
        // log index creation initiation
        console.log(`Creating "${indexName}"...`);
        // create index
        await client.createIndex({
            createRequest: {
                name: indexName,
                dimension: vectorDimension,
                metric: 'cosine'
            }
        });
        // log successful creation
        console.log(`Creating index... please wait for it to finish initializing`);
        // wait for index initialization
        await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
        // log if index already exists
        console.log(`"${indexName}" already exists.`);
    }
}

// fxn for uploading data to the pinecone index
export const updatePinecone = async (client, indexName, docs) => {
    // retrieve pinecone index
    const index = client.Index(indexName);
    // log the retrieved index name
    console.log(`Pinecone index retrieved: ${indexName}`);
    // map over docs 
    for (const doc of docs) {
        // retrieve some doc metadata
        console.log(`Processing document: ${doc.metadata.source}`);
        const txtPath = doc.metadata.source;
        const text = doc.pageContent;
        // create instance of Text Splitter
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });
        console.log("Splitting text into chunks");
        // split text into chunks (documents)
        const chunks = await textSplitter.createDocuments([text]);
        console.log(`Text split into ${chunks.length} chunks`);
        // call openai's embedding endpoint & create openai embeddings for documents
        const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
        );
        // create and upsert vectors in batches of 100
        const batchSize = 100;
        let batch: any = [];
        for (let idx = 0; idx < chunks.length; idx++) {
            const chunk = chunks[idx];
            const vector = {
                id: `${txtPath}_${idx}`,
                values: embeddingsArrays[idx],
                metadata: {
                    ...chunk.metadata,
                    loc: JSON.stringify(chunk.metadata.loc),
                    pageContent: chunk.pageContent,
                    txtPath: txtPath,
                },
            };
            batch = [...batch, vector]
            // when batch is full or it's the last item, upsert the vectors
            if (batch.length === batchSize || idx === chunks.length - 1) {
                await index.upsert({
                    upsertRequest: {
                        vectors: batch,
                    },
                });
                batch = [];
            }
        }
    }
}

// fxn for querying pinecone once we've stored data there
export const queryPineconeVectorStoreAndQueryLLM = async (client, indexName, question) => {
    // retrieve pinecone index

    // create query embedding

    // query pinecone index and return top 10 matches

    // check if there are any matches

        // if there are matches, create an openai instance and load the QAStuffChain

        // extract and concatenate page content from matched documents

        // if there are no matches, do not query gpt-3
}