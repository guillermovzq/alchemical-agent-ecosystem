"""
Alchemical Agent Ecosystem — Core Shared Library
=================================================
Provides contracts, LLM client, and utilities shared across all services.

Quick start::

    from alchemical_core import AlchemicalLLM, AgentTask, AgentResult, ServiceResponse
    from alchemical_core.llm import get_llm, quick_chat
"""

from alchemical_core.contracts import (
    AgentTask,
    AgentResult,
    CircleTask,
    ServiceResponse,
)
from alchemical_core.llm import (
    AlchemicalLLM,
    LLMConfig,
    ModelRegistry,
    KiloHealthCheck,
    KiloAPIError,
    KiloAuthError,
    KiloRateLimitError,
    get_llm,
    quick_chat,
)

__version__ = "2.0.0"
__all__ = [
    "AgentTask",
    "AgentResult",
    "CircleTask",
    "ServiceResponse",
    "AlchemicalLLM",
    "LLMConfig",
    "ModelRegistry",
    "KiloHealthCheck",
    "KiloAPIError",
    "KiloAuthError",
    "KiloRateLimitError",
    "get_llm",
    "quick_chat",
]
