import { test, expect } from '@playwright/test';
import { calculateStay } from '../src/booking.js';
test('stay rules cover capacity, dates, pets and the full price', () => {
  const valid = {
    cabin: 'lake',
    arrival: '2026-10-24',
    departure: '2026-10-26',
    guests: 2,
    dog: false,
  };
  expect(calculateStay(valid, '2026-09-07')).toMatchObject({
    nights: 2,
    total: 390,
  });
  expect(
    calculateStay(
      { ...valid, cabin: 'woodland', guests: 4, dog: true },
      '2026-09-07',
    ),
  ).toMatchObject({ total: 515 });
  expect(calculateStay({ ...valid, guests: 3 }, '2026-09-07').error).toContain(
    'up to 2',
  );
  expect(calculateStay({ ...valid, dog: true }, '2026-09-07').error).toContain(
    'pet-free',
  );
  expect(
    calculateStay({ ...valid, departure: '2026-10-25' }, '2026-09-07').error,
  ).toContain('two nights');
  expect(
    calculateStay({ ...valid, departure: '2026-11-25' }, '2026-09-07').error,
  ).toContain('21 nights');
  expect(
    calculateStay({ ...valid, arrival: '2026-02-30' }, '2026-01-01').error,
  ).toContain('valid calendar');
  expect(calculateStay(valid, '2026-11-01').error).toContain('today or later');
});
test('booking planner validates and saves a real downloadable quote', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.header-book').click();
  await expect(
    page.getByRole('dialog', { name: 'Plan your escape.' }),
  ).toBeVisible();
  await page.getByLabel('Your place').selectOption('woodland');
  await page
    .getByRole('combobox', { name: 'Guests', exact: true })
    .selectOption('4');
  await page.getByLabel('Bringing a dog').check();
  await expect(page.locator('#stay-total')).toHaveText('€515');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save stay plan' }).click();
  expect((await download).suggestedFilename()).toBe('verde-stay-plan.txt');
  await expect(page.locator('#booking-success')).toContainText(
    'not a confirmed reservation',
  );
  await page.screenshot({ path: 'docs/screenshots/stay-planner.png' });
  await page.getByLabel('Your place').selectOption('lake');
  await expect(
    page.getByRole('button', { name: 'Save stay plan' }),
  ).toBeDisabled();
  await expect(page.locator('#booking-error')).not.toBeEmpty();
  await page.keyboard.press('Escape');
  await expect(page.locator('#booking-dialog')).not.toBeVisible();
});
test('gallery keyboard navigation and FAQ disclosure work', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Next gallery image' }).click();
  await expect(page.locator('#gallery-count')).toHaveText('02 / 02');
  await page.getByRole('button', { name: 'Enlarge gallery image' }).click();
  await expect(page.locator('#lightbox')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-caption')).toContainText('Lake House');
  await page.screenshot({ path: 'docs/screenshots/gallery.png' });
  await page.keyboard.press('Escape');
  await page.getByText('Can we bring our dog?', { exact: true }).click();
  await expect(
    page.getByText('Well-behaved dogs are welcome', { exact: false }),
  ).toBeVisible();
});
for (const width of [360, 768, 1440, 2560]) {
  test('responsive layout and screenshot at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (width === 360) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await expect(page.locator('#navigation')).toBeVisible();
      await page
        .locator('#navigation')
        .getByRole('link', { name: 'Our places' })
        .click();
      await expect(page.locator('#navigation')).not.toBeVisible();
      await page.evaluate(() => scrollTo(0, 0));
    }
    await page.screenshot({
      path:
        'docs/screenshots/' +
        (width === 360
          ? 'mobile'
          : width === 1440
            ? 'desktop'
            : 'responsive-' + width) +
        '.png',
      fullPage: width === 360 || width === 1440,
    });
  });
}
test('local links, images and browser runtime are healthy', async ({
  page,
  request,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('main')).toHaveCount(1);
  for (const href of await page
    .locator('a[href]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')))) {
    if (href.startsWith('#') && href.length > 1)
      expect(await page.locator(href).count()).toBe(1);
    else if (href.startsWith('./'))
      expect((await request.get(href)).ok()).toBeTruthy();
  }
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0))
      .toBeTruthy();
  }
  expect(
    await page
      .locator('main img')
      .evaluateAll((images) =>
        images.every((img) => img.alt && img.complete && img.naturalWidth > 0),
      ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
