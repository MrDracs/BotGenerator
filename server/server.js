import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import GroqClient from 'groq-sdk';
import { CohereClient } from 'cohere-ai'; // Import Cohere
import pdfParse from 'pdf-parse'; // For parsing PDFs
import fileUpload from 'express-fileupload'; // For handling file uploads
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

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
mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Error connecting to MongoDB:', error);
});

// Define schema for knowledge base entries
const KnowledgeEntrySchema = new mongoose.Schema({
  chatbotId: String,
  content: String,
  embedding: Object,
  pdfEmbedding: Object,
  pdfContent: String,
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
  conversations : [String],

});
const ChatbotConfig = mongoose.model('ChatbotConfig', ChatbotConfigSchema);

// Define schema for ticket management
const TicketSchema = new mongoose.Schema({
  ticketFlag: { type: String, enum: ['None', 'Complaint', 'Refund/Return', 'Feedback'], default: 'None' },

  logs: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true }, // either 'user' or 'assistant'
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.model('Ticket', TicketSchema);

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

// // Initialize vector store
// const vectorStore = new MongoDBAtlasVectorSearch(getEmbeddings, {
//   collection: KnowledgeEntry,
//   indexName: 'default',
//   textKey: 'content',
//   embeddingKey: 'embedding',
// });

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
    const pdfFile = req.files?.pdf;
    
    let pdfContent = '';
    if (pdfFile) {
      const pdfData = await pdfParse(pdfFile.data);
      pdfContent = pdfData.text;

      // Create embeddings for the extracted PDF content
      const pdfEmbedding = await getEmbeddings.embedDocuments([pdfContent]);
      console.log('PDF Embedding:', pdfEmbedding);

      // Save the new knowledge entry to the database
      const entry = new KnowledgeEntry({ chatbotId, content, embedding: await getEmbeddings.embedQuery(content), pdfEmbedding, pdfContent });
      await entry.save();

      res.status(201).json({ message: 'Knowledge added successfully' });
    } else {
      // Handle cases where PDF is not provided
      res.status(400).json({ message: 'PDF file is required' });
    }
  } catch (error) {
    console.error('Error adding knowledge:', error);
    res.status(500).json({ message: 'Error adding knowledge', error: error.message });
  }
});

// Cosine Similarity Calculation Function
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) {
    console.error('One or both vectors are undefined.');
    return 0; // Return 0 similarity if vectors are not defined
  }

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getEmbeddingToUse(document) {
  return [document.pdfEmbedding.flat()];
}

// Wrapper function to perform similarity search
async function similaritySearchWrapper(query, limit, options) {
  try {
    const queryEmbedding = await getEmbeddings.embedQuery(query);
    console.log('Query Embedding:', queryEmbedding);

    const knowledgeEntries = await KnowledgeEntry.find(options);

    const results = knowledgeEntries
      .map(entry => {
        const embeddingsToUse = getEmbeddingToUse(entry);

        if (!embeddingsToUse || embeddingsToUse.length === 0) {
          console.warn('No valid embedding found for entry:', entry._id);
          return null;
        }
        const similarities = embeddingsToUse.map(embedding => cosineSimilarity(queryEmbedding, embedding));
        const maxSimilarity = Math.max(...similarities);

        return { entry, similarity: maxSimilarity };
      })
      .filter(result => result !== null);

    results.sort((a, b) => b.similarity - a.similarity);

    console.log('Similarity Results:', results.slice(0, limit));
    return results.slice(0, limit).map(result => result.entry);
  } catch (error) {
    console.error('Error during similarity search:', error);
    throw error;
  }
}

// API endpoint to delete a chatbot and its knowledge
app.delete('/api/chat/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;

    // Delete the chatbot configuration
    const configDeletionResult = await ChatbotConfig.deleteOne({ chatbotId });
    if (configDeletionResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Chatbot configuration not found' });
    }

    // Delete associated knowledge entries
    await KnowledgeEntry.deleteMany({ chatbotId });

    res.status(200).json({ message: 'Chatbot and associated knowledge entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    res.status(500).json({ message: 'Error deleting chatbot', error: error.message });
  }
});
app.post('/api/chat/:chatbotId', async (req, res) => {
  try {
    let ticId = null;  // Initialize ticId here
    const { chatbotId } = req.params;
    const { message, previousMessages = [] } = req.body;

    // Find chatbot configuration
    const config = await ChatbotConfig.findOne({ chatbotId });
    if (!config) {
      return res.status(404).json({ message: 'Chatbot configuration not found' });
    }

    // Fetch relevant documents based on the message for context
    const relevantDocs = await similaritySearchWrapper(message, 3, { chatbotId });
    const pdfContext = relevantDocs.map(doc => doc.pdfContent).join('\n');
    const context = relevantDocs.map(doc => doc.content).concat(pdfContext).join('\n');

    // Create the conversation context for the chatbot
    const messages = [
      {
        role: 'system',
        content: `DO NOT ANSWER IF THE MESSAGE IS OUT OF CONTEXT DEFINED, NOT EVEN MINOR HELP. Do NOT ANSWER Anything unrelated to the purpose of the conversation, just deny the existence of anything outside your context and use case. ${config.contextMessage}\nUse only the following context to answer the user's question: ${context}`
      },
      ...previousMessages,
      { role: 'user', content: message },
    ];

    // Get chatbot response
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: config.temperature,
    });

    const responseText = completion.choices[0].message.content;

    // Split the response into parts for better formatting
    const responseParts = responseText.split('\n').map(part => ({
      language: 'english',
      text: part.trim(),
      emotion: 'neutral',
    })).filter(part => part.text);

    // Ticket management logic
    let ticketFlag = 'None'; // Default ticket flag
    let ticketMessage = null; // Default ticket message

    // Check if the user message contains any ticket-related keywords
    if (message.toLowerCase().includes('complaint')) {
      ticketFlag = 'Complaint';
    } else if (message.toLowerCase().includes('refund') || message.toLowerCase().includes('return')) {
      ticketFlag = 'Refund/Return';
    } else if (message.toLowerCase().includes('feedback')) {
      ticketFlag = 'Feedback';
    }

    // If a ticket flag is set, create a new ticket in the backend
    if (ticketFlag !== 'None') {
      const msg = previousMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const newTicket = new Ticket({
        ticketFlag,
        logs: [...msg],
      });
      ticketMessage = `A new ticket has been created for your ${ticketFlag.toLowerCase()}. Our support team will reach out to you shortly.`;

      newTicket.logs.push({ role: 'assistant', content: ticketMessage });

      const tic = await newTicket.save();
      ticId = tic._id; // Assign the saved ticket's ID to ticId
    }

    // Update the chatbot configuration with the new conversation ID
    if(ticId!==null){
    await ChatbotConfig.updateOne(
      { chatbotId: chatbotId },
      { $push: { conversations: String(ticId) } }
    );
  }
    // Return the response, including ticket management details
    return res.json({
      success: true,
      animationMessage: {
        parts: responseParts,
      },
      ticketManagement: {
        conversationId: chatbotId,
        ticketFlag: ticketFlag,
      },
      ticketMessage: ticketMessage,
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing chat',
      error: error.message,
    });
  }
});

// const app = express();
// const PORT = process.env.PORT || 5000;
// app.use(cors());
// app.use(express.json());
// app.use(fileUpload()); // Enable file uploads

// // Initialize Cohere API
// const cohere = new CohereClient({
//   token: process.env.COHERE_API_KEY,
// });

// // Initialize Groq client
// const groq = new GroqClient({ apiKey: process.env.GROQ_API_KEY });

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI).then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }).catch(error => {
//   console.error('Error connecting to MongoDB:', error);
// });

// // Define schema for knowledge base entries
// const KnowledgeEntrySchema = new mongoose.Schema({
//   chatbotId: String,
//   content: String,
//   embedding: Object,
//   pdfEmbedding: Object,
//   pdfContent: String, 
// });

// const KnowledgeEntry = mongoose.model('KnowledgeEntry', KnowledgeEntrySchema);

// // Define schema for chatbot configurations
// const ChatbotConfigSchema = new mongoose.Schema({
//   chatbotId: String,
//   name: String,
//   contextMessage: String,
//   temperature: Number,
//   primaryColor: String,
//   fontFamily: String,
//   fontSize: Number,
//   supportedLanguages: [String], // Add supported languages (e.g., ['English', 'Hindi'])
//   predefinedEmotions: [String]  // Add predefined emotions (e.g., ['happy', 'sad', 'angry'])
// });
// const ChatbotConfig = mongoose.model('ChatbotConfig', ChatbotConfigSchema);

// const TicketSchema = new mongoose.Schema({
//   conversationId: String,
//   ticketFlag: { type: String, enum: ['None', 'Complaint', 'Refund/Return', 'Feedback'], default: 'None' },
//   userInfo: {
//     name: String,
//     email: String,
//     contactInfo: String,
//     address: String
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// const Ticket = mongoose.model('Ticket', TicketSchema);

// // Cohere embeddings class
// class CohereEmbeddings {
//   async embedDocuments(documents) {
//     const response = await cohere.embed({
//       texts: documents,
//     });
//     return response.embeddings;
//   }

//   async embedQuery(query) {
//     const response = await cohere.embed({
//       texts: [query],
//     });
//     return response.embeddings[0];
//   }
// }

// const getEmbeddings = new CohereEmbeddings();

// // Initialize vector store
// const vectorStore = new MongoDBAtlasVectorSearch(getEmbeddings, {
//   collection: KnowledgeEntry,
//   indexName: 'default',
//   textKey: 'content',
//   embeddingKey: 'embedding',
// });

// // API endpoint to create a new chatbot configuration
// app.post('/api/chatbots', async (req, res) => {
//   try {
//     const { name, contextMessage, temperature, primaryColor, fontFamily, fontSize } = req.body;
//     const chatbotId = new mongoose.Types.ObjectId().toString();
//     const config = new ChatbotConfig({ chatbotId, name, contextMessage, temperature, primaryColor, fontFamily, fontSize });
//     await config.save();
//     res.status(201).json({ chatbotId, message: 'Chatbot configuration created successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating chatbot configuration', error: error.message });
//   }
// });

// // API endpoint to get all chatbots
// app.get('/api/chatbots', async (req, res) => {
//   try {
//     const chatbots = await ChatbotConfig.find({}, 'chatbotId name');
//     res.json(chatbots);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching chatbots', error: error.message });
//   }
// });

// // API endpoint to get chatbot configuration
// app.get('/api/chatbots/:chatbotId/config', async (req, res) => {
//   try {
//     const { chatbotId } = req.params;
//     const config = await ChatbotConfig.findOne({ chatbotId });
//     if (config) {
//       res.json(config);
//     } else {
//       res.status(404).json({ message: 'Chatbot configuration not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching chatbot configuration', error: error.message });
//   }
// });

// // API endpoint to add knowledge to a specific chatbot's database
// app.post('/api/knowledge', async (req, res) => {
//   try {
//     const { chatbotId, content } = req.body;
//     const pdfFile = req.files?.pdf;
    
//     let pdfContent = '';
//     if (pdfFile) {
//       const pdfData = await pdfParse(pdfFile.data);
//       pdfContent = pdfData.text;

//       // Create embeddings for the extracted PDF content
//       const pdfEmbedding = await getEmbeddings.embedDocuments([pdfContent]);
//       console.log('PDF Embedding:', pdfEmbedding);

//       // Save the new knowledge entry to the database
//       const entry = new KnowledgeEntry({ chatbotId, content, embedding: await getEmbeddings.embedQuery(content), pdfEmbedding, pdfContent });
//       await entry.save();

//       res.status(201).json({ message: 'Knowledge added successfully' });
//     } else {
//       // Handle cases where PDF is not provided
//       res.status(400).json({ message: 'PDF file is required' });
//     }
//   } catch (error) {
//     console.error('Error adding knowledge:', error);
//     res.status(500).json({ message: 'Error adding knowledge', error: error.message });
//   }
// });

// // Cosine Similarity Calculation Function
// function cosineSimilarity(vecA, vecB) {
//   if (!vecA || !vecB) {
//     console.error('One or both vectors are undefined.');
//     return 0; // Return 0 similarity if vectors are not defined
//   }

//   let dotProduct = 0.0;
//   let normA = 0.0;
//   let normB = 0.0;

//   for (let i = 0; i < vecA.length; i++) {
//     dotProduct += vecA[i] * vecB[i];
//     normA += vecA[i] * vecA[i];
//     normB += vecB[i] * vecB[i];
//   }

//   return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
// }

// function getEmbeddingToUse(document) {
//   return [document.pdfEmbedding.flat()];
// }

// // Wrapper function to perform similarity search
// async function similaritySearchWrapper(query, limit, options) {
//   try {
//     const queryEmbedding = await getEmbeddings.embedQuery(query);
//     console.log('Query Embedding:', queryEmbedding);

//     const knowledgeEntries = await KnowledgeEntry.find(options);

//     const results = knowledgeEntries
//       .map(entry => {
//         const embeddingsToUse = getEmbeddingToUse(entry);

//         if (!embeddingsToUse || embeddingsToUse.length === 0) {
//           console.warn('No valid embedding found for entry:', entry._id);
//           return null;
//         }
//         const similarities = embeddingsToUse.map(embedding => cosineSimilarity(queryEmbedding, embedding));
//         const maxSimilarity = Math.max(...similarities);

//         return { entry, similarity: maxSimilarity };
//       })
//       .filter(result => result !== null);

//     results.sort((a, b) => b.similarity - a.similarity);

//     // console.log('Similarity Results:', results.slice(0, limit));
//     return results.slice(0, limit).map(result => result.entry);
//   } catch (error) {
//     console.error('Error during similarity search:', error);
//     throw error;
//   }
// }

// app.delete('/api/chat/:chatbotId', async (req, res) => {
//   try {
//     const { chatbotId } = req.params;

//     // Delete the chatbot configuration
//     const configDeletionResult = await ChatbotConfig.deleteOne({ chatbotId });
//     if (configDeletionResult.deletedCount === 0) {
//       return res.status(404).json({ message: 'Chatbot configuration not found' });
//     }

//     // Delete associated knowledge entries
//     await KnowledgeEntry.deleteMany({ chatbotId });

//     res.status(200).json({ message: 'Chatbot and associated knowledge entries deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting chatbot:', error);
//     res.status(500).json({ message: 'Error deleting chatbot', error: error.message });
//   }
// });

// // API endpoint for chatbot processing with similarity search
// app.post('/api/chat/:chatbotId', async (req, res) => {
//   try {
//     const { chatbotId } = req.params;
//     const { message, previousMessages = [], conversationId } = req.body;
    
//     console.log('Received request:', { chatbotId, message, previousMessages, conversationId });

//     const config = await ChatbotConfig.findOne({ chatbotId });
//     if (!config) {
//       console.error('Chatbot configuration not found:', chatbotId);
//       return res.status(404).json({ message: 'Chatbot configuration not found' });
//     }

//     // Log the chatbot config
//     console.log('Chatbot config:', config);

//     // Similarity search to get relevant context
//     const relevantDocs = await similaritySearchWrapper(message, 3, { chatbotId });
//     if (!relevantDocs || relevantDocs.length === 0) {
//       console.warn('No relevant documents found for chatbotId:', chatbotId);
//     }

//     const context = relevantDocs.map(doc => doc.content).join('\n');
    
//     // Log the relevant context for the chatbot
//     console.log('Context from relevant documents:', context);

//     const messages = [
//       { role: 'system', content: `Context: ${context}` },
//       ...previousMessages,
//       { role: 'user', content: message }
//     ];

//     const completion = await groq.chat.completions.create({
//       messages: messages,
//       model: 'llama-3.1-8b-instant',
//       temperature: config.temperature,
//     });

//     const responseText = completion.choices[0].message.content;

//     // Log the response generated by the LLM
//     console.log('Response from LLM:', responseText);

//     // Split response for animation and bilingual voice
//     const animationResponse = responseText.split('. ').map(text => ({
//       language: 'English',  // You can determine this dynamically based on user input or preferences
//       text: text,
//       emotion: 'neutral'    // Set emotion based on predefined rules or context
//     }));

//     // Ticket management logic
//     let ticket = await Ticket.findOne({ conversationId });

//     if (message.toLowerCase().includes('complaint')) {
//       if (!ticket) {
//         ticket = new Ticket({ conversationId });
//       }
//       ticket.ticketFlag = 'Complaint';
//       await ticket.save();
//     }

//     // Construct JSON response with animation and ticket management
//     const jsonResponse = {
//       animationMessage: animationResponse,
//       ticketManagement: {
//         conversationId,
//         ticketFlag: ticket ? ticket.ticketFlag : 'None'
//       }
//     };

//     // Log the final response before sending it
//     console.log('Final response:', jsonResponse);

//     res.json(jsonResponse);
//   } catch (error) {
//     console.error('Error processing chat:', error);
//     res.status(500).json({ message: 'Error processing chat', error: error.message });
//   }
// });

// // API endpoint to update user info in a ticket
// app.post('/api/tickets/:conversationId/user-info', async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const { name, email, contactInfo, address } = req.body;

//     const ticket = await Ticket.findOneAndUpdate(
//       { conversationId },
//       { $set: { 'userInfo.name': name, 'userInfo.email': email, 'userInfo.contactInfo': contactInfo, 'userInfo.address': address } },
//       { new: true }
//     );

//     if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

//     res.json({ message: 'User information updated', ticket });
//   } catch (error) {
//     console.error('Error updating user info:', error);
//     res.status(500).json({ message: 'Error updating user info', error: error.message });
//   }
// });
