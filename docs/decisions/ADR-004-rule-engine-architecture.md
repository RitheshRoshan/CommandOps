# ADR-004: Configurable Rule Engine Architecture

## Status
Accepted

## Context
Hardcoding command execution logic inside the Discord controller (e.g., `if command == 'report'`) limits adaptability and makes adding rules difficult.

## Decision
We implemented a decoupled, priority-sorted Rule Engine (`RuleEngine.evaluate(input, rules)`).

## Rationale
1. **Dynamic Control Plane**: Rules can be created, updated, or toggled directly from the admin dashboard without redeploying code.
2. **Clear Separation of Concerns**: Interaction routing is separated from business policy evaluation.
