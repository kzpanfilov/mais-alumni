#!/usr/bin/env python3
"""
One-time Yandex.Disk OAuth setup for Mais Alumni photos.

How to get a token:
1. Go to https://yandex.com/dev/disk/poligon/
2. Log in with your Yandex account
3. Click "Get OAuth Token" button
4. Copy the token from the URL (the part after #access_token=)
5. Paste it below
"""

import os
import json
import webbrowser

TOKEN_PATH = os.path.expanduser("~/.config/yandex-disk-token.json")
POLYGON_URL = "https://yandex.com/dev/disk/poligon/"


def save_token(token):
    os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)
    with open(TOKEN_PATH, "w") as f:
        json.dump({"token": token.strip()}, f)
    print(f"Token saved to {TOKEN_PATH}")


def main():
    print("=" * 60)
    print("Yandex.Disk Authorization for Mais Alumni Photos")
    print("=" * 60)
    print()
    print("Step 1: Open Yandex.Disk API Polygon in your browser")
    print(f"  URL: {POLYGON_URL}")
    print()

    try:
        webbrowser.open(POLYGON_URL)
        print("  (Browser opened automatically)")
    except Exception:
        print("  (Open the URL manually in your browser)")

    print()
    print("Step 2: Click 'Get OAuth Token' button on the page")
    print("Step 3: Authorize the application")
    print("Step 4: Copy the token from the URL bar")
    print("         (the part between #access_token= and &)")
    print()
    token = input("Paste your token here: ").strip()

    if not token:
        print("No token provided. Exiting.")
        return

    save_token(token)

    import yadisk
    try:
        client = yadisk.Client(token=token)
        with client:
            if client.check_token():
                info = client.get_disk_info()
                used_mb = info.used_space / (1024 * 1024)
                total_mb = info.total_space / (1024 * 1024)
                print()
                print(f"Token is valid!")
                print(f"Disk space: {used_mb:.1f} MB / {total_mb:.1f} MB")
            else:
                print("Token is invalid. Try again.")
                return
    except Exception as e:
        print(f"Error checking token: {e}")
        return

    from yandex_disk import ensure_dirs
    ensure_dirs()
    print()
    print("Setup complete! Yandex.Disk is ready for photo backup.")


if __name__ == "__main__":
    main()
