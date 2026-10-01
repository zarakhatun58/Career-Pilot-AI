from dataclasses import dataclass
from itertools import cycle
from threading import Lock


@dataclass(frozen=True)
class ProxyConfig:
    """
    Configuration for an explicitly authorized proxy endpoint.

    Example:
        http://127.0.0.1:8080

    Authentication can optionally be supplied separately.
    """

    server: str
    username: str | None = None
    password: str | None = None

    def to_playwright_proxy(self) -> dict[str, str]:
        proxy: dict[str, str] = {
            "server": self.server,
        }

        if self.username:
            proxy["username"] = self.username

        if self.password:
            proxy["password"] = self.password

        return proxy


class ProxyManager:
    """
    Simple round-robin proxy manager.

    The manager only rotates through proxies explicitly supplied
    by the application. It does not discover, scrape, or bypass
    proxy restrictions automatically.
    """

    def __init__(
        self,
        proxies: list[ProxyConfig] | None = None,
    ) -> None:
        self._proxies = proxies or []
        self._lock = Lock()

        self._iterator = (
            cycle(self._proxies)
            if self._proxies
            else None
        )

    @property
    def enabled(self) -> bool:
        return bool(self._proxies)

    @property
    def count(self) -> int:
        return len(self._proxies)

    def get_next(self) -> ProxyConfig | None:
        """
        Return the next configured proxy using round-robin selection.

        Returns None when no proxy is configured, meaning the browser
        should use a direct connection.
        """

        if self._iterator is None:
            return None

        with self._lock:
            return next(self._iterator)

    def get_proxy_for_target(
        self,
        target_id: int,
    ) -> ProxyConfig | None:
        """
        Select a proxy for a target.

        target_id is accepted so the selection API can later be
        extended with deterministic target/session routing.
        """

        del target_id

        return self.get_next()

    def describe(self) -> dict:
        return {
            "enabled": self.enabled,
            "proxy_count": self.count,
            "mode": (
                "round_robin"
                if self.enabled
                else "direct"
            ),
        }