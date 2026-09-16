# Deploying zirconoid.com

The site is static. GitHub Actions builds it and publishes `dist/` to GitHub Pages. Cloudflare holds the DNS for `zirconoid.com` and points it at GitHub.

## One-time setup on GitHub

GitHub Pages is free for **public** repos. For a **private** repo it needs GitHub Pro, Team or Enterprise. On a Free account with a private repo the deploy fails at `actions/configure-pages` with `Resource not accessible by integration (403)`. Either make the repo public (**Settings > General > Danger Zone > Change visibility**) or upgrade the account.

1. Push this repo to GitHub (`nparikh211/zirconoid`, branch `main`).
2. Run the deploy: it happens on every push to `main`, or start it by hand under **Actions > Deploy to GitHub Pages > Run workflow**. The workflow creates the Pages site with **Source: GitHub Actions** and tries to set the custom domain to `zirconoid.com`.
3. Check **Settings > Pages**. If **Custom domain** is empty, enter `zirconoid.com` and save.
4. Tick **Enforce HTTPS** once the DNS check passes (it can take a few minutes after the records below exist).

Pull requests run `.github/workflows/ci.yml` (build, link check, Playwright) but do not deploy.

## DNS on Cloudflare

In the Cloudflare dashboard for `zirconoid.com`, go to **DNS > Records** and add:

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `nparikh211.github.io` | DNS only |

Notes:

- Keep the proxy **off** (grey cloud) for all of these. GitHub issues the TLS certificate for the custom domain and needs to see the origin records. Once HTTPS works on GitHub you can switch the proxy on if you want Cloudflare in front; if you do, set **SSL/TLS** to **Full (strict)** or you will get a redirect loop.
- These are GitHub's published Pages IPs. If they ever change, the current list is at https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Remove any old A, AAAA or CNAME records for `@` and `www` left over from the registrar's parking page.
- GitHub redirects `www.zirconoid.com` to `zirconoid.com` because the `CNAME` file holds the apex domain.

## Check it

- `dig +short zirconoid.com A` should return the four GitHub addresses.
- `https://zirconoid.com` should load the site with a valid certificate.
- `https://zirconoid.com/sitemap.xml` and `/robots.txt` should be reachable.
- `https://zirconoid.com/anything-missing/` should show the site's own 404 page.

## Email

The site links to `data@zirconoid.com`. That mailbox needs its own MX records in Cloudflare; nothing here sets it up.

## Building locally

```sh
npm install
npm run build
npm run serve     # http://localhost:4173
```
