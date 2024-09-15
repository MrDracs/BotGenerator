# **Conversify Documentation** 🎉🤖

## **Introduction** 📝

**Conversify** is an advanced customer support chatbot platform that allows businesses to easily integrate AI-powered chatbots into their websites. It combines interactive 3D avatar technology, voice and text interfaces, and customizable chatbot templates to deliver a seamless and dynamic user experience. Built on a robust MERN (MongoDB, Express.js, React.js, Node.js) stack, Conversify provides clients with embeddable links or code snippets, enabling quick and easy integration. 🚀

### **Key Features** 🌟

- **Embeddable Chatbot Integration**: Clients receive direct links or code to embed Conversify chatbots into their websites. 💻
- **Customizable Templates**: Various chatbot templates are provided to suit different customer support needs and branding styles. 🎨
- **Interactive 3D Avatar**: Users can interact with a 3D avatar that responds via text and voice, providing an engaging and human-like interface. 🕺🎤
- **Voice and Text Interaction**: Queries can be made either through text or voice input, with responses delivered in both modalities. 🗣️⌨️
- **Backend Powered by Mistral and Llama LLM**: Conversify leverages Mistral and LLama for handling natural language queries. 🧠✨
- **MongoDB Atlas as Vector Store**: Efficient and scalable storage and retrieval of conversation data is managed by MongoDB Atlas. 🗄️⚡
- **Future Support for Model Selection**: Clients will have the option to choose from multiple language models to best suit their needs. 🔮📈

---

## **Architecture Overview** 🏗️

Conversify is built on a full-stack JavaScript architecture using the MERN stack, ensuring scalability, flexibility, and efficiency. 🌐✨

### **Backend** 🛠️:

- **Node.js & Express.js**: Handle API requests, process conversation data, and manage backend services. 🔗💼
- **MongoDB Atlas**: Stores conversation history, user profiles, and vectors for efficient similarity searches and retrieval using a vectorStore. 🗂️
- **Mistral (LLM)**: Handles natural language processing and generates human-like responses to customer queries. 💬💡

### **Frontend** 🖼️:

- **React.js**: Provides an intuitive, responsive user interface where users can interact with the chatbot. It supports both text and voice inputs. 🎨🧑‍💻
- **Three.js (3D Avatar)**: A 3D engine that powers the interactive avatar, adding a layer of visual engagement to the chatbot interaction. 🕹️👾

---

## **Integration Process** 🛠️✨

1. **Get Embeddable Link or Code**: After configuring your chatbot through Conversify’s web app, clients will receive a custom embeddable link or code snippet. 📬
2. **Embed in Website**: Paste the provided code into your website’s HTML to seamlessly integrate the chatbot interface into any page. 🖥️🔗
3. **Customization**: Customize the chatbot by selecting templates that align with your brand and needs. In the future, you will also be able to choose different language models to power your chatbot. 🎨🤖

---

## **Main Functionalities** 🔧

### 1. **Interactive Chat Interface** 💬🤖
   - Users can interact with the chatbot using text or voice queries. 📢🖊️
   - The chatbot responds through the 3D avatar with both text and voice output, enhancing engagement. 🗣️✨

### 2. **Templates** 🎨📝
   - Choose from a variety of templates tailored to different customer support scenarios. These templates will guide the behavior, tone, and appearance of the chatbot. 🎭

### 3. **Voice and Text Integration** 🎤⌨️
   - The chatbot can process both voice and text inputs from users. 🎙️📝
   - Voice responses are synthesized using advanced text-to-speech technology, giving the 3D avatar a natural voice. 🎧

### 4. **3D Avatar Customization** 🧑‍🎤🤖
   - The 3D avatar is fully customizable, allowing for branding and personality alignment. Choose from different avatar styles and behaviors. 🎨🕺

---

## **Future Roadmap** 🔮🚀

1. **Model Selection Options**: Clients will be able to choose between different language models (such as GPT, Mistral, etc.) based on their preferences and requirements. 🧠🔧
2. **Advanced Analytics**: Dashboard for tracking chatbot performance, user interactions, and feedback. 📊📈
3. **Personalized Avatars**: More customization options for the avatar to better align with different business needs and brand identities. 🕴️💼
4. **AI-Powered Feedback Loops**: Allow the chatbot to learn from previous interactions to improve responses over time. 🤖💡

---

## **Getting Started** 🚀

### **Setting up the BotGenerator Backend** 🛠️

1. **Clone the Repository**:
   - Open your terminal and run:
     ```bash
     git clone [REPO_URL]
     cd BotGenerator
     ```

2. **Install Dependencies**:
   - In the `BotGenerator` directory, install the necessary dependencies:
     ```bash
     npm install
     ```

3. **Create `.env` File**:
   - In the `BotGenerator` folder, create a `.env` file and include the following environment variables:
     ```bash
     MONGODB_URI=<Your_MongoDB_Connection_URI>
     GROQ_API_KEY=<Your_GROQ_API_Key>
     COHERE_API_KEY=<Your_Cohere_API_Key>
     ```

4. **Run the Server**:
   - Start the development server:
     ```bash
     npm run dev
     ```
   - This will open a webpage in your browser, which you can close for now. 🌐

### **Accessing and Testing the Chatbot Frontend** 🧪🖥️

5. **Access the Frontend**:
   - Navigate to the `CodeCubicleConversify` folder and open `index.html` in your browser:
     - Option 1: Use the browser of your choice. 🌍
     - Option 2: Use the VS Code Live Server extension for local hosting. ⚡

6. **Generate and Test Your Chatbot**:
   - On the Conversify web app you opened, fill out the form, add a knowledge base, and click **Submit**. You’ll get an embeddable `div` element containing your chatbot. 🤖📦

7. **Embed the Chatbot**:
   - To quickly test the chatbot:
     - Copy the entire `div` element generated. 📝
     - Open `index.html` in the `CodeCubicleConversify` folder.
     - Find the following class in the code (around line 357):
       ```html
       <div class="side-bar-fs">
       ```
     - Replace the entire `div` with the new one you copied, save, and refresh the page. 🔄💻

8. **Enable Text-to-Speech (TTS)**:
   - To enable TTS for the chatbot, append `/tts` at the end of the `src` URL in the iframe tag that was provided in the `div`. 🎤
     - For example:
       ```html
       <iframe src="your_chatbot_url/tts" ... ></iframe>
       ```

### **Conversify Web App Setup** 💻

1. **Sign up on the Web App**: Visit [Conversify Web App URL] and create an account. 📝
2. **Configure Your Chatbot**: Use the provided templates to configure your chatbot. 🛠️
3. **Generate Embeddable Code**: Once configuration is complete, you will receive the embed code to integrate into your website. 🔗
4. **Monitor & Improve**: Access the dashboard to monitor interactions and optimize the chatbot’s performance. 📊

---

## **Contact and Support** 📧👨‍💻

If you have any questions or run into any issues, feel free to reach out to our support team at:

- **Email**: certifiednerd.codes@gmail.com
- **GitHub**: [https://github.com/MrDracs](https://github.com/MrDracs)

---

Now you're all set to bring Conversify's chatbots to life on your website! 🎉🤖
