const moves: [string, string][] = [
  ["nobat.token", "agent.token"],
  ["nobat.user", "agent.user"],
  ["nobat.theme", "agent.theme"],
  ["nobat.visitor", "agent.visitor"],
  ["nobatak.business", "agent.business"],
];

const prefixes: [string, string][] = [
  ["nobat.page-design.", "agent.page-design."],
  ["nobat.page-blocks.", "agent.page-blocks."],
  ["nobat.page-image.", "agent.page-image."],
];

function move(store: Storage, from: string, to: string) {
  try {
    if (store.getItem(to) != null) return;
    const value = store.getItem(from);
    if (value != null) store.setItem(to, value);
  } catch {
    /* storage can be blocked */
  }
}

function movePrefix(store: Storage, from: string, to: string) {
  try {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key?.startsWith(from)) keys.push(key);
    }
    for (const key of keys) move(store, key, to + key.slice(from.length));
  } catch {
    /* ignore */
  }
}

export function migrateAgentStorage() {
  if (typeof window === "undefined") return;
  for (const [from, to] of moves) move(localStorage, from, to);
  for (const [from, to] of prefixes) movePrefix(localStorage, from, to);
  move(sessionStorage, "nobat.customers.q", "agent.customers.q");
}

migrateAgentStorage();
