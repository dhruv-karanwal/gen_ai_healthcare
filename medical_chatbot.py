import requests
import json

API_KEY = "AIzaSyDXhFjxauRzGCsjQyuOXUnU8gi3dX0hW_o"

MODEL = "gemini-2.5-flash"

BASE_URL = f"https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent?key={API_KEY}"

MEDICAL_CONTEXT = """
You are a helpful and concise AI medical assistant.
- Provide short, easy-to-read answers.
- Use bullet points for lists.
- Avoid long paragraphs.
- Do not prescribe medicines or dosages.
- If symptoms are dangerous, advise seeing a doctor immediately.
"""

def send_message(user_input):
    payload = {
        "contents": [{
            "parts": [{
                "text": f"{MEDICAL_CONTEXT}\nUser: {user_input}\nAssistant:"
            }]
        }]
    }

    response = requests.post(
        BASE_URL,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )

    if response.status_code == 200:
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    else:
        return f"ERROR {response.status_code}: {response.text}"


# -------------------------
# CHAT LOOP (WORKS 100%)
# -------------------------
if __name__ == "__main__":
    print("Medical Chatbot (REST API Version)")
    print("----------------------------------")

    while True:
        msg = input("\nYou: ")

        if msg.lower() in ["exit", "quit"]:
            print("Goodbye ❤️")
            break

        reply = send_message(msg)
        print("\nAssistant:", reply)
