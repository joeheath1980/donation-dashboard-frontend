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