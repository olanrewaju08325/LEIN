import os
from typing import Any, cast

from dotenv import load_dotenv
from supabase import create_client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set in .env")

if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY is not set in .env")


# Wrap the real client with a lightweight proxy so callers who do
# `supabase.table(...).select(...)` will see an `Any`-typed table
# request builder. This avoids static type-checker complaints where
# the library exposes a builder type that isn't callable in stubs.
class SupabaseProxy:
    def __init__(self, client: Any) -> None:
        self._client = client

    def table(self, name: str) -> Any:
        # Cast to Any so `.select(...)` calls are allowed by type checkers
        return cast(Any, self._client.table(name))

    def __getattr__(self, item: str):
        return getattr(self._client, item)


_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
supabase = SupabaseProxy(_client)
