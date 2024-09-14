import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import GroqClient from 'groq-sdk';
import { CohereClient } from 'cohere-ai'; // Import Cohere
import pdfParse from 'pdf-parse'; // For parsing PDFs
import fileUpload from 'express-fileupload'; // For handling file uploads
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload()); // Enable file uploads

// Initialize Cohere API
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Initialize Groq client
const groq = new GroqClient({ apiKey: process.env.GROQ_API_KEY });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schema for knowledge base entries
const KnowledgeEntrySchema = new mongoose.Schema({
  chatbotId: String,
  content: String,
  embedding: Object,
  pdfEmbedding: Object,
});

const KnowledgeEntry = mongoose.model('KnowledgeEntry', KnowledgeEntrySchema);

// Define schema for chatbot configurations
const ChatbotConfigSchema = new mongoose.Schema({
  chatbotId: String,
  name: String,
  contextMessage: String,
  temperature: Number,
  primaryColor: String,
  fontFamily: String,
  fontSize: Number,
});

const ChatbotConfig = mongoose.model('ChatbotConfig', ChatbotConfigSchema);

// Cohere embeddings class
class CohereEmbeddings {
  async embedDocuments(documents) {
    const response = await cohere.embed({
      texts: documents,
    });
    return response.embeddings;
  }

  async embedQuery(query) {
    const response = await cohere.embed({
      texts: [query],
    });
    return response.embeddings[0];
  }
}

const getEmbeddings = new CohereEmbeddings();

// Initialize vector store
const vectorStore = new MongoDBAtlasVectorSearch(getEmbeddings, {
  collection: KnowledgeEntry,
  indexName: 'default',
  textKey: 'content',
  embeddingKey: 'embedding',
});

// API endpoint to create a new chatbot configuration
app.post('/api/chatbots', async (req, res) => {
  try {
    const { name, contextMessage, temperature, primaryColor, fontFamily, fontSize } = req.body;
    const chatbotId = new mongoose.Types.ObjectId().toString();
    const config = new ChatbotConfig({ chatbotId, name, contextMessage, temperature, primaryColor, fontFamily, fontSize });
    await config.save();
    res.status(201).json({ chatbotId, message: 'Chatbot configuration created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chatbot configuration', error: error.message });
  }
});

// API endpoint to get all chatbots
app.get('/api/chatbots', async (req, res) => {
  try {
    const chatbots = await ChatbotConfig.find({}, 'chatbotId name');
    res.json(chatbots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chatbots', error: error.message });
  }
});

// API endpoint to get chatbot configuration
app.get('/api/chatbots/:chatbotId/config', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const config = await ChatbotConfig.findOne({ chatbotId });
    if (config) {
      res.json(config);
    } else {
      res.status(404).json({ message: 'Chatbot configuration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chatbot configuration', error: error.message });
  }
});

// API endpoint to add knowledge to a specific chatbot's database
app.post('/api/knowledge', async (req, res) => {
  try {
    const { chatbotId, content } = req.body;
    const pdfData = await pdfParse(req.files.pdf);
    const pdfContent = pdfData.text;

    // Create embeddings for the extracted content
    const pdfEmbedding = await getEmbeddings.embedDocuments([pdfContent]);
    const embedding = await getEmbeddings.embedQuery(content);
    const entry = new KnowledgeEntry({ chatbotId, content, embedding, pdfEmbedding });
    await entry.save();
    res.status(201).json({ message: 'Knowledge added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding knowledge', error: error.message });
  }
});

// API endpoint to add knowledge from a PDF file
// app.post('/api/knowledge/pdf', async (req, res) => {
//   try {
//     const { chatbotId } = req.body;
//     if (!req.files || !req.files.pdf) {
//       return res.status(400).json({ message: 'PDF file is required' });
//     }
//     const pdfData = await pdfParse(req.files.pdf);
//     const content = pdfData.text;

//     // Create embeddings for the extracted content
//     const embedding = await embeddings.embedDocuments([content]);
//     const entry = new KnowledgeEntry({ chatbotId, content, embedding });
//     await entry.save();

//     res.status(201).json({ message: 'Knowledge from PDF added successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding knowledge from PDF', error: error.message });
//   }
// });

// API endpoint for chatbot interaction using Groq
app.post('/api/chat/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { message, previousMessages = [] } = req.body;

    // Retrieve chatbot configuration
    const config = await ChatbotConfig.findOne({ chatbotId });
    if (!config) {
      return res.status(404).json({ message: 'Chatbot configuration not found' });
    }

    // Retrieve relevant information from the knowledge base
    const relevantDocs = await vectorStore.similaritySearch(message, 3, { chatbotId });
    const context = relevantDocs.map(doc => doc.pageContent).join('\n');

    // Prepare messages array for Groq
    const messages = [
      { role: 'system', content: `${config.contextMessage}\nUse the following context to answer the user's question: ${context}` },
      ...previousMessages,
      { role: 'user', content: message }
    ];

    // Generate response using Groq
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'mixtral-8x7b-32768',
      temperature: config.temperature,
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Error processing chat', error: error.message});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
