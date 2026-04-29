import random

class ProxyManager:
    def __init__(self, proxy_list):
        self.proxies = [p.strip() for p in proxy_list if p.strip()]
        self.index = 0

    def get_proxy(self):
        if not self.proxies:
            return None
        proxy = self.proxies[self.index % len(self.proxies)]
        self.index += 1
        return {
            'server': proxy,
            'username': '',
            'password': ''
        }