// Connector registry. Each connector reads one source into a Signal; the
// registry fuses them into a Situation the Oracle can triangulate.
//
// Real connectors use what a browser exposes. Gmail / calendar / health /
// phone can't be read from a web app without OAuth or native bridges, so they
// are simulated providers behind the same interface — swap in the real source
// later without touching the Oracle or the UI.

import type { Signal, Situation } from "../types";
import { readTime, dayPartOf, weekdayOf } from "./time";
import { readWeather } from "./weather";
import { readLocation } from "./location";
import { readDevice } from "./device";
import { readEmail } from "./email.sim";
import { readCalendar } from "./calendar.sim";
import { readHealth } from "./health.sim";
import { readPhone } from "./phone.sim";

type Connector = () => Promise<Signal | null>;

const CONNECTORS: Connector[] = [
  readTime,
  readLocation,
  readWeather,
  readCalendar,
  readEmail,
  readHealth,
  readPhone,
  readDevice,
];

export async function gatherSituation(): Promise<Situation> {
  const now = new Date(Date.now());
  const results = await Promise.all(
    CONNECTORS.map((c) => c().catch(() => null)),
  );
  const signals = results.filter((s): s is Signal => s != null);
  return {
    at: now.toISOString(),
    dayPart: dayPartOf(now),
    weekday: weekdayOf(now),
    signals,
  };
}
