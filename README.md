# @tananetwork/vite-plugin-tana

Vite plugin for building React web applications on the [Tana](https://tana.network) blockchain platform.

## Features

- **React 19 SSR** - Server-side rendering with React Server Components
- **Hot Module Replacement** - Instant updates during development
- **File-based routing** - `app/page.tsx`, `app/about/page.tsx`, etc.
- **TypeScript & Tailwind** - Full support out of the box
- **Deploy to blockchain** - Ship your site as an on-chain contract

## Quick Start

### 1. Install the Tana CLI

```bash
npm install -g @tananetwork/tana
```

### 2. Create a new website

```bash
tana new website my-site
cd my-site
```

### 3. Start development

```bash
npm run dev
```

Open http://localhost:5173 to see your site.

### 4. Deploy to blockchain

```bash
tana deploy website .
```

## Templates

Create a site from a template:

```bash
tana new website my-site --template blog
```

Available templates:
- `default` - Minimal starter with Tailwind
- `blog` - Blog with markdown support
- `marketing` - Landing page template
- `minimal` - Bare bones starter
- `portfolio` - Personal portfolio

## Project Structure

```
my-site/
├── app/
│   ├── page.tsx        # Home page (/)
│   ├── about/
│   │   └── page.tsx    # About page (/about)
│   └── layout.tsx      # Root layout
├── public/             # Static assets
├── vite.config.ts      # Vite configuration
└── package.json
```

## Documentation

Full documentation at [tana.network/docs](https://tana.network/docs)

## License

MIT
