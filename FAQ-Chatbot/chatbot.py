"""
chatbot.py
----------
Core NLP logic for the FAQ Chatbot.

This module handles:
    * Loading the FAQ dataset (faq.csv)
    * Text preprocessing with NLTK (lowercase, punctuation removal,
      tokenization, stopword removal, lemmatization)
    * TF-IDF vectorization with Scikit-learn
    * Cosine similarity matching between the user query and FAQ questions
    * Returning the best answer (or a fallback message below a threshold)
"""

import os
import string

import nltk
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ---------------------------------------------------------------------------
# One-time NLTK resource download
# ---------------------------------------------------------------------------
def _ensure_nltk_resources():
    """Download required NLTK corpora/models if they are not already present."""
    resources = {
        "punkt": "tokenizers/punkt",
        "punkt_tab": "tokenizers/punkt_tab",
        "stopwords": "corpora/stopwords",
        "wordnet": "corpora/wordnet",
        "omw-1.4": "corpora/omw-1.4",
    }
    for package, path in resources.items():
        try:
            nltk.data.find(path)
        except LookupError:
            # quiet=True keeps the Streamlit console clean
            nltk.download(package, quiet=True)


_ensure_nltk_resources()


class FAQChatbot:
    """An NLP-based FAQ chatbot using TF-IDF and cosine similarity."""

    def __init__(self, csv_path: str = "faq.csv", threshold: float = 0.3):
        """
        Parameters
        ----------
        csv_path : str
            Path to the FAQ CSV file. Must contain 'Question' and 'Answer'
            columns (an optional 'Category' column is also supported).
        threshold : float
            Minimum cosine similarity score required to return an answer.
        """
        self.csv_path = csv_path
        self.threshold = threshold

        # NLP helpers
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words("english"))

        # Load and prepare the data
        self.df = self._load_data()
        self.categories = self._extract_categories()

        # Build the TF-IDF model on the preprocessed questions
        self.vectorizer = TfidfVectorizer()
        self._fit_vectorizer()

    # ------------------------------------------------------------------ #
    # Data loading
    # ------------------------------------------------------------------ #
    def _load_data(self) -> pd.DataFrame:
        """Load the FAQ dataset from CSV using Pandas."""
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(
                f"FAQ file not found at '{self.csv_path}'. "
                "Make sure faq.csv exists in the project root."
            )

        df = pd.read_csv(self.csv_path)

        # Validate required columns
        required = {"Question", "Answer"}
        if not required.issubset(df.columns):
            raise ValueError(
                f"faq.csv must contain {required} columns. Found: {set(df.columns)}"
            )

        # Add a default category column if one is missing
        if "Category" not in df.columns:
            df["Category"] = "General"

        # Drop empty rows and reset the index
        df = df.dropna(subset=["Question", "Answer"]).reset_index(drop=True)

        # Pre-compute the cleaned version of every question
        df["clean_question"] = df["Question"].apply(self.preprocess)
        return df

    def _extract_categories(self) -> list:
        """Return a sorted list of unique FAQ categories."""
        return sorted(self.df["Category"].dropna().unique().tolist())

    # ------------------------------------------------------------------ #
    # NLP preprocessing
    # ------------------------------------------------------------------ #
    def preprocess(self, text: str) -> str:
        """
        Clean and normalize a piece of text.

        Steps:
            1. Lowercase
            2. Remove punctuation
            3. Tokenize
            4. Remove stopwords and non-alphabetic tokens
            5. Lemmatize
        """
        # 1. Lowercase
        text = str(text).lower()

        # 2. Remove punctuation
        text = text.translate(str.maketrans("", "", string.punctuation))

        # 3. Tokenize
        tokens = word_tokenize(text)

        # 4 & 5. Remove stopwords / non-alpha tokens, then lemmatize
        cleaned_tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token.isalpha() and token not in self.stop_words
        ]

        return " ".join(cleaned_tokens)

    # ------------------------------------------------------------------ #
    # TF-IDF model
    # ------------------------------------------------------------------ #
    def _fit_vectorizer(self):
        """Fit the TF-IDF vectorizer on the preprocessed FAQ questions."""
        self.question_vectors = self.vectorizer.fit_transform(
            self.df["clean_question"]
        )

    # ------------------------------------------------------------------ #
    # Answering
    # ------------------------------------------------------------------ #
    def get_response(self, user_question: str, category: str = "All"):
        """
        Find the best matching FAQ answer for the user's question.

        Parameters
        ----------
        user_question : str
            The raw question typed by the user.
        category : str
            Optional category filter. "All" searches every category.

        Returns
        -------
        dict with keys:
            answer  : str   -> the matched answer or a fallback message
            score   : float -> the cosine similarity score (0-1)
            matched : str    -> the FAQ question that was matched (or None)
            found   : bool   -> whether a confident match was found
        """
        if not user_question or not user_question.strip():
            return {
                "answer": "Please type a question so I can help you. 🙂",
                "score": 0.0,
                "matched": None,
                "found": False,
            }

        # Preprocess and vectorize the user's question
        clean_query = self.preprocess(user_question)
        query_vector = self.vectorizer.transform([clean_query])

        # Compute cosine similarity against all FAQ questions
        similarities = cosine_similarity(query_vector, self.question_vectors).flatten()

        # Optionally restrict the search to a single category
        if category and category != "All":
            mask = (self.df["Category"] == category).values
            # Zero-out scores outside the selected category
            similarities = similarities * mask

        # Identify the best match
        best_index = int(similarities.argmax())
        best_score = float(similarities[best_index])

        # Below threshold -> fallback response
        if best_score < self.threshold:
            return {
                "answer": "Sorry, I couldn't find a relevant answer.",
                "score": best_score,
                "matched": None,
                "found": False,
            }

        return {
            "answer": self.df.iloc[best_index]["Answer"],
            "score": best_score,
            "matched": self.df.iloc[best_index]["Question"],
            "found": True,
        }


# ---------------------------------------------------------------------------
# Quick manual test (run: python chatbot.py)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    bot = FAQChatbot()
    print("FAQ Chatbot ready. Type 'quit' to exit.\n")
    while True:
        q = input("You: ")
        if q.lower() in {"quit", "exit"}:
            break
        result = bot.get_response(q)
        print(f"Bot: {result['answer']}  (score: {result['score']:.2f})\n")
