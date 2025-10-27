# Publishing to npm

This guide explains how to publish `own-orm` to the npm registry.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://npmjs.com)
2. **npm Login**: 
   ```bash
   npm login
   # Enter your username, password, and email
   ```
3. **Verify Git Status**: Ensure all changes are committed
   ```bash
   git status
   # Should show "nothing to commit, working tree clean"
   ```

## Pre-Publication Checklist

- [x] **Build**: Run `npm run build` - ensures dist/ is up to date
- [x] **Documentation**: README.md, CONTRIBUTING.md, ARCHITECTURE.md are complete
- [x] **Tests**: Run examples to verify functionality
- [x] **Package Size**: npm pack shows ~11.8 kB (acceptable size)
- [x] **License**: MIT license included
- [x] **Version**: Correct version in package.json

## Step-by-Step Publication

### 1. Update Version (if needed)

For patch releases (1.0.1):
```bash
npm version patch
```

For minor releases (1.1.0):
```bash
npm version minor
```

For major releases (2.0.0):
```bash
npm version major
```

This will:
- Update package.json version
- Create a git tag
- Create a commit with the version number

### 2. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder and generates `.d.ts` type definitions.

### 3. Verify Package Contents

```bash
npm pack --dry-run
```

This shows exactly what will be published without creating a tarball. Look for:
- Package size around 11-15 kB
- Only `dist/` folder with compiled code
- LICENSE and README.md files
- NO source `.ts` files (except `.d.ts` definitions)
- NO examples or tests

### 4. Test Installation Locally (Optional)

```bash
npm pack
npm install ./own-orm-1.0.0.tgz --prefix test-install
```

Then verify it can be imported and used.

### 5. Publish to npm

```bash
npm publish
```

This will:
- Authenticate with npm
- Upload the package
- Make it available at https://npmjs.com/package/own-orm

### 6. Verify Publication

```bash
npm view own-orm
# or
npm info own-orm
```

Visit https://npmjs.com/package/own-orm to confirm publication.

## Post-Publication

### 1. Push Changes to Git

```bash
git push origin main --tags
```

### 2. Create GitHub Release

On GitHub:
- Go to Releases
- Create new release from the tag
- Copy changelog content as description
- Attach any relevant files

### 3. Update Documentation

- Update project website (if any)
- Announce on social media
- Update installation instructions in README

## Troubleshooting

### "npm ERR! 403 Forbidden"
- Package name already exists
- Solution: Change name in package.json or contact npm support

### "npm ERR! 401 Unauthorized"
- Not logged in to npm
- Solution: Run `npm login` and enter credentials

### "npm ERR! ENAMETOOLONG"
- Package name exceeds 214 characters
- Solution: Shorten package name

### Publishing Fails, But No Error
- Ensure all dependencies are installed: `npm install`
- Check internet connection
- Try again in a moment (npm servers may be busy)

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.1): Bug fixes, small improvements
- **MINOR** (1.1.0): New features, backward compatible
- **MAJOR** (2.0.0): Breaking changes

## Rollback

If something goes wrong after publishing:

```bash
npm unpublish own-orm@1.0.0 --force
```

**Warning**: Can only unpublish within 72 hours and only once per version.

## Maintenance After Publication

- Monitor npm downloads: https://npm-stat.com/charts.html?package=own-orm
- Respond to issues on GitHub
- Prepare patches for bug fixes
- Plan future versions and features
- Keep dependencies updated

## Continuous Integration (Optional)

For future automation:

1. **GitHub Actions**: Auto-publish on tag push
2. **Release Strategy**: Automatic version bumping
3. **Testing**: Run tests before publishing

Example GitHub Actions workflow:
```yaml
name: Publish
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Resources

- [npm Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npm CLI Reference](https://docs.npmjs.com/cli/v10/commands)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Current Status**: ✅ Ready to publish
**Package Size**: 11.8 kB (minified + gzipped)
**Total Files**: 36 files
**Latest Version**: 1.0.0
