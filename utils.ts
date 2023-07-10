import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { timeout } from './config';

// fxn for querying pinecone once we've stored data there

// fxn for creating pinecone index
export const createPineConeIndex = async (client, indexName, vectorDimension) => {
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