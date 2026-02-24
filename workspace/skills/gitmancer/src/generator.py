from pathlib import Path
import argparse


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--type", default="app")
    ap.add_argument("--out", default="./out")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    readme = out / "README.md"
    readme.write_text(f"# {args.project}\n\nGenerated starter for type: {args.type}\n", encoding="utf-8")
    print(f"Generated: {readme}")


if __name__ == "__main__":
    main()
