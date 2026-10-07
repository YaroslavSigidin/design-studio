"""Check crawler-visible HTML, schema, and local links for every sitemap page."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://soglasovano.online"

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.title, self.schemas = [], "", []
        self.in_title = self.in_schema = False
        self.schema = ""
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == "title": self.in_title = True
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_schema, self.schema = True, ""
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
        if tag == "script" and self.in_schema:
            self.schemas.append(json.loads(self.schema))
            self.in_schema = False
    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_schema: self.schema += data

urls = [e.text for e in ET.parse(ROOT / "sitemap.xml").iter() if e.tag.endswith("}loc")]
assert len(urls) == len(set(urls)), "Duplicate sitemap URLs"
titles = set()
for url in urls:
    assert url.startswith(ORIGIN + "/"), url
    file = ROOT / unquote(urlsplit(url).path.lstrip("/"))
    if file.is_dir(): file /= "index.html"
    page = Page()
    page.feed(file.read_text())
    assert page.title and page.title not in titles, f"Missing/duplicate title: {file}"
    titles.add(page.title)
    assert sum(tag == "h1" for tag, _ in page.tags) == 1, f"H1 count: {file}"
    canonicals = [a.get("href") for t, a in page.tags if t == "link" and a.get("rel") == "canonical"]
    assert canonicals == [url], f"Canonical mismatch: {file}"
    descriptions = [a.get("content") for t, a in page.tags if t == "meta" and a.get("name") == "description"]
    assert len(descriptions) == 1 and descriptions[0], f"Description: {file}"
    assert not any(t == "meta" and a.get("name") == "robots" and "noindex" in a.get("content", "") for t, a in page.tags), file
    if file.name not in ("privacy.html", "terms.html"):
        assert page.schemas, f"Missing schema: {file}"
    for tag, attrs in page.tags:
        if tag == "img": assert "alt" in attrs, f"Missing alt: {file}"
        value = attrs.get("src") if tag in ("img", "script") else attrs.get("href") if tag in ("a", "link") else None
        if not value or value.startswith(("#", "tel:", "mailto:", "data:", "javascript:")): continue
        parsed = urlsplit(value)
        if parsed.netloc and parsed.netloc != "soglasovano.online": continue
        path = unquote(parsed.path)
        target = ROOT / path.lstrip("/") if path.startswith("/") or parsed.netloc else file.parent / path
        assert target.exists(), f"Broken local link: {file}: {value}"
print(f"PASS: {len(urls)} sitemap pages; unique titles, descriptions, canonicals, H1, schema, image alt and local links.")
