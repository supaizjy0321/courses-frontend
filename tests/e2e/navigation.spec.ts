import { test, expect } from '@playwright/test';

// Update this to your actual frontend URL
const appUrl = 'https://witty-water-006f88503.6.azurestaticapps.net';

test('navigation between pages works correctly', async ({ page }) => {
  // Navigate to the application
  await page.goto(appUrl);
  
  // Verify we're on the homepage
  await expect(page).toHaveTitle(/Courses App/);
  
  // Navigate to Courses page
  await page.click('text=Courses');
  
  // Verify that we're on the Courses page
  await expect(page.locator('h2')).toContainText('Courses');
  
  // Navigate to Calendar page
  await page.click('text=Calendar');
  
  // Verify that we're on the Calendar page
  await expect(page.locator('h2')).toContainText('Calendar');
});
