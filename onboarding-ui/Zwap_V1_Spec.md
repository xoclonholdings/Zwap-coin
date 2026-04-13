
ZWAP V1 SYSTEM SPEC (REVISED)





1. OVERVIEW


ZWAP is a behavior-based digital utility system designed to convert real-world activity and structured engagement into measurable progression and controlled digital value.

The system is built on two core layers:

zPts (effort layer) — off-chain, non-transferable progression
ZWAP (value layer) — on-chain utility asset





Behavioral Principle


ZWAP does not reward passive presence.

ZWAP rewards:

movement
interaction
completion
contribution





Value Strategy


Value is intentionally delayed to:

increase retention
prevent early extraction
reinforce behavioral loops





System Identity


ZWAP is not an exchange.

ZWAP is:

a structured progression environment that introduces value only after behavior is established




2. SYSTEM ARCHITECTURE


ZWAP operates as a modular system composed of independent but connected components.




Core Modules


MOVE
PLAY
LEARN
DAILY TASKS
SHOP
SWAP





Behavioral Systems


TICKER (optional in V1)
STREAM (Phase B)
ASSIST (Phase B)
BADGE SYSTEM (progression identity)





Expansion Systems


SUBSCRIPTION SYSTEM
GAME SUBMISSION PORTAL (Phase C)





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




3. V1 PRODUCT STRUCTURE


V1 is a controlled rollout designed to establish behavior before introducing value realization.




ONBOARDING


Entry experience is limited to:

Move
Play
Learn More (About)





Purpose


immediate interaction
minimal explanation
no cognitive overload





Excluded


Learn
Stream
Swap





4. V1 INTERACTION MODEL (CRITICAL)


ZWAP V1 does not use traditional navigation or module-based screens.

The system is built as a single interaction surface composed of four system windows.




Dashboard Structure



Header


Displays:

daily progression (single progress bar)
zPts balance
account access





Body (2x2 Grid)


Move
Play
Shop
ZWAP





Core Principle


Each window exposes exactly one primary system interaction and one alternate state.

No window acts as a menu, dashboard card, or multi-function surface.




Window State Model (GLOBAL RULE)


Each window contains exactly two states:

a primary interaction state
a secondary alternate state accessed via horizontal swipe


States are mutually exclusive.

Only one state is visible at a time.




Interaction Language


Tap → executes primary action
Swipe → reveals alternate state of the same system





5. WINDOW DEFINITIONS (LOCKED)





MOVE



State 1 — Action


Start / Stop movement tracking (ring)



State 2 — Stats


Session Steps
Calories
Timer





Rules


No stats in header duplication
No additional controls
Stats represent current or last session only





PLAY



State 1 — Current Game


One game visible
Start overlay



State 2 — Alternate Game


Swipe replaces current game
Same structure





Rules


Only one game visible at a time
No game grid or selection UI
No browsing behavior





SHOP



State 1 — Current Item


One item visible



State 2 — Alternate Item


Swipe replaces item





Rules


No catalog view
No scrolling list
No multi-item display
Purchase handled via modal





ZWAP (SYSTEM WINDOW)


ZWAP is the only system intelligence layer.




State 1 — System Voice


guidance
feedback
suggestions


Examples:

“You just earned.”
“Keep going.”
“Ready when you are.”





State 2 — Task Structure


Login
Move
Play
Learn (locked in Phase A)





Rules


No mixing of voice and task states
Only one message or structure visible at a time
All system meaning lives here





Core Rule


All guidance, feedback, and system interpretation exists exclusively within the ZWAP window.




6. PHASE STRUCTURE





PHASE A — ACTIVATION (Month 0–2)



Active Systems


Move
Play
Daily Tasks (via ZWAP window)





Unlock


Shop





Purpose


establish habit loop
introduce earning
introduce spending





System State


zPts accumulation active
reward_service fully active
caps enforced
Swap locked
Learn locked
Stream locked





PHASE B — EXPANSION (Month 2–7)



Active Systems


Learn
Stream
Assist





Unlocks


Brainz
Werdz





Purpose


deepen engagement
introduce understanding
introduce social presence





PHASE C — REALIZATION (Month 7–10)



Unlock


Swap





Preconditions


liquidity seeded
shop-first behavior established
system balance validated





Purpose


introduce value realization
enable exchange





PHASE D — PREPARATION (Month 10–12)



Focus


economy stabilization
behavioral observation
reward tuning
abuse detection





7. ECONOMY STRUCTURE





zPts


off-chain
earned through: 
Move
Play
Learn
Tasks

non-transferable
exception: Assist





ZWAP


on-chain (Polygon)
unlocked via: 
conversion
reward systems

used for: 
Shop
Swap (Phase C onward)






Conversion


1,000 zPts → 1 ZWAP
minimum threshold required
irreversible
daily caps enforced





8. MODULE SYSTEMS





MOVE


step-based input
progressive reward curve
cooldown enforced
anti-abuse validation





PLAY


session-based rewards
participation
completion
performance
caps enforced





LEARN (Phase B)


structured content
lesson + quiz validation
module and course rewards
no repeat farming





DAILY TASKS


Move
Play
Learn
Assist





IMPORTANT


Tasks are not a separate surface.
They are presented only within the ZWAP window.




ASSIST (Phase B)


zPts transfer system
sender must have balance
receiver must accept
caps enforced





9. REWARD SERVICE


All outputs are processed through reward_service.

Execution order:

validate input
check repeatability
apply module reward
enforce module cap
enforce global cap
check streak progression
apply micro rewards
apply task completion
apply milestone triggers
route sponsor logic
finalize output





10. SUBSCRIPTION SYSTEM





Structure


Zwapper (Free)
Zitizen (Plus)





Function


Subscriptions do not create value.

They:

increase efficiency
expand capacity
unlock access surfaces





Effects


zPts multiplier (pre-cap)
higher daily caps
higher conversion limits
expanded Assist limits





Restrictions


Subscriptions do not:

grant ZWAP directly
remove caps
bypass progression





11. SWAP SYSTEM





Role


Swap enables exchange of ZWAP within the ecosystem.




Availability


locked during Phase A and B
unlocked in Phase C





Constraints


operates within conversion caps
no unrestricted extraction
integrated via DEX abstraction





12. SYSTEM OBJECTIVE


ZWAP V1 is designed to:

establish consistent user behavior
build perceived value before liquidity
prevent early extraction
validate economy stability





13. TRANSITION TO V2


V2 expands:

Learn depth
ecosystem integrations
sponsor systems
advanced progression systems





Requirement Before Transition


V1 must complete:

behavior validation
economy stabilization
retention consistency





🔒 FINAL NOTE (SYSTEM INTEGRITY)


ZWAP V1 is defined by:

single-surface interaction
one-action-per-window design
centralized system intelligence (ZWAP)
delayed value realization


Deviation from these principles results in system fragmentation.