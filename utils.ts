import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { timeout } from './config';

// fxn for querying pinecone once we've stored data there

// fxn for creating pinecone index

// fxn for uploading data to the pinecone index