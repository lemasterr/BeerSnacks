-- Failed admin logins, for rate limiting (D1, not KV: KV allows only 1000 writes a day on the free plan,
-- so counting failures there would let a password-guesser use up the quota the admin needs).
CREATE TABLE login_failures (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT    NOT NULL,
  at      INTEGER NOT NULL
);
CREATE INDEX login_failures_ip ON login_failures(ip_hash, at);
CREATE INDEX login_failures_at ON login_failures(at);
