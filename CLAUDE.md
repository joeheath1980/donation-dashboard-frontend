# Frontend Claude Instructions

## Related Backend
- Backend location: `/Users/josephheath/giving-dashboard`
- Backend runs on: http://localhost:3002 (dev) / https://do-nation.space (prod)
- API documentation: See `/Users/josephheath/giving-dashboard/SHARED_API_SPECS.md`

## Frontend Overview
This is the React frontend for the Do-Nation giving dashboard.

## Development Setup
```bash
npm start  # Runs on http://localhost:3000
```

## API Integration
- All API calls go to `process.env.REACT_APP_API_URL || 'http://localhost:3002'`
- Authentication uses JWT tokens stored in localStorage
- See `src/services/api.js` for API client configuration

## When Working on Full-Stack Features
1. Start backend first: `cd /Users/josephheath/giving-dashboard && npm start`
2. Start frontend: `cd /Users/josephheath/donation-dashboard && npm start`
3. Update SHARED_API_SPECS.md with new endpoints
4. Test API with Postman before frontend integration

## DEPLOYMENT INSTRUCTIONS - CRITICAL
**IMPORTANT**: Do NOT use `npm run deploy` or GitHub Pages deployment!

### Correct Deployment Process:
1. **Build locally**: `npm run build`
2. **Deploy to production**: Use the deployment guide at `/Users/josephheath/giving-dashboard/docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md`
3. **Production URL**: https://do-nation.space (NOT GitHub Pages)

### Git Workflow:
- **Push code**: `git push origin <branch-name>` (YES - always push to GitHub)
- **Deploy**: Follow COMPLETE_DEPLOYMENT_GUIDE.md (NO GitHub Pages)
- The `npm run deploy` script in package.json should NOT be used - it deploys to GitHub Pages which we don't use

### Server Details:
- **Server**: ubuntu@54.156.33.223
- **Frontend Directory**: /var/www/donation-dashboard
- **Backend Directory**: /home/ubuntu/giving-dashboard
- **SSH Key**: /Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem