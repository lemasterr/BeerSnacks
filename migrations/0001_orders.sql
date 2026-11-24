-- Pickup orders. Money is stored in cents. Times are Unix milliseconds.
CREATE TABLE orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL UNIQUE,          -- BS-1001, shown to the customer and used as the payment reference
  token       TEXT    NOT NULL,                 -- secret for the customer's status page
  status      TEXT    NOT NULL DEFAULT 'new',   -- new | paid | ready | done | cancelled | expired
  store       TEXT    NOT NULL,                 -- store field, e.g. stock_mahtra
  store_name  TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  email       TEXT    NOT NULL DEFAULT '',
  pay         TEXT    NOT NULL,                 -- iban | cash
  comment     TEXT    NOT NULL DEFAULT '',
  items       TEXT    NOT NULL,                 -- JSON: [{id, name, size, qty, price, alcohol}]
  total       INTEGER NOT NULL,                 -- cents
  has_alcohol INTEGER NOT NULL DEFAULT 0,
  lang        TEXT    NOT NULL DEFAULT 'et',
  ip_hash     TEXT    NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  pay_by      INTEGER,                          -- IBAN orders: pay before this time
  pickup_by   INTEGER                           -- set when the order becomes ready
);
CREATE INDEX orders_updated ON orders(updated_at);
CREATE INDEX orders_status ON orders(status);
CREATE INDEX orders_ip ON orders(ip_hash, created_at);

CREATE TABLE order_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id),
  at         INTEGER NOT NULL,
  status     TEXT    NOT NULL,
  by         TEXT    NOT NULL,                  -- customer | admin | system
  note       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX order_events_order ON order_events(order_id);
