# Contributing Guide

Thanks for your interest in contributing! This document describes how to work on the frontend safely and consistently.

## Workflow
- Create a feature branch from `main`.
- Write clear commits using Conventional Commits (e.g., `feat:`, `fix:`, `docs:`).
- Add/update tests where practical.
- Update documentation for user‑visible or security‑relevant changes.
- Open a Pull Request; expect code review with a security checklist.

## Coding Standards
- React 18 with function components and hooks.
- CSS Modules for styles; avoid inline styles for CSP compliance.
- No `dangerouslySetInnerHTML`; use the sanitizer helpers if HTML is needed.
- Use `apiClient` (axios instance) rather than raw `fetch`/`axios` for requests.
- Use `SecureTokenStorage` / `getAuthHeaders` for Authorization.
- Avoid persisting tokens in localStorage.

## Security Checklist (PR Gate)
- No new token reads/writes to `localStorage`.
- No new inline scripts/styles; CSP remains compatible.
- No usage of `eval`, `new Function`, or string‑built `setTimeout/Interval`.
- Any HTML sinks use `sanitizeHTML` or escape routines.
- API calls go through `apiClient` (adds CSRF and Authorization consistently).
- Secrets are not committed; use environment variables.

## Running Locally
```bash
npm install
npm start
npm test
```

## Security Scans in CI
- NPM Audit runs on push/PR
- Semgrep SAST runs on push/PR
- ZAP Baseline available via workflow dispatch against staging

