# Postgres Connect Session Store

You know the drill

```javascript
app.use(express.session({
  store:  new PGSessionStore({ connStr: 'my_pg_connection_string' })
, secret: 'ohai'
, cookie: { maxAge: new Date(3000, 0, 1) }
}));
```
