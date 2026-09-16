#!/usr/bin/env python3
"""Cross-check the i18n keys in index.html against the dictionaries in buzz3.js.

The site translates by attribute: an element carries `data-i18n="some.key"` (or
`data-i18n-alt` / `-placeholder` / `-aria-label` / `-title`) and setLanguage()
looks that key up in the active dictionary. The lookup is deliberately silent --
`if (translations[lang] && translations[lang][key])` -- so a key that does not
exist simply leaves the English text in place. Nothing throws, nothing logs, and
the page still looks plausible. That makes a missing or misspelled key invisible
until somebody notices that one string did not switch language.

This script turns that silence into a failure. It reports:

  * keys referenced in index.html that are missing from a dictionary  -> ERROR
  * keys present in some dictionaries but not others                   -> ERROR
  * duplicate keys inside one dictionary (the later one silently wins) -> ERROR
  * keys defined but never referenced from HTML                        -> note

The last group is only a note: several keys (typing.*, contact.*, tg.*) are read
directly from JS and are legitimately absent from the markup.

Usage
  python tools/check-i18n.py [--html index.html] [--js buzz3.js]
Exit code is 1 when any ERROR is found, so it can gate a commit.
"""
import argparse
import re
import sys
from collections import OrderedDict

# `data-i18n`, `data-i18n-alt`, `data-i18n-placeholder`, ... -> the attribute name
ATTR_RE = re.compile(r'data-i18n(?:-[\w-]+)?\s*=\s*"([^"]+)"')
# a dictionary entry: 'some.key': 'value',
ENTRY_RE = re.compile(r"^\s*'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*$")
# start of a locale block: `  en: {`
LOCALE_RE = re.compile(r'^\s{2}([A-Za-z_][\w-]*)\s*:\s*\{\s*$')
# the dictionary literal itself. Scoping matters: SITE_CONFIG also has a nested
# object at two-space indent (`socials: {`), which otherwise parses as a locale
# and makes every real key look missing.
DICT_START_RE = re.compile(r'^const\s+translations\s*=\s*\{')
DICT_END_RE = re.compile(r'^\s*\};')


def parse_html(path):
    """All i18n keys referenced from markup, with the line they appear on."""
    refs = OrderedDict()
    with open(path, encoding='utf-8') as fh:
        for lineno, line in enumerate(fh, 1):
            for key in ATTR_RE.findall(line):
                refs.setdefault(key, []).append(lineno)
    return refs


def parse_js(path):
    """{locale: {key: value}} plus {locale: [duplicated keys]}."""
    locales, dups = OrderedDict(), OrderedDict()
    current = None
    inside = False
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            if not inside:
                if DICT_START_RE.match(line):
                    inside = True
                continue
            if DICT_END_RE.match(line):
                break
            m = LOCALE_RE.match(line)
            if m:
                current = m.group(1)
                locales.setdefault(current, OrderedDict())
                dups.setdefault(current, [])
                continue
            if current is None:
                continue
            m = ENTRY_RE.match(line)
            if not m:
                continue
            key, value = m.group(1), m.group(2)
            if key in locales[current]:
                dups[current].append(key)
            locales[current][key] = value
    return locales, dups


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--html', default='index.html')
    ap.add_argument('--js', default='buzz3.js')
    args = ap.parse_args()

    refs = parse_html(args.html)
    locales, dups = parse_js(args.js)
    if not locales:
        sys.exit(f'could not parse any locale block out of {args.js}')

    names = list(locales)
    print(f'{args.html}: {len(refs)} distinct i18n keys referenced')
    print(f'{args.js}: locales {" / ".join(names)}')
    for name in names:
        print(f'  {name}: {len(locales[name])} keys')
    print()

    errors = 0

    # ---- 1. every referenced key must exist in every locale ----
    missing = [(k, n) for k in refs for n in names if k not in locales[n]]
    if missing:
        errors += len(missing)
        print(f'ERROR  {len(missing)} referenced key(s) not found:')
        for key, name in missing:
            lines = ','.join(str(x) for x in refs[key][:4])
            print(f'  [{name}] {key}   ({args.html}:{lines})')
        print()

    # ---- 2. dictionaries must agree with each other ----
    union = OrderedDict((k, None) for n in names for k in locales[n])
    uneven = [(k, [n for n in names if k not in locales[n]]) for k in union]
    uneven = [(k, miss) for k, miss in uneven if miss]
    if uneven:
        errors += len(uneven)
        print(f'ERROR  {len(uneven)} key(s) missing from some locales:')
        for key, miss in uneven:
            print(f'  {key}   missing in: {", ".join(miss)}')
        print()

    # ---- 3. duplicate keys inside one dictionary ----
    if any(dups[n] for n in names):
        errors += sum(len(dups[n]) for n in names)
        print('ERROR  duplicate key(s) inside a dictionary '
              '(the later definition silently wins):')
        for name in names:
            for key in dups[name]:
                print(f'  [{name}] {key}')
        print()

    # ---- 4. defined but unreferenced (informational) ----
    unused = [k for k in union if k not in refs]
    if unused:
        print(f'note   {len(unused)} key(s) defined but not referenced from {args.html} '
              f'(fine if read directly from JS):')
        for key in unused:
            print(f'  {key}')
        print()

    if errors:
        print(f'FAILED with {errors} error(s)')
        return 1
    print('OK - every referenced key resolves in every locale')
    return 0


if __name__ == '__main__':
    sys.exit(main())
