# Supabase schema + RLS

## Table

```sql
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text not null,
  time text not null,
  location text not null,
  message text,
  game_type text not null default 'fishing',
  game_config jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  creator_token text not null,
  created_at timestamp with time zone default now()
);
```

```sql
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references invites(id) on delete cascade,
  name text,
  status text not null check (status in ('going', 'cant_go')),
  created_at timestamp with time zone default now()
);
```

## RLS

```sql
alter table invites enable row level security;
alter table rsvps enable row level security;
```

### Public insert

```sql
create policy "Public can insert invites"
on invites
for insert
to public
with check (true);
```

### Public select published only

```sql
create policy "Public can read published invites"
on invites
for select
to public
using (published = true);
```

```sql
create policy "Public can insert rsvps"
on rsvps
for insert
to public
with check (true);
```

```sql
create policy "Public can read rsvps"
on rsvps
for select
to public
using (true);
```

## Notes

- Unpublished invites are fetched via the `invite-preview` API using the
  service role key and `creator_token`.
- No updates/deletes are exposed to anon clients.
