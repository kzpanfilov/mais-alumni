#!/usr/bin/env python3
"""
Yandex.Disk backup module for Mais Alumni photos.
Uploads photos to Yandex.Disk and generates permanent public links.
"""

import os
import sys
import json
import threading
import yadisk

TOKEN_PATH = os.path.expanduser("~/.config/yandex-disk-token.json")
REMOTE_BASE = "/mais-alumni"


def get_token():
    if not os.path.exists(TOKEN_PATH):
        raise FileNotFoundError(
            f"Token not found at {TOKEN_PATH}\n"
            "Run yandex_auth.py first to authorize."
        )
    with open(TOKEN_PATH) as f:
        return json.load(f)["token"]


def get_client():
    token = get_token()
    return yadisk.Client(token=token)


def upload_file(local_path, remote_path):
    client = get_client()
    try:
        with client:
            os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)
            client.upload(local_path, remote_path, overwrite=True)
            return True
    except Exception as e:
        print(f"[Yandex.Disk] Upload error: {e}")
        return False


def share_file(remote_path):
    client = get_client()
    try:
        with client:
            client.publish(remote_path)
            meta = client.get_meta(remote_path)
            link = meta.public_url
            return link
    except Exception as e:
        print(f"[Yandex.Disk] Share error: {e}")
        return None


def backup_file(local_path, folder="gallery"):
    filename = os.path.basename(local_path)
    remote_path = f"{REMOTE_BASE}/{folder}/{filename}"

    if upload_file(local_path, remote_path):
        url = share_file(remote_path)
        if url:
            print(f"[Yandex.Disk] Backed up: {folder}/{filename} -> {url}")
            return url
        else:
            print(f"[Yandex.Disk] Uploaded but share failed: {remote_path}")
            return None
    return None


def backup_file_async(local_path, folder="gallery"):
    thread = threading.Thread(
        target=backup_file, args=(local_path, folder), daemon=True
    )
    thread.start()
    return thread


def ensure_dirs():
    client = get_client()
    try:
        with client:
            try:
                client.mkdir(REMOTE_BASE)
            except yadisk.exceptions.PathExistsError:
                pass
            for sub in ["classmates", "max", "gallery", "videos"]:
                remote = f"{REMOTE_BASE}/{sub}"
                try:
                    client.mkdir(remote)
                except yadisk.exceptions.PathExistsError:
                    pass
            print("[Yandex.Disk] Directory structure ensured")
    except Exception as e:
        print(f"[Yandex.Disk] Error creating dirs: {e}")


def test_connection():
    try:
        client = get_client()
        with client:
            info = client.get_disk_info()
            used_mb = info.used_space / (1024 * 1024)
            total_mb = info.total_space / (1024 * 1024)
            print(f"[Yandex.Disk] Connected! Used: {used_mb:.1f} MB / {total_mb:.1f} MB")
            return True
    except Exception as e:
        print(f"[Yandex.Disk] Connection error: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            test_connection()
        elif sys.argv[1] == "init":
            ensure_dirs()
            test_connection()
        elif sys.argv[1] == "backup" and len(sys.argv) >= 4:
            url = backup_file(sys.argv[2], sys.argv[3])
            if url:
                print(f"Public URL: {url}")
        else:
            print("Usage: yandex_disk.py [test|init|backup <file> <folder>]")
    else:
        test_connection()
