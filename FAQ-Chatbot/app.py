"""
app.py
------
Streamlit front-end for the NLP-based FAQ Chatbot.

Features:
    * Modern, dark-mode friendly chat UI
    * Chat input box and persistent chat history
    * Distinct user / bot message bubbles
    * Similarity score display
    * Category filter (multiple FAQ categories)
    * Optional voice input support
    * Download chat history
    * Clear chat button
    * Sidebar with project information
"""

import datetime
import io

import streamlit as st

from chatbot import FAQChatbot

# ---------------------------------------------------------------------------
# Page configuration
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="NLP FAQ Chatbot",
    page_icon="🤖",
    layout="centered",
    initial_sidebar_state="expanded",
)


# ---------------------------------------------------------------------------
# Custom styling (clean, modern, dark-mode friendly)
# ---------------------------------------------------------------------------
def inject_css():
    st.markdown(
        """
        <style>
        /* Overall chat container */
        .block-container { padding-top: 2rem; }

        /* Message bubbles */
        .chat-row { display: flex; margin: 0.5rem 0; }
        .chat-row.user { justify-content: flex-end; }
        .chat-row.bot  { justify-content: flex-start; }

        .bubble {
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            max-width: 80%;
            line-height: 1.5;
            font-size: 0.95rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .bubble.user {
            background-color: #2563eb;
            color: #ffffff;
            border-bottom-right-radius: 0.25rem;
        }
        .bubble.bot {
            background-color: #1f2937;
            color: #f3f4f6;
            border-bottom-left-radius: 0.25rem;
        }
        .meta {
            font-size: 0.72rem;
            opacity: 0.7;
            margin-top: 0.25rem;
        }
        .score-badge {
            display: inline-block;
            margin-top: 0.35rem;
            padding: 0.1rem 0.5rem;
            border-radius: 0.5rem;
            background-color: #065f46;
            color: #d1fae5;
            font-size: 0.7rem;
        }
        .title-wrap { text-align: center; margin-bottom: 0.5rem; }
        </style>
        """,
        unsafe_allow_html=True,
    )


inject_css()


# ---------------------------------------------------------------------------
# Load the chatbot (cached so the model is only built once)
# ---------------------------------------------------------------------------
@st.cache_resource(show_spinner="Loading FAQ knowledge base...")
def load_bot():
    return FAQChatbot(csv_path="faq.csv", threshold=0.3)


bot = load_bot()


# ---------------------------------------------------------------------------
# Session state initialization
# ---------------------------------------------------------------------------
if "messages" not in st.session_state:
    # Each message: {"role": "user"/"bot", "text": str, "score": float, "time": str}
    st.session_state.messages = []


# ---------------------------------------------------------------------------
# Sidebar: project information & controls
# ---------------------------------------------------------------------------
with st.sidebar:
    st.header("🤖 FAQ Chatbot")
    st.markdown(
        """
        An **NLP-powered FAQ assistant** built with:

        - 🐍 **Python**
        - 📚 **NLTK** for text preprocessing
        - 🔢 **Scikit-learn** (TF-IDF + Cosine Similarity)
        - 🐼 **Pandas** for data handling
        - 🎈 **Streamlit** for the UI
        """
    )

    st.divider()

    # Category filter (multiple FAQ categories)
    category = st.selectbox(
        "📂 Filter by category",
        options=["All"] + bot.categories,
        index=0,
        help="Restrict answers to a specific FAQ category.",
    )

    # Adjustable similarity threshold
    bot.threshold = st.slider(
        "🎯 Match sensitivity (threshold)",
        min_value=0.0,
        max_value=1.0,
        value=0.3,
        step=0.05,
        help="Higher values require a closer match before answering.",
    )

    show_scores = st.checkbox("Show similarity scores", value=True)

    st.divider()
    st.caption(f"📊 {len(bot.df)} FAQs loaded across {len(bot.categories)} categories.")
    st.caption("Made with ❤️ using Streamlit.")


# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
st.markdown(
    "<div class='title-wrap'><h1>🤖 NLP FAQ Chatbot</h1>"
    "<p>Ask me anything about accounts, billing, shipping, support and more!</p></div>",
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# Helper: render a single message bubble
# ---------------------------------------------------------------------------
def render_message(msg: dict):
    role = msg["role"]
    avatar = "🧑" if role == "user" else "🤖"
    score_html = ""
    if role == "bot" and show_scores and msg.get("score") is not None:
        score_html = f"<div class='score-badge'>similarity: {msg['score']:.2f}</div>"

    st.markdown(
        f"""
        <div class='chat-row {role}'>
            <div class='bubble {role}'>
                <div>{avatar} {msg['text']}</div>
                {score_html}
                <div class='meta'>{msg.get('time', '')}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------------------
# Optional: voice input support
# ---------------------------------------------------------------------------
voice_text = None
with st.expander("🎤 Voice input (optional)"):
    st.caption(
        "Record your question below. Requires the optional "
        "`SpeechRecognition` and `audio_recorder_streamlit` packages."
    )
    try:
        import speech_recognition as sr  # type: ignore
        from audio_recorder_streamlit import audio_recorder  # type: ignore

        audio_bytes = audio_recorder(text="Click to record", icon_size="2x")
        if audio_bytes:
            recognizer = sr.Recognizer()
            try:
                with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
                    audio = recognizer.record(source)
                voice_text = recognizer.recognize_google(audio)
                st.success(f"Recognized: {voice_text}")
            except Exception as exc:  # noqa: BLE001
                st.warning(f"Could not transcribe audio: {exc}")
    except ImportError:
        st.info(
            "Voice input is disabled. Install the optional dependencies:\n\n"
            "`pip install SpeechRecognition audio_recorder_streamlit`"
        )


# ---------------------------------------------------------------------------
# Render existing chat history
# ---------------------------------------------------------------------------
for msg in st.session_state.messages:
    render_message(msg)


# ---------------------------------------------------------------------------
# Process a new user question
# ---------------------------------------------------------------------------
def handle_question(question: str):
    """Add the user's message and the bot's response to the chat history."""
    now = datetime.datetime.now().strftime("%H:%M")

    # Save the user's message
    st.session_state.messages.append(
        {"role": "user", "text": question, "score": None, "time": now}
    )

    # Get the bot's answer
    result = bot.get_response(question, category=category)
    st.session_state.messages.append(
        {
            "role": "bot",
            "text": result["answer"],
            "score": result["score"],
            "time": now,
        }
    )


# Chat input box (always pinned to the bottom)
user_input = st.chat_input("Type your question here...")

# Prefer typed input, fall back to voice input
question = user_input or voice_text
if question:
    handle_question(question)
    st.rerun()


# ---------------------------------------------------------------------------
# Footer controls: clear chat & download history
# ---------------------------------------------------------------------------
col1, col2 = st.columns(2)

with col1:
    if st.button("🗑️ Clear chat", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

with col2:
    if st.session_state.messages:
        # Build a downloadable transcript
        lines = []
        for m in st.session_state.messages:
            speaker = "You" if m["role"] == "user" else "Bot"
            score = (
                f" (similarity: {m['score']:.2f})"
                if m["role"] == "bot" and m.get("score") is not None
                else ""
            )
            lines.append(f"[{m.get('time', '')}] {speaker}: {m['text']}{score}")
        transcript = "\n".join(lines)

        st.download_button(
            "💾 Download chat history",
            data=transcript,
            file_name="chat_history.txt",
            mime="text/plain",
            use_container_width=True,
        )
