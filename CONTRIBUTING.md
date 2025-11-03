# Contributing to Course Management Platform

First off, thank you for considering contributing to this project! 🎉

Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

---

## Code of Conduct

This project and everyone participating in it is governed by our commitment to:

- 🤝 Be respectful and inclusive
- 💬 Use welcoming and inclusive language
- 🎯 Focus on what is best for the community
- 🤗 Show empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- Git
- PostgreSQL (Supabase recommended)
- Basic knowledge of Next.js, React, and TypeScript

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/my-course-managment-webiste.git
cd my-course-managment-webiste

# 3. Add upstream remote
git remote add upstream https://github.com/DreamerX00/my-course-managment-webiste.git

# 4. Install dependencies
npm install

# 5. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 6. Set up database
npx prisma generate --no-engine
npx prisma db push

# 7. Run development server
npm run dev
```

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Detailed steps to reproduce the issue
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Screenshots** - If applicable
- **Environment** - OS, browser, Node version, etc.

**Bug Report Template:**

```markdown
### Description

[Clear description of the bug]

### Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happens]

### Environment

- OS: [e.g., Windows 11, macOS 14]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node Version: [e.g., 20.11.0]

### Screenshots

[If applicable]
```

### 💡 Suggesting Features

Feature suggestions are tracked as GitHub issues. Provide:

- **Clear title** - Concise feature description
- **Problem statement** - What problem does this solve?
- **Proposed solution** - How would you implement it?
- **Alternatives considered** - Other approaches you've thought about
- **Additional context** - Mockups, examples, etc.

### 📝 Improving Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or grammatical errors
- Adding examples or clarifications
- Creating tutorials or guides
- Translating documentation

### 🎨 Design Contributions

Have design ideas? We'd love to see them!

- UI/UX improvements
- New component designs
- Accessibility enhancements
- Mobile responsiveness improvements

---

## Development Workflow

### Branch Strategy

We use a simplified Git workflow:

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (your work)
```

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Commit with conventional commits
git add .
git commit -m "feat: add your feature"

# Push to your fork
git push origin feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

**Examples:**

- `feature/add-video-upload`
- `fix/quiz-scoring-bug`
- `docs/update-api-reference`
- `refactor/improve-progress-api`

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, missing semi-colons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, CI, etc.)

### Examples

**Good commits:**

```bash
feat(auth): add Google OAuth login
fix(quiz): correct score calculation for multiple choice questions
docs(api): update enrollment endpoint documentation
refactor(progress): simplify progress calculation logic
perf(api): optimize database queries for leaderboard
test(quiz): add unit tests for quiz submission
chore(deps): update Next.js to version 15.3.3
```

**Bad commits:**

```bash
❌ updated stuff
❌ fix bug
❌ WIP
❌ changes
```

### Commit Message Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after the first line

---

## Pull Request Process

### Before Submitting

1. ✅ Ensure your code follows the style guide
2. ✅ Update documentation if needed
3. ✅ Add tests for new features
4. ✅ Run `npm run lint` - No linting errors
5. ✅ Run `npx tsc --noEmit` - No TypeScript errors
6. ✅ Run `npm run build` - Build succeeds
7. ✅ Test your changes thoroughly

### Submitting a Pull Request

```bash
# 1. Update your branch with latest main
git checkout main
git pull upstream main
git checkout feature/your-feature
git rebase main

# 2. Push to your fork
git push origin feature/your-feature

# 3. Go to GitHub and create Pull Request
```

### Pull Request Template

```markdown
## Description

[Describe your changes]

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?

[Describe the tests you ran]

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)

[Add screenshots]

## Related Issues

Closes #[issue number]
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs automatically
2. **Code Review** - Maintainers review your code
3. **Changes Requested** - Address feedback if needed
4. **Approval** - Once approved, PR will be merged
5. **Merge** - Squash and merge to main

---

## Style Guide

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use meaningful variable names
- Add JSDoc comments for functions
- Prefer `const` over `let`
- Use arrow functions

**Example:**

```typescript
/**
 * Calculate user's course completion percentage
 * @param completedItems - Number of completed chapters/subchapters
 * @param totalItems - Total number of items in course
 * @returns Completion percentage (0-100)
 */
const calculateProgress = (
  completedItems: number,
  totalItems: number
): number => {
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
};
```

### React Components

- Use functional components with hooks
- One component per file
- Use TypeScript interfaces for props
- Extract reusable logic to custom hooks

**Example:**

```typescript
interface CourseCardProps {
  title: string;
  description: string;
  thumbnail?: string;
  onEnroll: () => void;
}

export function CourseCard({
  title,
  description,
  thumbnail,
  onEnroll,
}: CourseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {thumbnail && <img src={thumbnail} alt={title} />}
      </CardContent>
      <CardFooter>
        <Button onClick={onEnroll}>Enroll Now</Button>
      </CardFooter>
    </Card>
  );
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use shadcn/ui components when possible
- Maintain consistent spacing

### File Naming

- **Components:** PascalCase - `CourseCard.tsx`
- **Utilities:** camelCase - `formatDate.ts`
- **API Routes:** kebab-case - `[course-id]/route.ts`
- **Types:** PascalCase - `UserProfile.ts`

### Folder Structure

- Keep related files together
- Use index files for exports
- Separate concerns (UI, logic, data)

---

## Testing Guidelines

### Writing Tests

We use Jest and React Testing Library:

```typescript
import { render, screen } from "@testing-library/react";
import { CourseCard } from "./CourseCard";

describe("CourseCard", () => {
  it("renders course title and description", () => {
    render(
      <CourseCard
        title="Test Course"
        description="Test Description"
        onEnroll={jest.fn()}
      />
    );

    expect(screen.getByText("Test Course")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for 80%+ coverage
- Test critical paths
- Test error handling
- Test edge cases

---

## Documentation Guidelines

### Code Comments

- Write self-documenting code first
- Add comments for complex logic
- Use JSDoc for functions
- Keep comments up to date

### README Updates

When adding features, update:

- Features list
- API documentation
- Installation steps (if changed)
- Screenshots (if UI changed)

---

## Questions?

- 📧 Email: myviewrs123@gmail.com
- 📱 Phone: +91 8851819851
- 👤 Contact: DreamerX
- 💬 Discord: [Join our community](https://discord.gg/your-server)
- 📖 Documentation: [Full Docs](./documents)
- 🐛 Issues: [GitHub Issues](https://github.com/DreamerX00/my-course-managment-webiste/issues)

---

## Recognition

Contributors will be:

- 🌟 Listed in our [Contributors](https://github.com/DreamerX00/my-course-managment-webiste/graphs/contributors) page
- 🎉 Mentioned in release notes
- 💝 Appreciated in our community

---

**Thank you for contributing!** 🙏

Together, we're building something amazing! 🚀
