ZWAP V1 SYSTEM SPEC

⸻

1. OVERVIEW

ZWAP is a behavior-based digital utility system designed to convert real-world activity and structured engagement into measurable progression and controlled digital value.

The system is built on two core layers:
	•	zPts (effort layer) — off-chain, non-transferable progression
	•	ZWAP (value layer) — on-chain utility asset

ZWAP does not reward passive presence.

ZWAP rewards:
	•	movement
	•	interaction
	•	completion
	•	contribution

Value is intentionally delayed to:
	•	increase retention
	•	prevent early extraction
	•	reinforce behavioral loops

The system is not an exchange.

The system is:

a structured progression environment that introduces value only after behavior is established

⸻

2. SYSTEM ARCHITECTURE

ZWAP operates as a modular system composed of independent but connected components.

Core Modules
	•	MOVE
	•	PLAY
	•	LEARN
	•	DAILY TASKS
	•	SWAP
	•	SHOP

⸻

Behavioral Systems
	•	TICKER (optional in V1)
	•	STREAM (Phase B)
	•	ASSIST (Phase B)
	•	BADGE SYSTEM (progression identity)

⸻

Expansion Systems
	•	SUBSCRIPTION SYSTEM
	•	GAME SUBMISSION PORTAL (Phase C)

⸻

Flow Structure

User Action
→ zPts Earned
→ reward_service processing
→ caps enforced
→ progression systems triggered
→ conversion eligibility
→ ZWAP unlocked
→ Shop usage
→ Swap (Phase C only)

⸻

3. V1 PRODUCT STRUCTURE

V1 is a controlled rollout designed to establish behavior before introducing value realization.

⸻

ONBOARDING

Entry experience is limited to:
	•	Move
	•	Play
	•	Learn More (About)

Purpose:
	•	immediate interaction
	•	minimal explanation
	•	no cognitive overload

Excluded:
	•	Learn
	•	Stream
	•	Swap

⸻

PHASE A — ACTIVATION (Month 0–2)

Active Systems
	•	Move
	•	Play
	•	Daily Tasks

Unlock
	•	Shop

Purpose
	•	establish habit loop
	•	introduce earning
	•	introduce spending

System State
	•	zPts accumulation begins
	•	reward_service fully active
	•	caps enforced
	•	Swap locked
	•	Learn locked
	•	Stream locked

⸻

PHASE B — EXPANSION (Month 2–7)

Active Systems
	•	Learn
	•	Stream
	•	Assist

Unlocks
	•	Brainz
	•	Werdz

Purpose
	•	deepen engagement
	•	introduce understanding
	•	introduce social presence

System State
	•	increased zPts accumulation
	•	Assist enabled (controlled transfer)
	•	Shop usage increases
	•	Swap remains locked

⸻

PHASE C — REALIZATION (Month 7–10)

Active Systems
	•	Personalization (UI upgrade)
	•	Game Submission Portal

Unlock
	•	Swap

Preconditions
	•	liquidity seeded
	•	shop-first behavior established
	•	sufficient system balance

Purpose
	•	introduce value realization
	•	enable exchange

System State
	•	Swap enabled
	•	conversion meaningful
	•	caps remain enforced

⸻

PHASE D — PREPARATION (Month 10–12)

Focus
	•	economy stabilization
	•	behavioral observation
	•	reward tuning
	•	abuse detection

Output
	•	readiness for V2 expansion

⸻

4. ECONOMY STRUCTURE

⸻

zPts
	•	off-chain
	•	earned through:
	•	Move
	•	Play
	•	Learn
	•	Tasks
	•	non-transferable
	•	exception:
	•	Assist

⸻

ZWAP
	•	on-chain (Polygon)
	•	unlocked via:
	•	conversion
	•	reward systems
	•	used for:
	•	Shop
	•	Swap (Phase C onward)

⸻

Conversion
	•	1,000 zPts → 1 ZWAP
	•	minimum threshold required
	•	irreversible
	•	daily caps enforced

⸻

5. MODULE SYSTEMS

⸻

MOVE
	•	step-based input
	•	progressive reward curve
	•	cooldown enforced
	•	anti-abuse validation

⸻

PLAY
	•	session-based rewards
	•	participation
	•	completion
	•	performance

caps enforced

⸻

LEARN (Phase B)
	•	structured content
	•	lesson completion
	•	quiz validation
	•	module and course rewards

no repeat farming

⸻

DAILY TASKS
	•	Move
	•	Play
	•	Learn
	•	Assist

completion bonus applied

⸻

ASSIST (Phase B)
	•	zPts transfer system
	•	sender must have balance
	•	receiver must accept
	•	caps enforced

⸻

6. REWARD SERVICE

All outputs are processed through reward_service.

Order of execution:
	1.	validate input
	2.	check repeatability
	3.	apply module reward
	4.	enforce module cap
	5.	enforce global cap
	6.	check streak progression
	7.	apply micro rewards
	8.	apply task completion
	9.	apply milestone triggers
	10.	route sponsor logic
	11.	finalize output

⸻

7. SUBSCRIPTION SYSTEM

⸻

Structure
	•	Zwapper (Free)
	•	Zitizen (Plus)

⸻

Function

Subscriptions do not create value.

They:
	•	increase efficiency
	•	expand capacity
	•	unlock access surfaces

⸻

Effects
	•	zPts multiplier (pre-cap)
	•	higher daily caps
	•	higher conversion limits
	•	expanded Assist limits
	•	access to premium systems (future)

⸻

Restrictions

Subscriptions do not:
	•	grant ZWAP directly
	•	remove caps
	•	bypass progression

⸻

8. SWAP SYSTEM

⸻

Role

Swap enables exchange of ZWAP within the ecosystem.

⸻

Availability
	•	locked during Phase A and B
	•	unlocked in Phase C

⸻

Preconditions (from strategy)
	•	liquidity pool established
	•	protocol-owned liquidity accumulated
	•	shop-first economy validated

⸻

Constraints
	•	operates within conversion caps
	•	no unrestricted liquidity extraction
	•	integrated via DEX abstraction

⸻

9. SYSTEM OBJECTIVE

ZWAP V1 is designed to:
	•	establish consistent user behavior
	•	build perceived value before liquidity
	•	prevent early extraction
	•	validate economy stability

⸻

10. TRANSITION TO V2

V2 expands:
	•	Learn depth
	•	ecosystem integrations
	•	sponsor systems
	•	advanced progression systems

V1 must complete:
	•	behavior validation
	•	economy stabilization
	•	retention consistency

before transition.
