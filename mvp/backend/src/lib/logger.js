export function log(level, message, context = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context
  };
  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (m, c) => log('info', m, c),
  warn: (m, c) => log('warn', m, c),
  error: (m, c) => log('error', m, c)
};
