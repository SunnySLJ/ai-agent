from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Protocol


class WebSearchError(RuntimeError):
    pass


@dataclass(frozen=True)
class WebSearchResult:
    title: str
    url: str
    snippet: str
    score: float = 0.0
    provider: str = "unknown"


class WebSearchClient(Protocol):
    provider_name: str

    def search(self, query: str, *, limit: int = 5) -> list[WebSearchResult]: ...


class TavilySearchClient:
    provider_name = "tavily"

    def __init__(
        self,
        api_key: str,
        *,
        search_depth: str = "basic",
        timeout_seconds: float = 20,
    ) -> None:
        self._api_key = api_key
        self._search_depth = search_depth
        self._timeout_seconds = timeout_seconds

    def search(self, query: str, *, limit: int = 5) -> list[WebSearchResult]:
        payload = {
            "api_key": self._api_key,
            "query": query,
            "search_depth": self._search_depth,
            "max_results": max(1, min(limit, 10)),
        }
        request = urllib.request.Request(
            "https://api.tavily.com/search",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout_seconds) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise WebSearchError(f"Tavily HTTP {exc.code}: {detail[:240]}") from exc
        except urllib.error.URLError as exc:
            raise WebSearchError(f"Tavily request failed: {exc.reason}") from exc

        results: list[WebSearchResult] = []
        for index, item in enumerate(body.get("results", [])):
            if not isinstance(item, dict):
                continue
            title = str(item.get("title", "")).strip() or f"Result {index + 1}"
            url = str(item.get("url", "")).strip()
            snippet = str(item.get("content", item.get("snippet", ""))).strip()
            if not url or not snippet:
                continue
            score = float(item.get("score", 0.0) or 0.0)
            results.append(
                WebSearchResult(
                    title=title,
                    url=url,
                    snippet=snippet[:500],
                    score=score,
                    provider=self.provider_name,
                )
            )
        return results[:limit]


class SerperSearchClient:
    provider_name = "serper"

    def __init__(self, api_key: str, *, timeout_seconds: float = 20) -> None:
        self._api_key = api_key
        self._timeout_seconds = timeout_seconds

    def search(self, query: str, *, limit: int = 5) -> list[WebSearchResult]:
        payload = {"q": query, "num": max(1, min(limit, 10))}
        request = urllib.request.Request(
            "https://google.serper.dev/search",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "X-API-KEY": self._api_key,
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout_seconds) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise WebSearchError(f"Serper HTTP {exc.code}: {detail[:240]}") from exc
        except urllib.error.URLError as exc:
            raise WebSearchError(f"Serper request failed: {exc.reason}") from exc

        organic = body.get("organic", [])
        results: list[WebSearchResult] = []
        for index, item in enumerate(organic):
            if not isinstance(item, dict):
                continue
            title = str(item.get("title", "")).strip() or f"Result {index + 1}"
            url = str(item.get("link", "")).strip()
            snippet = str(item.get("snippet", "")).strip()
            if not url or not snippet:
                continue
            results.append(
                WebSearchResult(
                    title=title,
                    url=url,
                    snippet=snippet[:500],
                    score=max(0.0, 1.0 - index * 0.08),
                    provider=self.provider_name,
                )
            )
        return results[:limit]


def web_search_client_from_env() -> WebSearchClient | None:
    provider = os.environ.get("WEB_SEARCH_PROVIDER", "").strip().lower()
    tavily_key = os.environ.get("TAVILY_API_KEY", "").strip()
    serper_key = os.environ.get("SERPER_API_KEY", "").strip()

    if provider == "serper" and serper_key:
        return SerperSearchClient(serper_key)
    if provider == "tavily" and tavily_key:
        return TavilySearchClient(tavily_key)
    if tavily_key:
        return TavilySearchClient(tavily_key)
    if serper_key:
        return SerperSearchClient(serper_key)
    return None
