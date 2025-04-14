import { test, expect } from '@playwright/test';

// Update this to your actual frontend URL
const appUrl = 'https://witty-water-006f88503.6.azurestaticapps.net';

test('can add and then delete a course', async ({ page }) => {
  // Navigate to the application
  await page.goto(appUrl);
  
  // Navigate to Courses page
  await page.click('text=Courses');
  
  // Generate a unique course name using timestamp
  const courseName = `Test Course ${Date.now()}`;
  
  // Fill the form
  await page.fill('input[placeholder="Course name"]', courseName);
  await page.fill('input[placeholder="Course link"]', 'https://example.com');
  await page.fill('input[placeholder="Study hours"]', '3');
  
  // Submit the form
  await page.click('button:has-text("Add Course")');
  
  // Wait for the course to appear in the list
  await page.waitForSelector(`text=${courseName}`);
  
  // Verify the course appears in the list
  const courseElement = page.locator(`text=${courseName}`).first();
  await expect(courseElement).toBeVisible();
  
  // Find and click the delete button for the course
  // This assumes there's a delete button in each course item
  const courseItem = courseElement.locator('..').locator('..');
  await courseItem.locator('button:has-text("Delete")').click();
  
  // Verify the course is removed
  await expect(page.locator(`text=${courseName}`)).toHaveCount(0);
});
