import sys
import re
from typing import Dict, List, Tuple

# ANSI Color palette constants
COLOR_THEME: Dict[str,str] = {
    "BOT": "\033[96m",
    "SYSTEM": "\033[93m",
    "USER": "\033[97m",
    "RESET": "\033[0m"
}

def print_banner() -> None:
    border = "=" * 60
    title = "CPBOT (v1.0.0)"
    tagline = "A portfolio-Grade Rule-based AI Chatbot for DecodeLabs"

    print(f"{COLOR_THEME['SYSTEM']}{border}")
    print(f"{title:^60}")
    print(f"{tagline:^60}")
    print(f"{border}{COLOR_THEME['RESET']}\n")
    print(f"{COLOR_THEME['SYSTEM']}System: Type 'help' to see what I can do or 'exit' to quit.{COLOR_THEME['RESET']}\n")
    
def sanitize_input(raw_input:str) -> str:
    text = raw_input.lower().strip()
    return re.sub(r"\s+", " ", text)

# Intent-Response Knowledge Base
RESPONSES: Dict[str, str] = {
    "hello": "Hello there! How can I help you today?",
    "hi": "Hi! Good to see you. What's on your mind?",
    "hey": "Hey! How can I assist you?",
    "bye": "Goodbye! Have a wonderful day ahead.",
    "exit": "Goodbye! Have a wonderful day ahead.",
    "quit": "Goodbye! Have a wonderful day ahead.",
    "who are you": "I am Decodabot (v1.0.0), a rule-based AI assistant built for Project 1 at DecodeLabs.",
    "what are you": "I am a deterministic, rule-based chatbot running on O(1) dictionary lookups.",
    "what can you do": "I can chat, help guide you, print quotes, and showcase simple command-response mapping. Try typing 'help'.",
    "thanks": "You're very welcome! I'm happy to help.",
    "thank you": "You're very welcome! I'm happy to help.",
    "how are you": "I'm functioning at peak efficiency! Thank you for asking. How are you?",
    "help": "Available commands: 'hello', 'hi', 'who are you', 'what can you do', 'thanks', 'how are you', 'quote', 'help', 'exit', 'quit', 'bye'.",
    "quote": "Here is a classic: 'First, solve the problem. Then, write the code.' - John Johnson"
}


def get_response(user_input:str, responses_db: Dict[str,str], fallback_msg: str, unmatched_log: List[str]) -> str: 
 
    response = responses_db.get(user_input)
    if response is None:
        unmatched_log.append(user_input)
        return fallback_msg
    return response

def print_goodbye(messages_exchanged: int, unmatched_count: int) -> None:
  
    border = "=" * 60
    print(f"\n{COLOR_THEME['SYSTEM']}{border}")
    print(f"{' SESSION SUMMARY ':^60}")
    print(f"{border}")
    print(f" Total Messages Exchanged : {messages_exchanged}")
    print(f" Unmatched Inputs Logged  : {unmatched_count}")
    print(f"{border}")
    print(f"{'Goodbye! Thank you for using Decodabot.':^60}")
    print(f"{border}{COLOR_THEME['RESET']}")


def main() -> None:
    
    print_banner()
    
    messages_exchanged = 0
    unmatched_log: List[str] = []
    fallback_message = "I don't understand that yet. Try 'help' to see what I can do."
    
    try:

     while True:
        sys.stdout.write(f"{COLOR_THEME['USER']}You: {COLOR_THEME['RESET']}")
        sys.stdout.flush()
        
        try:
            raw_input = input()
        except EOFError:
            break
            
        sanitized = sanitize_input(raw_input)
        
        # Avoid crashing or processing empty inputs
        if not sanitized:
            continue
            
        # Intercept termination commands
        if sanitized in ["exit", "quit", "bye"]:
            goodbye_resp = get_response(sanitized, RESPONSES, fallback_message, unmatched_log)
            print(f"{COLOR_THEME['BOT']}Decodabot: {goodbye_resp}{COLOR_THEME['RESET']}")
            messages_exchanged += 1
            break

        # Process standard responses
        response = get_response(sanitized, RESPONSES, fallback_message, unmatched_log)
        print(f"{COLOR_THEME['BOT']}Decodabot: {response}{COLOR_THEME['RESET']}")
        messages_exchanged += 1
    
    except KeyboardInterrupt:
        print(f"\n\n{COLOR_THEME['SYSTEM']}System: Session interrupted via KeyboardInterrupt.{COLOR_THEME['RESET']}")
    
    finally:
        print_goodbye(messages_exchanged, len(unmatched_log))