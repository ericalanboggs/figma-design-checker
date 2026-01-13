# athenahealth Design Checker

A Figma plugin that audits design files against a standardized checklist, helping designers maintain file quality and consistency at athenahealth.

## Features

The plugin automatically checks your designs for:

- **Semantic Naming**: Flags non-descriptive names like "Frame 123" or "Group 456"
- **Auto-layout**: Detects frames that should use auto-layout for responsive designs
- **Variables & Styles**: Identifies hardcoded colors, unlinked text styles, and unlinked effect styles
- **Components**: Finds duplicate component names
- **Layer Hierarchy**: Flags groups that should be frames and warns on deep nesting (8+ levels)
- **Spacing & Pixels**: Detects sub-pixel values and spacing not aligned to 8px grid
- **Documentation**: Checks for Cover frame on first page

## Installation

### Development Mode

1. Clone this repository:
   ```bash
   git clone https://github.com/ericalanboggs/figma-design-checker
   cd figma-design-checker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. In Figma:
   - Go to **Plugins** → **Development** → **Import plugin from manifest**
   - Select the `manifest.json` file from this directory

### Publishing (Internal Use)

To make it available to your athenahealth team:
1. Open Figma
2. Go to **Plugins** → **Development** → **Publish new plugin**
3. Choose **"Only members of [organization]"**
4. Fill in details and publish

## Usage

1. Open a Figma file
2. Select the layers you want to check (or leave empty to check the entire page)
3. Run **Plugins** → **athenahealth Design Checker**
4. Click **Run Checks**
5. Review violations grouped by category
6. Click any violation to jump to that layer in Figma

## Development

```bash
npm run build      # Build plugin to dist/
npm run dev        # Build with watch mode for development
npm run typecheck  # Run TypeScript type checking
```

After making changes, rebuild and reload the plugin in Figma.

## Project Structure

```
src/
├── main.ts              # Plugin entry point (runs in Figma sandbox)
├── ui.html              # Results panel UI (vanilla HTML/JS)
└── checks/
    ├── naming.ts        # Semantic naming checker
    ├── autolayout.ts    # Auto-layout checker
    ├── styles.ts        # Variables & styles checker
    ├── components.ts    # Components checker
    ├── hierarchy.ts     # Layer hierarchy checker
    ├── spacing.ts       # Spacing & pixels checker
    └── cover.ts         # Cover/documentation checker
```

## Adding Custom Checks

See [CLAUDE.md](./CLAUDE.md) for detailed instructions on adding new checkers.

## License

MIT
