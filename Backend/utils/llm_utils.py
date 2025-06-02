import os
import logging
import sqlite3
from langchain_openai import ChatOpenAI
from langchain_litellm import ChatLiteLLM
from typing import Union

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def initialize_llm(model_string: str) -> Union[ChatOpenAI, ChatLiteLLM]:
    """
    Initialize an LLM based on the model string (e.g., 'openai/gpt-4o', 'anthropic/claude-3-5-sonnet-20241022').
    Supports OpenAI, Anthropic, Gemini, and Together AI.
    """
    try:
        if not model_string or '/' not in model_string:
            raise ValueError("Model string must be in format 'provider/model', e.g., 'openai/gpt-4o'")
        provider, model = model_string.split('/', 1)
        if not provider or not model:
            raise ValueError("Both provider and model must be non-empty")

        # Load API keys from database
        conn = sqlite3.connect("agent_memory.db")
        c = conn.cursor()
        c.execute("SELECT openai_api_key, anthropic_api_key, google_api_key, together_api_key, llm_temperature, llm_max_tokens, llm_timeout FROM settings WHERE id = 1")
        row = c.fetchone()
        conn.close()
        api_keys = {
            "openai": row[0] if row else None,
            "anthropic": row[1] if row else None,
            "gemini": row[2] if row else None,
            "together": row[3] if row else None
        }
        
        # Fall back to environment variables
        for key in api_keys:
            if not api_keys[key]:
                env_key = f"{key.upper()}_API_KEY"
                api_keys[key] = os.getenv(env_key)

        llm_params = {
            "temperature": row[4] if row and row[4] is not None else 0.1,
            "max_tokens": row[5] if row and row[5] is not None else 1500,
            "timeout": row[6] if row and row[6] is not None else 120,
            "streaming": False,
        }

        if provider == "together":
            if not api_keys["together"]:
                raise ValueError("Together API key not set in database or environment")
            llm = ChatOpenAI(
                openai_api_base="https://api.together.xyz/v1",
                openai_api_key=api_keys["together"],
                model_name=model,
                **llm_params
            )
            logger.info(f"Initialized ChatOpenAI for Together AI model: {model}")
        elif provider in ["openai", "anthropic", "gemini"]:
            api_key = api_keys[provider]
            if not api_key:
                raise ValueError(f"{provider.upper()}_API_KEY not set in database or environment")
            model_name = f"{provider}/{model}" if provider != "openai" else model
            llm = ChatLiteLLM(
                model=model_name,
                api_key=api_key,
                **llm_params
            )
            logger.info(f"Initialized ChatLiteLLM for {provider} model: {model}")
        else:
            raise ValueError(f"Unsupported provider: {provider}. Supported providers: openai, anthropic, gemini, together")

        return llm

    except ValueError as ve:
        logger.error(f"Invalid model configuration: {str(ve)}")
        raise
    except Exception as e:
        logger.error(f"Error initializing LLM: {str(e)}")
        raise RuntimeError(f"Failed to initialize LLM: {str(e)}")