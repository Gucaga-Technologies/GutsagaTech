#!/usr/bin/env python3
"""
Fill the 21 industry photo slots (and the 2 news slots) automatically.

WHY THIS RUNS ON YOUR MACHINE, NOT IN THE CHAT
----------------------------------------------
The assistant's sandbox blocks every image host (Pexels, Unsplash, Wikimedia and
any client CDN), so it cannot download photos. Your own machine has no such
block, so this script does it in one command.

USAGE
-----
1. Get a free API key: https://www.pexels.com/api/  (takes ~1 minute, no card)
2. pip install requests pillow
3. python scripts/get-industry-photos.py --key YOUR_PEXELS_KEY
   (or set PEXELS_API_KEY in the environment and run it with no arguments)

Options
   --key KEY        Pexels API key
   --only slug,slug Fetch just these industries
   --force          Overwrite photos that are already there
   --dry-run        Show what it would fetch, download nothing

The photos land in assets/img-ind/<slug>.jpg at 1200x675, centre-cropped.
The pages already point at those paths, so a refresh is all it takes.
Pexels photos are free for commercial use and need no attribution, but the
script prints the photographer for each one so you can credit them if you want.
"""
import argparse, os, sys, io, json

QUERIES = {
  "pharmacy":        "modern pharmacy interior shelves",
  "pharma-wholesale":"pharmaceutical warehouse boxes",
  "fmcg":            "supermarket aisle shelves groceries",
  "food-production": "food production factory line",
  "beverages":       "beverage bottles warehouse distribution",
  "automotive":      "car parts warehouse shelves",
  "construction":    "construction materials warehouse",
  "hardware-diy":    "hardware store tools aisle",
  "beauty":          "cosmetics store shelves",
  "fashion":         "clothing store racks retail",
  "electronics":     "electronics store appliances display",
  "pet":             "pet supplies store shelves",
  "garden":          "garden centre plants shop",
  "toys":            "toy store shelves children",
  "sporting":        "sporting goods store equipment",
  "furniture":       "furniture showroom store",
  "books-office":    "stationery office supplies store",
  "medical-optics":  "optical store glasses display",
  "industrial":      "industrial supplies warehouse racking",
  "distribution":    "distribution centre forklift pallets",
  "ecommerce":       "ecommerce fulfilment packing parcels",
}
W, H = 1200, 675

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default=os.environ.get("PEXELS_API_KEY"))
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if not a.key and not a.dry_run:
        sys.exit("No API key. Get one free at https://www.pexels.com/api/ then\n"
                 "  python scripts/get-industry-photos.py --key YOUR_KEY")

    try:
        import requests
        from PIL import Image
    except ImportError:
        sys.exit("Missing packages. Run:  pip install requests pillow")

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(root, "assets", "img-ind")
    os.makedirs(out_dir, exist_ok=True)

    wanted = [s.strip() for s in a.only.split(",") if s.strip()] or list(QUERIES)
    done = skipped = failed = 0

    for slug in wanted:
        query = QUERIES.get(slug)
        if not query:
            print(f"  ?  {slug}: not a known industry slug"); continue
        dest = os.path.join(out_dir, slug + ".jpg")
        if os.path.exists(dest) and not a.force:
            print(f"  =  {slug}: already there (use --force to replace)"); skipped += 1; continue
        if a.dry_run:
            print(f"  ~  {slug}: would search \"{query}\""); continue
        try:
            r = requests.get("https://api.pexels.com/v1/search",
                             headers={"Authorization": a.key},
                             params={"query": query, "orientation": "landscape",
                                     "size": "large", "per_page": 5},
                             timeout=30)
            r.raise_for_status()
            photos = r.json().get("photos", [])
            if not photos:
                print(f"  x  {slug}: nothing found for \"{query}\""); failed += 1; continue
            photo = photos[0]
            img = requests.get(photo["src"]["large2x"], timeout=60)
            img.raise_for_status()
            im = Image.open(io.BytesIO(img.content)).convert("RGB")
            # centre-crop to 16:9, then resize
            tw, th = W / H, im.width / im.height
            if th > tw:
                nw = int(im.height * tw)
                im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
            else:
                nh = int(im.width / tw)
                im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
            im.resize((W, H), Image.LANCZOS).save(dest, quality=86, optimize=True)
            print(f"  OK {slug}.jpg  —  photo by {photo.get('photographer','unknown')}")
            done += 1
        except Exception as e:
            print(f"  x  {slug}: {e}"); failed += 1

    print(f"\nSaved {done}, skipped {skipped}, failed {failed}.")
    print(f"Folder: {out_dir}")
    print("Refresh any industry page to see them.")
    print("\nStill to do by hand: assets/news/istanbul.jpg and assets/news/kyiv.jpg —")
    print("those are your own event photos, no stock library has them.")

if __name__ == "__main__":
    main()
