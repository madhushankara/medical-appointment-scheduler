# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please open a private GitHub Security Advisory rather than a public issue.

---

## ⚠️ Exposed Secrets — Required Actions

If any credentials (API tokens, JWT secrets, etc.) were committed to this repository's history, you **must** complete **all** of the following steps.

### 1. Rotate every exposed credential immediately

| Credential | Where to rotate |
|---|---|
| HuggingFace API token | https://huggingface.co/settings/tokens — delete the old token and create a new one |
| JWT secret | Generate a new random string (`openssl rand -hex 32`) and update it in Heroku: `heroku config:set JWT_SECRET=<new_value> --app medical-scheduler-api` |
| EmailJS public key | Regenerate in your EmailJS dashboard under Account → API Keys |

> **Rotating the key makes the old one useless even if someone already copied it from Git history.**

### 2. Purge secrets from Git history

Removing a secret from a file does **not** remove it from past commits.  
Use one of the following tools to rewrite history:

#### Option A — `git filter-repo` (recommended)

```bash
pip install git-filter-repo

# Create a replacements file — one "old==>new" pattern per exposed secret:
echo "<YOUR_OLD_HUGGINGFACE_TOKEN>==>REMOVED_HF_TOKEN" > /tmp/replacements.txt
echo "<YOUR_OLD_JWT_SECRET>==>REMOVED_JWT_SECRET" >> /tmp/replacements.txt
echo "<YOUR_OLD_EMAILJS_KEY>==>REMOVED_EMAILJS_KEY" >> /tmp/replacements.txt

git filter-repo --replace-text /tmp/replacements.txt

# Force-push all branches
git push --force --all origin
git push --force --tags origin
```

#### Option B — BFG Repo Cleaner

```bash
# Download from https://rtyley.github.io/bfg-repo-cleaner/
# List each exposed secret value (one per line) in a text file:
echo "<YOUR_OLD_HUGGINGFACE_TOKEN>" > /tmp/secrets.txt
echo "<YOUR_OLD_JWT_SECRET>" >> /tmp/secrets.txt
echo "<YOUR_OLD_EMAILJS_KEY>" >> /tmp/secrets.txt

java -jar bfg.jar --replace-text /tmp/secrets.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all origin
```

> ⚠️ Both options **rewrite commit SHAs**. All collaborators must re-clone the repository afterwards.

### 3. Check for forks

If the repository was ever public, assume the secrets were copied by anyone who forked or cloned it before you rotated them. Rotating the credentials (step 1) is the only reliable mitigation.

### 4. Enable GitHub secret scanning

Go to **Settings → Security → Secret scanning** and enable alerts so GitHub will warn you automatically if a secret is pushed in the future.

---

## Preventing future leaks

- **Never** hardcode secrets in source files or scripts.
- Store all secrets in environment variables (Heroku config vars, `.env` files that are git-ignored).
- Copy `.env.example` to `.env` locally and fill in real values — never commit `.env`.
- Consider a pre-commit hook (e.g. [detect-secrets](https://github.com/Yelp/detect-secrets)) to block accidental commits.
