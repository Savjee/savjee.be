---
title: "Which is more efficient in traffic: an EV or a gas car?"
date: 2026-06-03
draft: true
tags:
  - Energy
  - EV
quote: "Standing still in a jam, your EV motor does almost nothing—but the heater might. Napkin math for the most efficient non-plug-in hybrid vs a typical EV."
---

I drive an EV now. A few weeks ago I was stuck in traffic, not moving for what felt like forever, and I caught myself wondering: am I wasting less energy than the ICE cars around me—or more?

The short answer is usually **the EV**, especially if you are just sitting there with the climate off. But once you crank the heat on a freezing morning, the picture gets messier. That is the fun part.


## What “idle” even means

When you are at a full stop, the **electric motor does not need to spin**. No fuel, no RPM, no pretending you are driving. The only things sipping from the battery are the computers, lights, and—if you turn them on—HVAC.

A gasoline car is different. Unless you drive something clever like a hybrid that shuts the engine off, the engine **keeps burning fuel** just to stay alive. Accessories (air conditioning, power steering on older cars, alternator) are mostly powered by that running engine.

So we are really comparing:

1. **Propulsion at zero mph** — EV wins by a landslide.
2. **Staying comfortable while parked** — depends on the weather.

## Picking our contestants

The issue said to compare a normal EV to the **most efficient non-plug-in car** you can buy in the U.S.—the kind that still runs on gasoline alone.

For the gas side, that is the **2025 Toyota Prius**—the highest EPA combined rating among 2025 hybrids that do not plug in, at **57 mpg combined**.[^1] It is not a fair fight in the sense that it is still burning gasoline—but it is the boss fight for gas cars at sitting around doing nothing useful.

For the EV side, I will use a **typical modern battery EV**—think ~60–75 kWh battery, heat pump or resistive heat, nothing exotic. Numbers move by model; I will flag where that matters.

## Scenario 1: Mild day, climate off

Here the EV is almost silly efficient.

- **EV:** Roughly **0.1–0.5 kW** (100–500 watts) for electronics and keeping the high-voltage battery happy.[^2] Over an hour that is on the order of **0.1–0.5 kWh** from the pack. At zero mph the motor literally stops—you are only feeding the car’s brain and optional climate.
- **Prius in “Ready” with no HVAC:** The gasoline engine **cycles off entirely** for stretches, then fires briefly to recharge the small hybrid battery. Even in that best case, any engine-on interval burns far more chemical energy than the EV draws as electricity.[^3]

For a **non-hybrid** efficient compact (2.0 L engine), the U.S. Department of Energy cites about **0.16 gallons per hour** idling with **no accessories**.[^4]

Convert that to energy in the tank:

`0.16 gal/hr × 33.7 kWh/gal ≈ 5.4 kWh/hr` of gasoline energy sitting in traffic doing nothing.

Only a fraction of that ever does useful work; the rest is heat and exhaust. fueleconomy.gov puts gasoline engines at **roughly 25–36%** tank-to-wheels efficiency—and idling is worse than driving, because all that energy goes to heat, not motion.[^5]

**Verdict (mild, climate off):** EV, comfortably.

## Scenario 2: Hot day, air conditioning on

Now both cars care about cabin cooling, but they pay differently.

- **EV:** Real-world tests and owner reports commonly land around **1–3 kW** for A/C while parked in heat—call it **1–3 kWh per hour**. One hour-long test in ~36 °C sun saw about **5%** of a ~82 kWh battery gone with A/C maxed (~3 kW indicated).[^6] Lab tests at 95 °F run lower (~0.8–1 kW); real sun load pushes the number up.
- **Gas car:** The engine still has to run to spin the A/C compressor (unless you have a full hybrid strategy). DOE lab tests at 95 °F show about **0.33–0.34 gallons per hour** for a typical ICEV keeping the cabin cool; rule-of-thumb bands of **~0.25–0.5 gal/hr** still show up in anti-idling campaigns.[^5][^7][^12]

In energy terms for a Prius-like hybrid working to keep the cabin cool:

`0.25 gal/hr × 33.7 kWh/gal ≈ 8.4 kWh/hr` of fuel energy

The EV is drawing **~1–3 kWh/hr** of electricity from the battery.

**Verdict (hot, A/C on):** EV still usually wins on energy—by a factor of several—though both can sit a long time before anyone is in real danger. A full EV charge can often outlast a full gas tank for *stationary* comfort if you only count energy in the vehicle.[^8]

## Scenario 3: Cold day, heat on — the plot twist

This is where I assumed EV would win—and learned I was only mostly right.

Gas engines are **terrible** at turning fuel into motion, but they are **excellent** at making waste heat. In winter, your cabin heat is basically space-heater mode on a bonfire you were already paying for—**as long as the engine is running**.

- **Prius in the cold** (outside ~20 °F / −7 °C, cabin ~72 °F): U.S. Department of Energy lab tests measured **0.20–0.22 gallons per hour** for a typical ICEV—about **6.7–7.8 kW** of fuel energy per hour.[^12] Prius owners report similar ranges when the engine cycles to deliver heat; the hybrid battery can sometimes coast through short stretches with less burn.
- **EV:** There is no free waste heat. You heat the cabin with a **heat pump** (more efficient—DOE lab data shows heat pumps cut HVAC draw by roughly **38%** at 20 °F versus resistive-only) or **resistive heaters** (less efficient). Expect roughly **1.5–5 kW** depending on model and how cold it is; DOE lab data shows **~1.8–3.7 kW** for maintaining a warm cabin in cold tests, with short cold-start spikes higher.[^9][^10]

Do the napkin math for a cold hour:

| Vehicle | Rough energy while parked & heating |
|--------|-------------------------------------|
| EV (resistive-ish) | ~2 kWh from the battery |
| EV (cold spike, worst case) | up to ~4–5 kWh for a while |
| Prius | ~0.2 gal × 33.7 ≈ **6.7 kWh** of fuel energy (engine not 100% on the whole hour) |

In **mild cold**, the EV still often beats the Prius on *energy drawn for comfort*. In **extreme cold**, an EV with resistive heat and a small battery can look worse than a hybrid that cleverly cycles its engine—and **range anxiety in a jam** is more about how big your battery is than whether EVs are “efficient” in theory.[^10]

For scale: DOE researchers stuck cars in a lab freezer. At 20 °F, a 60 kWh BEV could hold 72 °F for about **27 hours** while a 16-gallon ICE could go **68–80 hours**—but the EV drew roughly **2–3 kW** versus the gas car’s **7–8 kW** of fuel energy per hour.[^12] More tank hours does not mean less energy per hour.

**Verdict (cold, heat on):** Still often the EV on pure kWh—but the gap shrinks, and **comfort per kWh of fuel** can favor hybrids because waste heat is doing double duty. If you only care about “how much stuff did I burn,” both are sipping; if you care about “how much of my remaining range/tank,” pack size matters more than physics trivia.

## Why electricity *feels* more efficient (and usually is)

Two ideas worth separating:

1. **The motor.** Electric drive is simply better at turning energy into motion when you eventually move again. At zero mph, the motor is off—gas engines are not.
2. **The power plant.** Grid electricity can be cleaner and more efficient than thousands of tiny explosions, but that is a grid-mix argument. For this post, I stayed inside the car.

When you *do* move in stop-and-go traffic, EVs also **recapture energy when braking**. A gas car turns that energy into brake dust and heat. That is a bonus on top of the idle story. (If you want the absurd end of the EV energy rabbit hole, see [how many hamsters it takes to charge a Tesla]({% link collections.trivia, "how-many-hamsters-are-needed-to-charge-a-tesla/index.md" %}).)

## So which one is “using more energy” in traffic?

| Situation | Who uses less energy sitting still? |
|-----------|-------------------------------------|
| Not moving, mild weather, climate off | **EV** — not close |
| Not moving, hot, A/C on | **EV** — typically several× less |
| Not moving, cold, heat on | **EV** — often still less, but **hybrids narrow the gap**; worst-case cold + resistive heat can surprise you |
| Stop-and-go (moving a bit) | **EV** — regen + no idle burn |

For the **most efficient non-plug-in hybrid** vs a **normal EV**, I would still bet on the EV in almost every traffic jam I have been in—including the one that started this question.

The “why” is boring and satisfying at once: **an EV does not need to keep a motor running to exist.** Everything else is HVAC accounting.

## Conclusion

**Standing still in traffic, an EV almost always consumes less energy than even the most efficient non-plug-in hybrid**—unless you are in a very cold climate cranking resistive heat on a small battery, where a clever hybrid can look competitive because waste engine heat is doing you a favor.

I assumed my EV was winning before I ran the numbers. It usually is—but winter taught me the word “efficient” has a footnote.

---

**Social teaser (draft):** Stuck in traffic in my EV, I wondered: am I wasting *less* energy than the gas cars around me? Napkin math says yes—until a cold morning makes waste engine heat look like a cheat code. New trivia: EV vs Prius at 0 mph.

---

[^1]: [fueleconomy.gov — 2025 hybrid vehicles](https://www.fueleconomy.gov/feg/PowerSearch.do?action=alts&pageno=1&srchtyp=yearAfv&vtype=Hybrid&year=2025) — 2025 Toyota Prius FWD: 57 mpg EPA combined, highest among 2025 non-plug-in hybrids.
[^2]: [fueleconomy.gov — Where the Energy Goes: Electric Cars](https://www.fueleconomy.gov/feg/atv-ev.shtml) — motor stops at zero speed; accessories dominate. DOE/ANL 2024 lab: 144–544 W “other” draw with HVAC off.
[^3]: [U.S. DOE — cold weather BEV HVAC report (2024 PDF)](https://www.energy.gov/sites/default/files/2024-10/Impact_of_Cold_Ambient_Temperature_on_BEV_Performance_v15_TechEditFinal_12Sep2024__0.pdf) — hybrid engine cycling; ICEV stationary fuel use. [PriusChat idle thread](https://priuschat.com/threads/what-is-the-hourly-fuel-consumption-for-a-toyota-prius-at-idle.159575/) — anecdotal owner reports.
[^4]: [U.S. DOE Fact #861 — idle fuel consumption](https://www.energy.gov/eere/vehicles/articles/fact-861-february-23-2015-idle-fuel-consumption-selected-gasoline-and-diesel-vehicles) — compact sedan ~0.16 gal/hr, no load.
[^5]: [fueleconomy.gov — Where the Energy Goes](https://www.fueleconomy.gov/feg/atv-ev.shtml) — gasoline engines 25–36% to wheels. [WCNC Verify](https://www.wcnc.com/article/news/verify/electric-vehicle-response-traffic-jam/275-1ac08410-c9cf-40a6-9fd3-c5717af0e737) — ~1 kW EV idle draw cited; ~0.5 gal/hr gas idle rule of thumb.
[^6]: [SoyaCincau — BYD Seal traffic-jam idle test](https://soyacincau.com/2024/04/15/byd-seal-ev-traffic-jam-energy-consumption-idle-standstill-v2l/) — ~3 kW A/C in hot sun; ~5% battery per hour.
[^7]: [fueleconomy.gov — Fuel Economy Myths](https://www.fueleconomy.gov/feg/myths.shtml) — idling can use ¼–½ gal/hr depending on engine size. [South Carolina DHEC idle reduction](https://www.scdhec.gov/environment/your-home/air-quality/anti-idling) — ~0.5 gal/hr passenger idle (campaign materials).
[^8]: [PolitiFact EV traffic jam fact-check](https://www.statesman.com/story/news/politics/politifact/2021/12/13/fact-check-electric-vehicles-more-likely-fail-traffic-jams/6463721001/) — stationary EV range vs ICE fuel use for HVAC.
[^9]: [U.S. DOE — cold weather BEV HVAC report (2024 PDF)](https://www.energy.gov/sites/default/files/2024-10/Impact_of_Cold_Ambient_Temperature_on_BEV_Performance_v15_TechEditFinal_12Sep2024__0.pdf) — heat pump vs resistive power, ~1.8–3.7 kW examples; heat pump ~38% savings at 20 °F.
[^10]: [Recurrent — cold weather idling in an EV](https://www.recurrentauto.com/research/cold-weather-idling-in-an-ev) — ~1.5–2.5 kW heater draw in 15–35 °F for a resistive-heated example.
[^11]: [EPA — Fuel Economy and EV Range Testing](https://www.epa.gov/greenvehicles/fuel-economy-and-ev-range-testing) — 1 gallon gasoline = 33.7 kWh (GGE convention used in napkin math).
[^12]: [U.S. DOE — cold weather BEV HVAC report (2024 PDF)](https://www.energy.gov/sites/default/files/2024-10/Impact_of_Cold_Ambient_Temperature_on_BEV_Performance_v15_TechEditFinal_12Sep2024__0.pdf) — Table 2 stationary runtime and fuel/HVAC draw at 20 °F and 95 °F.
