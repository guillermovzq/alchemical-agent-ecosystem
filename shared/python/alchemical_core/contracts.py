"""
Alchemical Agent Ecosystem — Shared Contracts
==============================================
Pydantic models used as the canonical data contracts across all services and
agents in the Alchemical ecosystem.  Import from this module (or from the
top-level ``alchemical_core`` package) to guarantee consistent serialisation
and validation everywhere.

Quick start::

    from alchemical_core.contracts import AgentTask, AgentResult, CircleTask, ServiceResponse

    task = AgentTask(task_id="t-001", agent="scribe", intent="summarise")
    # or using the camelCase alias accepted by external HTTP clients:
    task = AgentTask(**{"taskId": "t-001", "agent": "scribe", "intent": "summarise"})
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class AgentTask(BaseModel):
    """A unit of work dispatched to a single agent."""

    model_config = ConfigDict(populate_by_name=True)

    task_id: str = Field(
        alias="taskId",
        description="Unique identifier for this task.",
    )
    agent: str = Field(
        description="Logical name or ID of the agent that should handle this task.",
    )
    intent: str = Field(
        description="Short description of what the agent should accomplish.",
    )
    payload: Optional[dict[str, Any]] = Field(
        default=None,
        description="Arbitrary structured data passed to the agent as input context.",
    )
    confidence: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Caller-supplied confidence score (0–1) for routing decisions.",
    )


class AgentResult(BaseModel):
    """The outcome produced by an agent after processing an :class:`AgentTask`."""

    task_id: str = Field(
        description="Identifier matching the originating :class:`AgentTask`.",
    )
    ok: bool = Field(
        description="``True`` when the agent completed the task successfully.",
    )
    confidence: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Agent-reported confidence in its own output (0–1).",
    )
    data: dict[str, Any] = Field(
        default_factory=dict,
        description="Arbitrary result payload returned by the agent.",
    )


class CircleTask(BaseModel):
    """A task assigned to an Alchemical Circle (multi-agent team)."""

    circle_id: str = Field(description="Unique circle identifier.")
    goal: str = Field(description="High-level goal for the circle.")
    agent_ids: list[str] = Field(
        default_factory=list,
        description="Agent IDs participating in this circle.",
    )
    roles: dict[str, str] = Field(
        default_factory=dict,
        description="Mapping of agent_id → role name within the circle.",
    )
    max_rounds: int = Field(
        default=3,
        ge=1,
        le=20,
        description="Maximum number of deliberation rounds before the circle must conclude.",
    )
    created_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO-8601 timestamp of when this circle task was created (UTC).",
    )
    status: str = Field(
        default="pending",
        description="Lifecycle status: pending | running | completed | failed.",
    )


class ServiceResponse(BaseModel):
    """Standard response returned by any execution service in the ecosystem."""

    result: str = Field(description="Primary text output from the service.")
    confidence: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Service-reported confidence in the result (0–1).",
    )
    model_used: str = Field(
        default="",
        description="ID of the LLM model that produced the result, if applicable.",
    )
    tokens_used: int = Field(
        default=0,
        ge=0,
        description="Total tokens consumed (prompt + completion) for this request.",
    )
    service: str = Field(
        default="",
        description="Name or identifier of the service that generated this response.",
    )
    duration_ms: float = Field(
        default=0.0,
        description="Wall-clock time taken to produce the result, in milliseconds.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Arbitrary additional metadata attached by the service.",
    )
