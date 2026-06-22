# 🤖 NLP-Based FAQ Chatbot

An intelligent FAQ chatbot that understands natural language questions and returns the most relevant answer from a knowledge base. It uses **NLTK** for text preprocessing, **Scikit-learn** for TF-IDF vectorization and cosine similarity matching, **Pandas** for data handling, and **Streamlit** for a clean, modern chat interface.

## 📝 Project Description

This chatbot loads a set of frequently asked questions and their answers from a CSV file. When a user asks a question, the text is preprocessed (lowercasing, punctuation removal, tokenization, stopword removal, and lemmatization), converted into a TF-IDF vector, and compared against every FAQ question using **cosine similarity**. The answer to the most similar question is returned. If no question is similar enough (below a configurable threshold), the bot responds with a fallback message.

## ✨ Features

- 🧠 **NLP preprocessing** with NLTK (lowercase, punctuation removal, tokenization, stopwords, lemmatization)
- 🔢 **TF-IDF vectorization** with Scikit-learn
- 📐 **Cosine similarity** matching to find the best answer
- 🚫 **Confidence threshold** with a graceful fallback message
- 💬 **Chat interface** with persistent chat history and styled user/bot bubbles
- 🌙 **Dark-mode friendly**, modern, responsive UI
- 📊 **Similarity score display** for transparency
- 📂 **Multiple FAQ categories** with a category filter
- 🎤 **Voice input support** (optional)
- 💾 **Download chat history** as a text file
- 🗑️ **Clear chat** button
- ℹ️ **Sidebar** with project information and settings

## 📁 Project Structure

```
FAQ-Chatbot/
│
├── app.py            # Streamlit UI
├── chatbot.py        # Core NLP + matching logic
├── faq.csv           # FAQ dataset (Category, Question, Answer)
├── requirements.txt  # Python dependencies
├── README.md         # Project documentation
└── assets/           # Static assets (images, etc.)
```

## ⚙️ Installation

1. **Clone or download** this project.

2. (Recommended) **Create a virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate        # On Windows: venv\Scripts\activate
   ```

3. **Install the dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

   > NLTK data (punkt, stopwords, wordnet) is downloaded automatically the first time you run the app.

## ▶️ Running the Project

```bash
pip install -r requirements.txt
streamlit run app.py
```

Then open the URL shown in the terminal (usually `http://localhost:8501`) in your browser.

### Optional: Voice Input

To enable voice input, install the optional packages:

```bash
pip install SpeechRecognition audio_recorder_streamlit
```

## 🧩 Customizing the FAQs

Edit `faq.csv` to add your own questions and answers. The file uses three columns:

| Category | Question | Answer |
| -------- | -------- | ------ |
| Billing  | How do I cancel my subscription? | Go to Settings, select Billing... |

The `Category` column is optional — if omitted, all entries default to "General".

## 🛠️ Technologies Used

- **Python** – core programming language
- **NLTK** – natural language preprocessing
- **Scikit-learn** – TF-IDF vectorization & cosine similarity
- **Pandas** – CSV/data handling
- **Streamlit** – interactive web UI

## 📄 License

This project is open source and free to use for learning and demonstration purposes.
