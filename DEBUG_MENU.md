# Debug Menu - Temporary Testing Guide

This debug menu (🧪 button on home screen) provides tools to manually test the challenge system without needing to actually walk or take photos.

## Features Available

### Challenge Generation
- **Generate Random Challenge** - Creates a new random movement or photo challenge with today's deadline

### Validation Testing
- **Complete Active Challenge** - Marks the current active challenge as "completed"
- **Simulate Wrong Validation** - For testing in the challenge detail view (just go to the challenge and manually test the validation)

### Deadline Testing  
- **Mark Active as Expired** - Simulates a challenge deadline passing, marks it as "expired"

### Stats Display
Shows current counts of all challenges by status

### Danger Zone
- **Clear All Storage** - Deletes all challenges from storage (requires confirmation)

## Typical Test Workflow

1. Open app → Click 🧪 debug button
2. Click "Generate Random Challenge"
3. Go back to home or view in "Today's Challenge" card
4. Click "Start Challenge" or go to "View All Challenges"
5. Test the challenge detail screen manually:
   - For **movement**: Click buttons, see progress (even without GPS)
   - For **photo**: Camera button available
6. Use debug menu buttons to simulate outcomes:
   - ✅ Complete active challenge
   - ⏰ Mark as expired/missed

## Notes

- All data is persisted to AsyncStorage
- Changes are saved automatically
- Debug menu is temporary - should be removed before production
- Look for `setDebugVisible(false)` in `app/index.tsx` to disable the debug button
